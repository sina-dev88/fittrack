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

    const workoutPlanId = String(
      body.workoutPlanId ?? ""
    );

    const workoutDayId = String(
      body.workoutDayId ?? ""
    );

    const name = String(
      body.name ?? ""
    ).trim();

    if (!workoutPlanId || !workoutDayId) {
      return NextResponse.json(
        {
          error:
            "Workout plan and workout day are required.",
        },
        { status: 400 }
      );
    }

    const plan =
      await prisma.workoutPlan.findFirst({
        where: {
          id: workoutPlanId,
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

    if (!plan) {
      return NextResponse.json(
        {
          error: "Workout plan not found.",
        },
        { status: 404 }
      );
    }

    const day =
      await prisma.workoutDay.findFirst({
        where: {
          id: workoutDayId,
          workoutPlanId: plan.id,
        },
        select: {
          id: true,
          name: true,
        },
      });

    if (!day) {
      return NextResponse.json(
        {
          error: "Workout day not found.",
        },
        { status: 404 }
      );
    }

    const workout =
      await prisma.workout.create({
        data: {
          userId: session.user.id,
          workoutPlanId: plan.id,
          name: name || day.name,
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          status: true,
          startedAt: true,
          workoutPlanId: true,
        },
      });

    return NextResponse.json(
      workout,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/workouts error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to start workout.",
      },
      {
        status: 500,
      }
    );
  }
}
