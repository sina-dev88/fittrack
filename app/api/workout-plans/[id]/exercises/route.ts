import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

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

    const { id } = await params;
    const body = await request.json();

    const workoutDayId = String(body.workoutDayId ?? "");
    const exerciseId = String(body.exerciseId ?? "");

    const targetSets =
      body.targetSets === "" ||
      body.targetSets === null ||
      body.targetSets === undefined
        ? null
        : Number(body.targetSets);

    const targetReps =
      body.targetReps === "" ||
      body.targetReps === null ||
      body.targetReps === undefined
        ? null
        : Number(body.targetReps);

    if (!workoutDayId || !exerciseId) {
      return NextResponse.json(
        {
          error: "Workout day and exercise are required.",
        },
        { status: 400 }
      );
    }

    if (
      targetSets !== null &&
      (!Number.isInteger(targetSets) ||
        targetSets < 1 ||
        targetSets > 100)
    ) {
      return NextResponse.json(
        { error: "Invalid target sets." },
        { status: 400 }
      );
    }

    if (
      targetReps !== null &&
      (!Number.isInteger(targetReps) ||
        targetReps < 1 ||
        targetReps > 1000)
    ) {
      return NextResponse.json(
        { error: "Invalid target reps." },
        { status: 400 }
      );
    }

    // Verify ownership of the workout plan.
    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Workout plan not found." },
        { status: 404 }
      );
    }

    // Verify that the selected day belongs to this plan.
    const day = await prisma.workoutDay.findFirst({
      where: {
        id: workoutDayId,
        workoutPlanId: plan.id,
      },
      select: {
        id: true,
      },
    });

    if (!day) {
      return NextResponse.json(
        { error: "Workout day not found." },
        { status: 404 }
      );
    }

    // Verify that the exercise exists.
    const exercise = await prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
      select: {
        id: true,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found." },
        { status: 404 }
      );
    }

    // Prevent duplicate exercise in the same workout day.
    const existingExercise =
      await prisma.workoutExercise.findFirst({
        where: {
          workoutDayId: day.id,
          exerciseId,
        },
        select: {
          id: true,
        },
      });

    if (existingExercise) {
      return NextResponse.json(
        {
          error:
            "This exercise is already added to this workout day.",
        },
        { status: 409 }
      );
    }

    // Put the exercise at the end of the current list.
    const lastExercise =
      await prisma.workoutExercise.findFirst({
        where: {
          workoutDayId: day.id,
        },
        orderBy: {
          order: "desc",
        },
        select: {
          order: true,
        },
      });

    const nextOrder =
      lastExercise === null
        ? 0
        : lastExercise.order + 1;

    const workoutExercise =
      await prisma.workoutExercise.create({
        data: {
          workoutDayId: day.id,
          exerciseId,
          order: nextOrder,
          targetSets,
          targetReps,
        },
        select: {
          id: true,
          workoutDayId: true,
          exerciseId: true,
          order: true,
          targetSets: true,
          targetReps: true,
          exercise: {
            select: {
              id: true,
              name: true,
              primaryMuscle: true,
              equipment: true,
            },
          },
        },
      });

    return NextResponse.json(
      workoutExercise,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/workout-plans/[id]/exercises error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to add exercise.",
      },
      {
        status: 500,
      }
    );
  }
}