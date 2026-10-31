
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

const nutritionDayInclude = {
  meals: {
    orderBy: {
      createdAt: "asc" as const,
    },
    include: {
      foods: {
        orderBy: {
          createdAt: "asc" as const,
        },
      },
    },
  },
  waterLogs: {
    orderBy: {
      loggedAt: "asc" as const,
    },
  },
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const dateKey = getDateKey();

    // Atomically find today's nutrition record or create it.
    // The compound unique constraint prevents duplicate daily records.
    const nutritionDay = await prisma.nutritionDay.upsert({
      where: {
        userId_dateKey: {
          userId,
          dateKey,
        },
      },
      update: {},
      create: {
        userId,
        dateKey,
        waterTargetMl: 2500,
      },
      include: nutritionDayInclude,
    });

    const totals = nutritionDay.meals.reduce<NutritionTotals>(
      (total, meal) => {
        for (const food of meal.foods) {
          total.calories += food.calories ?? 0;
          total.protein += food.protein ?? 0;
          total.carbs += food.carbs ?? 0;
          total.fat += food.fat ?? 0;
        }

        return total;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    );

    const water = nutritionDay.waterLogs.reduce<number>(
      (total, log) => total + log.amountMl,
      0,
    );

    return NextResponse.json({
      date: nutritionDay.dateKey,

      targets: {
        calories: nutritionDay.calorieTarget,
        protein: nutritionDay.proteinTarget,
        carbs: nutritionDay.carbsTarget,
        fat: nutritionDay.fatTarget,
        water: nutritionDay.waterTargetMl,
      },

      totals,

      water: {
        totalMl: water,
      },

      meals: nutritionDay.meals,
    });
  } catch (error) {
    console.error("GET /api/nutrition error:", error);

    return NextResponse.json(
      { error: "Failed to load nutrition data." },
      { status: 500 },
    );
  }
}
