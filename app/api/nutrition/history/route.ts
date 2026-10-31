import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(days: number) {
  const dates: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    dates.push(getDateKey(date));
  }

  return dates;
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    const requestedDays = Number(searchParams.get("days") ?? 7);

    const days = Math.min(
      Math.max(Number.isFinite(requestedDays) ? requestedDays : 7, 1),
      90,
    );

    const userId = session.user.id;
    const dateKeys = getDateRange(days);

    const nutritionDays = await prisma.nutritionDay.findMany({
      where: {
        userId,
        dateKey: {
          in: dateKeys,
        },
      },
      include: {
        meals: {
          include: {
            foods: true,
          },
        },
        waterLogs: true,
      },
      orderBy: {
        dateKey: "asc",
      },
    });

    const nutritionMap = new Map(
      nutritionDays.map((day) => [day.dateKey, day]),
    );

    const history = dateKeys.map((dateKey) => {
      const day = nutritionMap.get(dateKey);

      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;

      if (day) {
        for (const meal of day.meals) {
          for (const food of meal.foods) {
            calories += food.calories ?? 0;
            protein += food.protein ?? 0;
            carbs += food.carbs ?? 0;
            fat += food.fat ?? 0;
          }
        }
      }

      const water = day
        ? day.waterLogs.reduce(
            (total, log) => total + log.amountMl,
            0,
          )
        : 0;

      return {
        date: dateKey,

        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat),

        waterMl: water,

        targets: {
          calories: day?.calorieTarget ?? null,
          protein: day?.proteinTarget ?? null,
          carbs: day?.carbsTarget ?? null,
          fat: day?.fatTarget ?? null,
          water: day?.waterTargetMl ?? null,
        },
      };
    });

    const recordedDays = history.filter(
      (day) =>
        day.calories > 0 ||
        day.protein > 0 ||
        day.carbs > 0 ||
        day.fat > 0 ||
        day.waterMl > 0,
    );

    const average = (values: number[]) => {
      if (values.length === 0) return 0;

      return Math.round(
        values.reduce((sum, value) => sum + value, 0) /
          values.length,
      );
    };

    const averages = {
      calories: average(
        recordedDays.map((day) => day.calories),
      ),
      protein: average(
        recordedDays.map((day) => day.protein),
      ),
      carbs: average(
        recordedDays.map((day) => day.carbs),
      ),
      fat: average(
        recordedDays.map((day) => day.fat),
      ),
      waterMl: average(
        recordedDays.map((day) => day.waterMl),
      ),
    };

    return NextResponse.json({
      days,
      history,
      averages,
      recordedDays: recordedDays.length,
    });
  } catch (error) {
    console.error(
      "GET /api/nutrition/history error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to load nutrition history.",
      },
      { status: 500 },
    );
  }
}
