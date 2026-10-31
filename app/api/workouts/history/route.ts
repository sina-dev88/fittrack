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

    const workouts = await prisma.workout.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      orderBy: {
        completedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        status: true,
        startedAt: true,
        completedAt: true,
        duration: true,
        calories: true,
        createdAt: true,
        sets: {
          where: {
            status: "COMPLETED",
          },
          select: {
            weight: true,
            reps: true,
          },
        },
      },
    });

    const history = workouts.map((workout) => {
      const totalVolume = workout.sets.reduce(
        (total, set) => {
          return total + (set.weight ?? 0) * (set.reps ?? 0);
        },
        0
      );

      return {
        id: workout.id,
        name: workout.name,
        status: workout.status,
        startedAt: workout.startedAt,
        completedAt: workout.completedAt,
        duration: workout.duration,
        calories: workout.calories,
        sets: workout.sets.length,
        totalVolume,
      };
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET /api/workouts/history error:", error);

    return NextResponse.json(
      { error: "Failed to load workout history." },
      { status: 500 }
    );
  }
}