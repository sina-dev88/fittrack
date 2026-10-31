import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    dateKey: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id, dateKey } = await context.params;

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
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

    const log = await prisma.habitLog.findUnique({
      where: {
        habitId_dateKey: {
          habitId: habit.id,
          dateKey,
        },
      },
      select: {
        id: true,
      },
    });

    if (!log) {
      return NextResponse.json(
        { error: "Habit log not found." },
        { status: 404 },
      );
    }

    await prisma.habitLog.delete({
      where: {
        id: log.id,
      },
    });

    return NextResponse.json({
      success: true,
      habitId: habit.id,
      dateKey,
    });
  } catch (error) {
    console.error(
      "DELETE /api/habits/[id]/logs/[dateKey] error:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to delete habit log." },
      { status: 500 },
    );
  }
}
