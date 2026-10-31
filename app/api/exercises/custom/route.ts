import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const primaryMuscle = String(
      body.primaryMuscle ?? ""
    ).trim();

    const secondaryMuscles =
      String(body.secondaryMuscles ?? "").trim() || null;

    const equipment =
      String(body.equipment ?? "").trim() || null;

    const difficulty =
      String(body.difficulty ?? "").trim() || null;

    const description =
      String(body.description ?? "").trim() || null;

    const instructions =
      String(body.instructions ?? "").trim() || null;

    const commonMistakes =
      String(body.commonMistakes ?? "").trim() || null;

    if (!name || !primaryMuscle) {
      return NextResponse.json(
        {
          error:
            "Exercise name and primary muscle are required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.exercise.findUnique({
      where: {
        name,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "An exercise with this name already exists.",
        },
        { status: 409 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        primaryMuscle,
        secondaryMuscles,
        equipment,
        difficulty,
        description,
        instructions,
        commonMistakes,
        isCustom: true,
      },
      select: {
        id: true,
        name: true,
        primaryMuscle: true,
        equipment: true,
        difficulty: true,
        isCustom: true,
      },
    });

    return NextResponse.json(exercise, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "POST /api/exercises/custom error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create exercise." },
      { status: 500 }
    );
  }
}
