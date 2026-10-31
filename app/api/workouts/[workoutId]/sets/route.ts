import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    workoutId: string;
  }>;
};

function calculateEstimated1RM(
  weight: number,
  reps: number
) {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }

  if (reps === 1) {
    return weight;
  }

  return weight * (1 + reps / 30);
}

export async function POST(
  request: Request,
  { params }: Props
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { workoutId } = await params;

    const body = await request.json();

    const {
      workoutExerciseId,
      setNumber,
      weight,
      reps,
      rpe,
      rir,
      restTime,
      notes,
    } = body;

    if (!workoutExerciseId) {
      return NextResponse.json(
        {
          error: "Workout exercise is required.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedSetNumber = Number(setNumber);
    const parsedWeight = Number(weight);
    const parsedReps = Number(reps);

    if (
      !Number.isInteger(parsedSetNumber) ||
      parsedSetNumber < 1
    ) {
      return NextResponse.json(
        {
          error: "Invalid set number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(parsedWeight) ||
      parsedWeight < 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid weight.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(parsedReps) ||
      parsedReps < 1
    ) {
      return NextResponse.json(
        {
          error: "Invalid reps.",
        },
        {
          status: 400,
        }
      );
    }

    // Verify workout ownership.
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: session.user.id,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        workoutPlanId: true,
      },
    });

    if (!workout) {
      return NextResponse.json(
        {
          error: "Workout not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (workout.status !== "IN_PROGRESS") {
      return NextResponse.json(
        {
          error:
            "Sets can only be logged during an active workout.",
        },
        {
          status: 400,
        }
      );
    }

    if (!workout.workoutPlanId) {
      return NextResponse.json(
        {
          error: "Workout is not linked to a workout plan.",
        },
        {
          status: 400,
        }
      );
    }

    // Verify exercise belongs to this workout plan.
    const workoutExercise =
      await prisma.workoutExercise.findFirst({
        where: {
          id: workoutExerciseId,
          workoutDay: {
            workoutPlanId: workout.workoutPlanId,
          },
        },
        select: {
          id: true,
          exerciseId: true,
          exercise: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (!workoutExercise) {
      return NextResponse.json(
        {
          error: "Workout exercise not found.",
        },
        {
          status: 404,
        }
      );
    }

    const estimated1RM = calculateEstimated1RM(
      parsedWeight,
      parsedReps
    );

    const existingSet =
      await prisma.workoutSet.findFirst({
        where: {
          workoutId,
          workoutExerciseId,
          setNumber: parsedSetNumber,
        },
        select: {
          id: true,
        },
      });

    const setData = {
      weight: parsedWeight,
      reps: parsedReps,
      rpe:
        rpe !== undefined && rpe !== ""
          ? Number(rpe)
          : null,
      rir:
        rir !== undefined && rir !== ""
          ? Number(rir)
          : null,
      restTime:
        restTime !== undefined && restTime !== ""
          ? Number(restTime)
          : null,
      notes:
        typeof notes === "string"
          ? notes.trim() || null
          : null,
      status: "COMPLETED" as const,
    };

    let savedSet;

    if (existingSet) {
      savedSet = await prisma.workoutSet.update({
        where: {
          id: existingSet.id,
        },
        data: setData,
      });
    } else {
      savedSet = await prisma.workoutSet.create({
        data: {
          workoutId,
          workoutExerciseId,
          setNumber: parsedSetNumber,
          ...setData,
        },
      });
    }

    /*
     * PR
     *
     * We compare estimated 1RM against the user's
     * existing record for this exercise.
     */

    const currentPR =
      await prisma.personalRecord.findFirst({
        where: {
          userId: session.user.id,
          exerciseId: workoutExercise.exerciseId,
        },
        orderBy: {
          estimated1RM: "desc",
        },
      });

    let personalRecord = currentPR;

    if (
      !currentPR ||
      (currentPR.estimated1RM ?? 0) < estimated1RM
    ) {
      if (currentPR) {
        personalRecord =
          await prisma.personalRecord.update({
            where: {
              id: currentPR.id,
            },
            data: {
              weight: parsedWeight,
              reps: parsedReps,
              estimated1RM,
              achievedAt: new Date(),
            },
          });
      } else {
        personalRecord =
          await prisma.personalRecord.create({
            data: {
              userId: session.user.id,
              exerciseId:
                workoutExercise.exerciseId,
              weight: parsedWeight,
              reps: parsedReps,
              estimated1RM,
            },
          });
      }
    }

    return NextResponse.json({
      success: true,
      set: savedSet,
      stats: {
        volume: parsedWeight * parsedReps,
        estimated1RM,
      },
      personalRecord: personalRecord
        ? {
            id: personalRecord.id,
            weight: personalRecord.weight,
            reps: personalRecord.reps,
            estimated1RM:
              personalRecord.estimated1RM,
            achievedAt:
              personalRecord.achievedAt,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "POST /api/workouts/[workoutId]/sets error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to save workout set.",
      },
      {
        status: 500,
      }
    );
  }
}