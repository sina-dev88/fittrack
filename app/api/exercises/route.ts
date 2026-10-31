import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() ?? "";
    const muscle = searchParams.get("muscle")?.trim() ?? "";
    const equipment = searchParams.get("equipment")?.trim() ?? "";
    const difficulty = searchParams.get("difficulty")?.trim() ?? "";

    const exercises = await prisma.exercise.findMany({
      where: {
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  primaryMuscle: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  secondaryMuscles: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(muscle
          ? {
              primaryMuscle: {
                equals: muscle,
                mode: "insensitive",
              },
            }
          : {}),

        ...(equipment
          ? {
              equipment: {
                equals: equipment,
                mode: "insensitive",
              },
            }
          : {}),

        ...(difficulty
          ? {
              difficulty: {
                equals: difficulty,
                mode: "insensitive",
              },
            }
          : {}),
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        primaryMuscle: true,
        secondaryMuscles: true,
        equipment: true,
        difficulty: true,
        description: true,
        isCustom: true,
      },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("GET /api/exercises error:", error);

    return NextResponse.json(
      { error: "Failed to load exercises." },
      { status: 500 }
    );
  }
}
