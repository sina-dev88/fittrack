import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkAchievements } from "@/lib/achievement-engine";

function isValidFrequency(value: unknown): value is "DAILY" | "WEEKLY" {
  return value === "DAILY" || value === "WEEKLY";
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = session.user.id;

    const habits = await prisma.habit.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        logs: {
          where: {
            dateKey: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10),
            },
          },
          orderBy: {
            dateKey: "desc",
          },
        },
      },
    });
    const habitsWithLogs = habits.map((habit) => ({
      ...habit,
      logs: habit.logs ?? [],
    }));

    const today = new Date().toISOString().slice(0, 10);

    const todayLogs = await prisma.habitLog.findMany({
      where: {
        userId,
        dateKey: today,
      },
    });

    return NextResponse.json({
      habits: habitsWithLogs,
      today,
      todayLogs,
    });
  } catch (error) {
    console.error("GET /api/habits error:", error);

    return NextResponse.json(
      { error: "Failed to load habits." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();

    const name = body.name;
    const description = body.description;
    const icon = body.icon;
    const color = body.color;
    const frequency = body.frequency;
    const targetCount = body.targetCount;

    if (
      typeof name !== "string" ||
      name.trim().length === 0 ||
      name.trim().length > 100
    ) {
      return NextResponse.json(
        { error: "Invalid habit name." },
        { status: 400 },
      );
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid description." },
        { status: 400 },
      );
    }

    if (typeof description === "string" && description.length > 500) {
      return NextResponse.json(
        { error: "Description is too long." },
        { status: 400 },
      );
    }

    if (icon !== undefined && icon !== null && typeof icon !== "string") {
      return NextResponse.json({ error: "Invalid icon." }, { status: 400 });
    }

    if (color !== undefined && color !== null && typeof color !== "string") {
      return NextResponse.json({ error: "Invalid color." }, { status: 400 });
    }

    if (frequency !== undefined && !isValidFrequency(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency." },
        { status: 400 },
      );
    }

    const parsedTargetCount =
      targetCount === undefined ? 1 : Number(targetCount);

    if (
      !Number.isInteger(parsedTargetCount) ||
      parsedTargetCount < 1 ||
      parsedTargetCount > 100
    ) {
      return NextResponse.json(
        { error: "Invalid target count." },
        { status: 400 },
      );
    }

    const habit = await prisma.habit.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description:
          typeof description === "string" ? description.trim() || null : null,
        icon: typeof icon === "string" ? icon : null,
        color: typeof color === "string" ? color : null,
        frequency: frequency ?? "DAILY",
        targetCount: parsedTargetCount,
      },
    });

    let unlockedAchievements: Awaited<ReturnType<typeof checkAchievements>> = [];

    try {
      unlockedAchievements = await checkAchievements(session.user.id);
    } catch (achievementError) {
      console.error(
        "Habit created, but achievement check failed:",
        achievementError,
      );
    }

    return NextResponse.json({ habit, unlockedAchievements });
  } catch (error) {
    console.error("POST /api/habits error:", error);

    return NextResponse.json(
      { error: "Failed to create habit." },
      { status: 500 },
    );
  }
}
