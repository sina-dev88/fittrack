import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function parseTime(value: unknown, fieldName: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return value;
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const goal = await prisma.sleepGoal.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      goal: goal
        ? {
            id: goal.id,
            targetMinutes: goal.targetMinutes,
            targetHours: Number(
              (goal.targetMinutes / 60).toFixed(1),
            ),
            targetBedtime: goal.targetBedtime,
            targetWakeTime: goal.targetWakeTime,
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/sleep/goal error:", error);

    return NextResponse.json(
      { error: "Failed to load sleep goal." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const targetMinutes = Number(body.targetMinutes);

    if (
      !Number.isFinite(targetMinutes) ||
      targetMinutes < 60 ||
      targetMinutes > 24 * 60
    ) {
      return NextResponse.json(
        {
          error:
            "Sleep target must be between 1 and 24 hours.",
        },
        {
          status: 400,
        },
      );
    }

    let targetBedtime: string | null;
    let targetWakeTime: string | null;

    try {
      targetBedtime = parseTime(
        body.targetBedtime,
        "target bedtime",
      );

      targetWakeTime = parseTime(
        body.targetWakeTime,
        "target wake time",
      );
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid sleep goal.",
        },
        {
          status: 400,
        },
      );
    }

    const goal = await prisma.sleepGoal.upsert({
      where: {
        userId: session.user.id,
      },

      update: {
        targetMinutes: Math.round(targetMinutes),
        targetBedtime,
        targetWakeTime,
      },

      create: {
        userId: session.user.id,
        targetMinutes: Math.round(targetMinutes),
        targetBedtime,
        targetWakeTime,
      },
    });

    return NextResponse.json({
      id: goal.id,
      targetMinutes: goal.targetMinutes,
      targetHours: Number(
        (goal.targetMinutes / 60).toFixed(1),
      ),
      targetBedtime: goal.targetBedtime,
      targetWakeTime: goal.targetWakeTime,
    });
  } catch (error) {
    console.error("PATCH /api/sleep/goal error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update sleep goal.",
      },
      {
        status: 500,
      },
    );
  }
}
