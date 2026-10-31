import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    workoutId: string;
  }>;
};

function calculateEstimated1RM(weight: number, reps: number) {
  if (reps === 1) return weight;

  return weight * (1 + reps / 30);
}

export async function POST(
  request: Request,
  { params }: Props
) {
  try {
    const { workoutId } = await params;

    const workout = await prisma.workout.findUnique({
      where: {
        id: workoutId,
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
        { status: 404 }
      );
    }

    const validSets = workout.sets.filter(
      (set) =>
        set.workoutExercise?.exercise &&
        set.weight !== null &&
        set.reps !== null &&
        set.weight > 0 &&
        set.reps > 0
    );

    const records = [];

    for (const set of validSets) {
      const exercise = set.workoutExercise!.exercise;

      const weight = set.weight!;
      const reps = set.reps!;

      const estimated1RM = calculateEstimated1RM(
        weight,
        reps
      );

      const existingRecord =
        await prisma.personalRecord.findFirst({
          where: {
            userId: workout.userId,
            exerciseId: exercise.id,
          },
          orderBy: {
            estimated1RM: "desc",
          },
        });

      const currentBest =
        existingRecord?.estimated1RM ?? 0;

      if (estimated1RM > currentBest) {
        const record = await prisma.personalRecord.create({
          data: {
            userId: workout.userId,
            exerciseId: exercise.id,
            weight,
            reps,
            estimated1RM,
            achievedAt: new Date(),
          },
        });

        records.push({
          exercise: exercise.name,
          weight,
          reps,
          estimated1RM,
          isNewRecord: true,
          recordId: record.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("UPDATE_PERSONAL_RECORDS_ERROR", error);

    return NextResponse.json(
      {
        error: "Failed to update personal records.",
      },
      {
        status: 500,
      }
    );
  }
}