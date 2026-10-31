import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkAchievements } from "@/lib/achievement-engine";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function isValidDateKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  );
}

export async function POST(
  request: Request,
  { params }: Props,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id: habitId } = await params;

    const body = await request.json();

    const dateKey = body.dateKey;
    const completed = body.completed;
    const count = body.count;
    const notes = body.notes;

    if (!isValidDateKey(dateKey)) {
      return NextResponse.json(
        { error: "Invalid date." },
        { status: 400 },
      );
    }

    if (
      completed !== undefined &&
      typeof completed !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid completed value." },
        { status: 400 },
      );
    }

    const parsedCount =
      count === undefined
        ? 1
        : Number(count);

    if (
      !Number.isInteger(parsedCount) ||
      parsedCount < 0 ||
      parsedCount > 1000
    ) {
      return NextResponse.json(
        { error: "Invalid count." },
        { status: 400 },
      );
    }

    if (
      notes !== undefined &&
      notes !== null &&
      typeof notes !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid notes." },
        { status: 400 },
      );
    }

    if (
      typeof notes === "string" &&
      notes.length > 2000
    ) {
      return NextResponse.json(
        { error: "Notes are too long." },
        { status: 400 },
      );
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!habit) {
      return NextResponse.json(
        { error: "Habit not found." },
        { status: 404 },
      );
    }

    const log = await prisma.habitLog.upsert({
      where: {
        habitId_dateKey: {
          habitId,
          dateKey,
        },
      },
      update: {
        completed:
          completed !== undefined
            ? completed
            : parsedCount > 0,
        count: parsedCount,
        notes:
          notes !== undefined
            ? notes
            : undefined,
      },
      create: {
        habitId,
        userId: session.user.id,
        dateKey,
        completed:
          completed !== undefined
            ? completed
            : parsedCount > 0,
        count: parsedCount,
        notes:
          typeof notes === "string"
            ? notes
            : null,
      },
    });

    // ----------------------------------------
    // Check achievements
    // ----------------------------------------

    const unlockedAchievements =
      await checkAchievements(
        session.user.id,
      );

    return NextResponse.json({
      log,
      unlockedAchievements,
    });
  } catch (error) {
    console.error(
      "POST /api/habits/[id]/logs error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to save habit log.",
      },
      {
        status: 500,
      },
    );
  }
}

