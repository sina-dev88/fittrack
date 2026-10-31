import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function parseTarget(
  value: unknown,
  fieldName: string,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    throw new Error(
      `Invalid ${fieldName} target.`,
    );
  }

  return number;
}

export async function PATCH(
  request: Request,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    let calorieTarget: number | null;
    let proteinTarget: number | null;
    let carbsTarget: number | null;
    let fatTarget: number | null;
    let waterTargetMl: number | null;

    try {
      calorieTarget = parseTarget(
        body.calories,
        "calorie",
      );

      proteinTarget = parseTarget(
        body.protein,
        "protein",
      );

      carbsTarget = parseTarget(
        body.carbs,
        "carbs",
      );

      fatTarget = parseTarget(
        body.fat,
        "fat",
      );

      waterTargetMl = parseTarget(
        body.water,
        "water",
      );
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid target value.",
        },
        { status: 400 },
      );
    }

    // Reasonable upper limits
    if (
      calorieTarget !== null &&
      calorieTarget > 10000
    ) {
      return NextResponse.json(
        {
          error:
            "Calorie target cannot exceed 10,000 kcal.",
        },
        { status: 400 },
      );
    }

    if (
      proteinTarget !== null &&
      proteinTarget > 1000
    ) {
      return NextResponse.json(
        {
          error:
            "Protein target cannot exceed 1,000 g.",
        },
        { status: 400 },
      );
    }

    if (
      carbsTarget !== null &&
      carbsTarget > 1500
    ) {
      return NextResponse.json(
        {
          error:
            "Carbohydrate target cannot exceed 1,500 g.",
        },
        { status: 400 },
      );
    }

    if (
      fatTarget !== null &&
      fatTarget > 500
    ) {
      return NextResponse.json(
        {
          error:
            "Fat target cannot exceed 500 g.",
        },
        { status: 400 },
      );
    }

    if (
      waterTargetMl !== null &&
      waterTargetMl > 10000
    ) {
      return NextResponse.json(
        {
          error:
            "Water target cannot exceed 10,000 ml.",
        },
        { status: 400 },
      );
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
        update: {
          calorieTarget,
          proteinTarget,
          carbsTarget,
          fatTarget,
          waterTargetMl,
        },
        create: {
          userId,
          dateKey,
          calorieTarget,
          proteinTarget,
          carbsTarget,
          fatTarget,
          waterTargetMl,
        },
        select: {
          calorieTarget: true,
          proteinTarget: true,
          carbsTarget: true,
          fatTarget: true,
          waterTargetMl: true,
        },
      });

    return NextResponse.json({
      calories: nutritionDay.calorieTarget,
      protein: nutritionDay.proteinTarget,
      carbs: nutritionDay.carbsTarget,
      fat: nutritionDay.fatTarget,
      water: nutritionDay.waterTargetMl,
    });
  } catch (error) {
    console.error(
      "PATCH /api/nutrition/targets error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update nutrition targets.",
      },
      { status: 500 },
    );
  }
}
