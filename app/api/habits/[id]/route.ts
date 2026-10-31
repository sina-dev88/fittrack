import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isValidFrequency(value: unknown): value is "DAILY" | "WEEKLY" {
  return value === "DAILY" || value === "WEEKLY";
}

function cleanString(
  value: unknown,
  maxLength: number,
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  return text.slice(0, maxLength);
}

function parseTargetCount(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 1 || number > 100) {
    return null;
  }

  return number;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Habit ID is required." },
        { status: 400 },
      );
    }

    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingHabit) {
      return NextResponse.json(
        { error: "Habit not found." },
        { status: 404 },
      );
    }

    const body = await request.json();

    const data: {
      name?: string;
      description?: string | null;
      icon?: string | null;
      color?: string | null;
      frequency?: "DAILY" | "WEEKLY";
      targetCount?: number;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      const name = cleanString(body.name, 100);

      if (!name) {
        return NextResponse.json(
          { error: "Habit name cannot be empty." },
          { status: 400 },
        );
      }

      data.name = name;
    }

    if (body.description !== undefined) {
      data.description = cleanString(body.description, 500);
    }

    if (body.icon !== undefined) {
      data.icon = cleanString(body.icon, 50);
    }

    if (body.color !== undefined) {
      data.color = cleanString(body.color, 30);
    }

    if (body.frequency !== undefined) {
      if (!isValidFrequency(body.frequency)) {
        return NextResponse.json(
          { error: "Invalid habit frequency." },
          { status: 400 },
        );
      }

      data.frequency = body.frequency;
    }

    if (body.targetCount !== undefined) {
      const targetCount = parseTargetCount(body.targetCount);

      if (targetCount === null) {
        return NextResponse.json(
          { error: "Target count must be between 1 and 100." },
          { status: 400 },
        );
      }

      data.targetCount = targetCount;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { error: "isActive must be a boolean." },
          { status: 400 },
        );
      }

      data.isActive = body.isActive;
    }

    const habit = await prisma.habit.update({
      where: {
        id,
      },
      data,
      include: {
        logs: {
          orderBy: {
            dateKey: "desc",
          },
          take: 90,
        },
      },
    });

    return NextResponse.json({
      habit,
    });
  } catch (error) {
    console.error("PATCH /api/habits/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to update habit." },
      { status: 500 },
    );
  }
}

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

    const { id } = await context.params;

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

    await prisma.habit.delete({
      where: {
        id: habit.id,
      },
    });

    return NextResponse.json({
      success: true,
      habitId: habit.id,
    });
  } catch (error) {
    console.error("DELETE /api/habits/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to delete habit." },
      { status: 500 },
    );
  }
}
