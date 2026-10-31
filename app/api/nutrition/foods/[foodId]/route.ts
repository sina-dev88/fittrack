import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const validMealTypes = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
] as const;

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ foodId: string }>;
  },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { foodId } = await context.params;
    const body = await request.json();

    const food = await prisma.foodEntry.findFirst({
      where: {
        id: foodId,
        meal: {
          nutritionDay: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        meal: {
          select: {
            nutritionDayId: true,
          },
        },
      },
    });

    if (!food) {
      return NextResponse.json(
        { error: "Food not found." },
        { status: 404 },
      );
    }

    const name = String(body.name ?? "").trim();
    const mealType = String(body.mealType ?? "");

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

    const parseNumber = (value: unknown) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return null;
      }

      const number = Number(value);

      if (!Number.isFinite(number) || number < 0) {
        throw new Error("INVALID_NUMBER");
      }

      return number;
    };

    let calories: number | null;
    let protein: number | null;
    let carbs: number | null;
    let fat: number | null;

    try {
      calories = parseNumber(body.calories);
      protein = parseNumber(body.protein);
      carbs = parseNumber(body.carbs);
      fat = parseNumber(body.fat);
    } catch {
      return NextResponse.json(
        { error: "Invalid nutrition value." },
        { status: 400 },
      );
    }

    const servingSize =
      body.servingSize === null ||
      body.servingSize === undefined ||
      body.servingSize === ""
        ? null
        : String(body.servingSize).trim();

    const typedMealType =
      mealType as (typeof validMealTypes)[number];

    const mealNames = {
      BREAKFAST: "Breakfast",
      LUNCH: "Lunch",
      DINNER: "Dinner",
      SNACK: "Snacks",
    } as const;

    // Find or create the target meal
    let targetMeal = await prisma.meal.findFirst({
      where: {
        nutritionDayId: food.meal.nutritionDayId,
        type: typedMealType,
      },
      select: {
        id: true,
      },
    });

    if (!targetMeal) {
      targetMeal = await prisma.meal.create({
        data: {
          nutritionDayId: food.meal.nutritionDayId,
          type: typedMealType,
          name: mealNames[typedMealType],
        },
        select: {
          id: true,
        },
      });
    }

    const updatedFood = await prisma.foodEntry.update({
      where: {
        id: foodId,
      },
      data: {
        mealId: targetMeal.id,
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
        meal: {
          select: {
            type: true,
          },
        },
      },
    });

    return NextResponse.json(updatedFood);
  } catch (error) {
    console.error(
      "PATCH /api/nutrition/foods/[foodId] error:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to update food." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ foodId: string }>;
  },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { foodId } = await context.params;

    const food = await prisma.foodEntry.findFirst({
      where: {
        id: foodId,
        meal: {
          nutritionDay: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!food) {
      return NextResponse.json(
        { error: "Food not found." },
        { status: 404 },
      );
    }

    await prisma.foodEntry.delete({
      where: {
        id: foodId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/nutrition/foods/[foodId] error:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to delete food." },
      { status: 500 },
    );
  }
}

