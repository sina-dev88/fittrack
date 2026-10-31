import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkAchievements } from "@/lib/achievement-engine";

type Props = {
  params: Promise<{
    workoutId: string;
  }>;
};

function calculateEstimated1RM(weight: number, reps: number) {
  if (reps === 1) return weight;

  return weight * (1 + reps / 30);
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { workoutId } = await params;

    const body = await request.json();
    const { status } = body;

    if (status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Invalid workout status." },
        { status: 400 },
      );
    }

    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: session.user.id,
      },
      include: {
        sets: {
          where: {
            status: "COMPLETED",
          },
          include: {
            workoutExercise: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Workout not found." },
        { status: 404 },
      );
    }

    if (workout.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Workout is not in progress." },
        { status: 400 },
      );
    }

    const completedAt = new Date();

    const duration = workout.startedAt
      ? Math.max(
          0,
          Math.floor(
            (completedAt.getTime() -
              workout.startedAt.getTime()) /
              1000 /
              60,
          ),
        )
      : null;

    const updatedWorkout = await prisma.workout.update({
      where: {
        id: workoutId,
      },
      data: {
        status: "COMPLETED",
        completedAt,
        duration,
      },
      select: {
        id: true,
        name: true,
        status: true,
        startedAt: true,
        completedAt: true,
        duration: true,
        calories: true,
        workoutPlanId: true,
      },
    });

    // ----------------------------------------
    // Find best performance for each exercise
    // ----------------------------------------

    const groupedExercises = new Map<
      string,
      {
        exerciseId: string;
        exerciseName: string;
        weight: number;
        reps: number;
        estimated1RM: number;
      }
    >();

    for (const set of workout.sets) {
      if (
        !set.workoutExercise?.exercise ||
        set.weight === null ||
        set.reps === null ||
        set.weight <= 0 ||
        set.reps <= 0
      ) {
        continue;
      }

      const exercise = set.workoutExercise.exercise;

      const estimated1RM = calculateEstimated1RM(
        set.weight,
        set.reps,
      );

      const existing = groupedExercises.get(exercise.id);

      if (!existing || estimated1RM > existing.estimated1RM) {
        groupedExercises.set(exercise.id, {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          weight: set.weight,
          reps: set.reps,
          estimated1RM,
        });
      }
    }

    // ----------------------------------------
    // Create new Personal Records
    // ----------------------------------------

    const newRecords: {
      exercise: string;
      weight: number;
      reps: number;
      estimated1RM: number;
      recordId: string;
    }[] = [];

    for (const best of groupedExercises.values()) {
      const previousRecord =
        await prisma.personalRecord.findFirst({
          where: {
            userId: session.user.id,
            exerciseId: best.exerciseId,
          },
          orderBy: {
            estimated1RM: "desc",
          },
        });

      const previousBest =
        previousRecord?.estimated1RM ?? 0;

      if (best.estimated1RM > previousBest) {
        const record =
          await prisma.personalRecord.create({
            data: {
              userId: session.user.id,
              exerciseId: best.exerciseId,
              weight: best.weight,
              reps: best.reps,
              estimated1RM: best.estimated1RM,
              achievedAt: completedAt,
            },
          });

        newRecords.push({
          exercise: best.exerciseName,
          weight: best.weight,
          reps: best.reps,
          estimated1RM: best.estimated1RM,
          recordId: record.id,
        });
      }
    }

    // ----------------------------------------
    // Check achievements
    // ----------------------------------------

    const unlockedAchievements =
      await checkAchievements(session.user.id);

    return NextResponse.json({
      workout: updatedWorkout,
      newRecords,
      unlockedAchievements,
    });
  } catch (error) {
    console.error("FINISH_WORKOUT_ERROR", error);

    return NextResponse.json(
      {
        error: "Failed to finish workout.",
      },
      {
        status: 500,
      },
    );
  }
}
