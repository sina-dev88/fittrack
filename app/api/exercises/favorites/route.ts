import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const favorites = await prisma.favoriteExercise.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        exercise: {
          select: {
            id: true,
            name: true,
            primaryMuscle: true,
            secondaryMuscles: true,
            equipment: true,
            difficulty: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(
      favorites.map((item) => item.exercise)
    );
  } catch (error) {
    console.error("GET /api/exercises/favorites error:", error);

    return NextResponse.json(
      { error: "Failed to load favorite exercises." },
      { status: 500 }
    );
  }
}
