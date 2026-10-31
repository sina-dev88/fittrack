import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    workoutId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Props
) {
  try {
    const { workoutId } = await params;

    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json(
        { error: "No user found." },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: user.id,
        status: "COMPLETED",
      },
      include: {
        sets: {
          where: {
            status: "COMPLETED",
          },
          include: {
            workoutExercise: {
              include: {
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    primaryMuscle: true,
                  },
                },
              },
            },
          },
          orderBy: [
            {
              workoutExerciseId: "asc",
            },
            {
              setNumber: "asc",
            },
          ],
        },
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Workout not found." },
        { status: 404 }
      );
    }

    const volume = workout.sets.reduce((total, set) => {
      return total + (set.weight ?? 0) * (set.reps ?? 0);
    }, 0);

    return NextResponse.json({
      id: workout.id,
      name: workout.name,
      status: workout.status,
      startedAt: workout.startedAt,
      completedAt: workout.completedAt,
      duration: workout.duration,
      calories: workout.calories,
      volume,
      sets: workout.sets,
    });
  } catch (error) {
    console.error("GET_WORKOUT_DETAILS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to load workout details." },
      { status: 500 }
    );
  }
}