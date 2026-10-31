import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

const validMealTypes = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
] as const;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const mealType = String(body.mealType ?? "");

    const servingSize =
      body.servingSize === null ||
      body.servingSize === undefined ||
      body.servingSize === ""
        ? null
        : String(body.servingSize).trim();

    const calories =
      body.calories === "" ||
      body.calories === null ||
      body.calories === undefined
        ? null
        : Number(body.calories);

    const protein =
      body.protein === "" ||
      body.protein === null ||
      body.protein === undefined
        ? null
        : Number(body.protein);

    const carbs =
      body.carbs === "" ||
      body.carbs === null ||
      body.carbs === undefined
        ? null
        : Number(body.carbs);

    const fat =
      body.fat === "" ||
      body.fat === null ||
      body.fat === undefined
        ? null
        : Number(body.fat);

    if (!name) {
      return NextResponse.json(
        { error: "Food name is required." },
        { status: 400 },
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Food name is too long." },
        { status: 400 },
      );
    }

    if (
      !validMealTypes.includes(
        mealType as (typeof validMealTypes)[number],
      )
    ) {
      return NextResponse.json(
        { error: "Invalid meal type." },
        { status: 400 },
      );
    }

    const nutrients = {
      calories,
      protein,
      carbs,
      fat,
    };

    for (const [key, value] of Object.entries(nutrients)) {
      if (
        value !== null &&
        (!Number.isFinite(value) || value < 0)
      ) {
        return NextResponse.json(
          { error: `Invalid ${key} value.` },
          { status: 400 },
        );
      }
    }

    const userId = session.user.id;
    const dateKey = getDateKey();

    const nutritionDay =
      await prisma.nutritionDay.upsert({
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
        },
        select: {
          id: true,
        },
      });

    const typedMealType =
      mealType as (typeof validMealTypes)[number];

    let meal = await prisma.meal.findFirst({
      where: {
        nutritionDayId: nutritionDay.id,
        type: typedMealType,
      },
      select: {
        id: true,
      },
    });

    if (!meal) {
      meal = await prisma.meal.create({
        data: {
          nutritionDayId: nutritionDay.id,
          type: typedMealType,
          name:
            typedMealType === "BREAKFAST"
              ? "Breakfast"
              : typedMealType === "LUNCH"
                ? "Lunch"
                : typedMealType === "DINNER"
                  ? "Dinner"
                  : "Snacks",
        },
        select: {
          id: true,
        },
      });
    }

    const food = await prisma.foodEntry.create({
      data: {
        mealId: meal.id,
        name,
        servingSize,
        calories,
        protein,
        carbs,
        fat,
      },
      select: {
        id: true,
        name: true,
        servingSize: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
      },
    });

    return NextResponse.json(food, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "POST /api/nutrition/foods error:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to add food." },
      { status: 500 },
    );
  }
}
