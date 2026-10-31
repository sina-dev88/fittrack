import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
    workoutExerciseId: string;
  }>;
};

export async function PATCH(
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

    const { id, workoutExerciseId } = await params;
    const body = await request.json();

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

    const workoutExercise =
      await prisma.workoutExercise.findFirst({
        where: {
          id: workoutExerciseId,
          workoutDay: {
            workoutPlanId: plan.id,
          },
        },
        select: {
          id: true,
        },
      });

    if (!workoutExercise) {
      return NextResponse.json(
        { error: "Workout exercise not found." },
        { status: 404 }
      );
    }

    const data: {
      targetSets?: number | null;
      targetReps?: number | null;
      order?: number;
    } = {};

    if ("targetSets" in body) {
      data.targetSets =
        body.targetSets === "" ||
        body.targetSets === null ||
        body.targetSets === undefined
          ? null
          : Number(body.targetSets);
    }

    if ("targetReps" in body) {
      data.targetReps =
        body.targetReps === "" ||
        body.targetReps === null ||
        body.targetReps === undefined
          ? null
          : Number(body.targetReps);
    }

    if ("order" in body) {
      data.order = Number(body.order);
    }

    const updatedExercise =
      await prisma.workoutExercise.update({
        where: {
          id: workoutExercise.id,
        },
        data,
      });

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error(
      "PATCH /api/workout-plans/[id]/exercises/[workoutExerciseId] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update exercise." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id, workoutExerciseId } = await params;

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

    const workoutExercise =
      await prisma.workoutExercise.findFirst({
        where: {
          id: workoutExerciseId,
          workoutDay: {
            workoutPlanId: plan.id,
          },
        },
        select: {
          id: true,
        },
      });

    if (!workoutExercise) {
      return NextResponse.json(
        { error: "Workout exercise not found." },
        { status: 404 }
      );
    }

    await prisma.workoutExercise.delete({
      where: {
        id: workoutExercise.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/workout-plans/[id]/exercises/[workoutExerciseId] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete exercise." },
      { status: 500 }
    );
  }
}