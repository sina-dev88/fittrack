import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function isValidDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseOptionalNumber(
  value: unknown,
  fieldName: string,
  min: number,
  max: number,
) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return Math.round(number);
}

function parseDate(value: unknown, fieldName: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid ${fieldName}.`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return date;
}

function calculateDurationMinutes(bedtime: Date | null, wakeTime: Date | null) {
  if (!bedtime || !wakeTime) {
    return null;
  }

  const difference = wakeTime.getTime() - bedtime.getTime();
  const minutes = Math.round(difference / 60000);

  if (minutes <= 0 || minutes > 24 * 60) {
    return null;
  }

  return minutes;
}

function calculateAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const requestedDays = Number(searchParams.get("days") ?? 7);

    const days = Math.min(
      Math.max(
        Number.isFinite(requestedDays) ? Math.round(requestedDays) : 7,
        1,
      ),
      90,
    );

    const userId = session.user.id;

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1));

    const dateKeys: string[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      dateKeys.push(date.toISOString().slice(0, 10));
    }

    const [sleepLogs, sleepGoal, recentWorkouts, nutritionDay] =
      await Promise.all([
        prisma.sleepLog.findMany({
          where: {
            userId,
            dateKey: {
              in: dateKeys,
            },
          },
          orderBy: {
            dateKey: "asc",
          },
        }),

        prisma.sleepGoal.findUnique({
          where: {
            userId,
          },
        }),

        prisma.workout.findMany({
          where: {
            userId,
            status: "COMPLETED",
            completedAt: {
              not: null,
            },
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 7,
          select: {
            completedAt: true,
          },
        }),

        prisma.nutritionDay.findUnique({
          where: {
            userId_dateKey: {
              userId,
              dateKey: getDateKey(),
            },
          },
          include: {
            meals: {
              include: {
                foods: true,
              },
            },
            waterLogs: true,
          },
        }),
      ]);

    const sleepMap = new Map(sleepLogs.map((sleep) => [sleep.dateKey, sleep]));

    const history = dateKeys.map((dateKey) => {
      const sleep = sleepMap.get(dateKey);

      return {
        date: dateKey,
        durationMinutes: sleep?.durationMinutes ?? 0,
        quality: sleep?.quality ?? null,
        energy: sleep?.energy ?? null,
        stress: sleep?.stress ?? null,
        awakenings: sleep?.awakenings ?? null,
        hasData: Boolean(sleep),
      };
    });

    const recordedLogs = sleepLogs.filter((sleep) => sleep.durationMinutes > 0);

    const averageSleep = calculateAverage(
      recordedLogs.map((sleep) => sleep.durationMinutes),
    );

    const qualityValues = sleepLogs
      .map((sleep) => sleep.quality)
      .filter((value): value is number => value !== null);

    const energyValues = sleepLogs
      .map((sleep) => sleep.energy)
      .filter((value): value is number => value !== null);

    const stressValues = sleepLogs
      .map((sleep) => sleep.stress)
      .filter((value): value is number => value !== null);

    const latestSleep =
      sleepLogs.length > 0 ? sleepLogs[sleepLogs.length - 1] : null;
    // -----------------------------
    // FitTrack Recovery Score
    // -----------------------------

    const targetMinutes = sleepGoal?.targetMinutes ?? 480;

    const latestDuration = latestSleep?.durationMinutes ?? 0;

    // Sleep score: 0 - 40
    const sleepDurationRatio =
      targetMinutes > 0 ? Math.min(latestDuration / targetMinutes, 1) : 0;

    const sleepQualityScore = latestSleep?.quality
      ? (latestSleep.quality / 5) * 10
      : 0;

    const sleepScore = Math.round(sleepDurationRatio * 30 + sleepQualityScore);

    // Training / rest score: 0 - 25
    const completedWorkoutCount = recentWorkouts.length;

    let trainingScore = 25;

    if (completedWorkoutCount >= 5) {
      trainingScore = 12;
    } else if (completedWorkoutCount >= 4) {
      trainingScore = 15;
    } else if (completedWorkoutCount >= 3) {
      trainingScore = 18;
    } else if (completedWorkoutCount >= 2) {
      trainingScore = 22;
    }

    // Nutrition score: 0 - 20
    let nutritionScore = 0;

    if (nutritionDay) {
      const nutritionTotals = nutritionDay.meals.reduce(
        (totals, meal) => {
          for (const food of meal.foods) {
            totals.calories += food.calories ?? 0;
            totals.protein += food.protein ?? 0;
            totals.carbs += food.carbs ?? 0;
            totals.fat += food.fat ?? 0;
          }

          return totals;
        },
        {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
      );

      const nutritionEntries = Object.values(nutritionTotals).filter(
        (value) => value > 0,
      ).length;

      nutritionScore = Math.min(nutritionEntries * 5, 20);
    }

    // Consistency score: 0 - 15
    const consistencyScore = Math.round((recordedLogs.length / days) * 15);

    const recoveryScore = Math.min(
      Math.max(
        sleepScore + trainingScore + nutritionScore + consistencyScore,
        0,
      ),
      100,
    );

    let recoveryLabel = "Needs attention";

    if (recoveryScore >= 85) {
      recoveryLabel = "Excellent recovery";
    } else if (recoveryScore >= 70) {
      recoveryLabel = "Good recovery";
    } else if (recoveryScore >= 50) {
      recoveryLabel = "Moderate recovery";
    }

    return NextResponse.json({
      recovery: {
        score: recoveryScore,
        label: recoveryLabel,
        factors: {
          sleep: sleepScore,
          training: trainingScore,
          nutrition: nutritionScore,
          consistency: consistencyScore,
        },
      },
      goal: sleepGoal
        ? {
            id: sleepGoal.id,
            targetMinutes: sleepGoal.targetMinutes,
            targetBedtime: sleepGoal.targetBedtime,
            targetWakeTime: sleepGoal.targetWakeTime,
          }
        : null,

      latest: latestSleep,

      summary: {
        averageSleepMinutes: averageSleep,
        averageSleepHours: Number((averageSleep / 60).toFixed(1)),
        averageQuality: calculateAverage(qualityValues),
        averageEnergy: calculateAverage(energyValues),
        averageStress: calculateAverage(stressValues),
        recordedDays: recordedLogs.length,
        consistency:
          days > 0 ? Math.round((recordedLogs.length / days) * 100) : 0,
      },

      history,
    });
  } catch (error) {
    console.error("GET /api/sleep error:", error);

    return NextResponse.json(
      {
        error: "Failed to load sleep data.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const dateKey = body.dateKey;

    if (!isValidDateKey(dateKey)) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }

    const bedtime = parseDate(body.bedtime, "bedtime");
    const wakeTime = parseDate(body.wakeTime, "wakeTime");

    let durationMinutes = parseOptionalNumber(
      body.durationMinutes,
      "duration",
      1,
      24 * 60,
    );

    const calculatedDuration = calculateDurationMinutes(bedtime, wakeTime);

    if (calculatedDuration !== null) {
      durationMinutes = calculatedDuration;
    }

    if (!durationMinutes) {
      return NextResponse.json(
        {
          error:
            "Sleep duration is required or must be calculable from bedtime and wake time.",
        },
        {
          status: 400,
        },
      );
    }

    const quality = parseOptionalNumber(body.quality, "quality", 1, 5);

    const energy = parseOptionalNumber(body.energy, "energy", 1, 5);

    const stress = parseOptionalNumber(body.stress, "stress", 1, 5);

    const awakenings = parseOptionalNumber(
      body.awakenings,
      "awakenings",
      0,
      50,
    );

    const notes =
      typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : null;

    const sleep = await prisma.sleepLog.upsert({
      where: {
        userId_dateKey: {
          userId: session.user.id,
          dateKey,
        },
      },

      update: {
        bedtime,
        wakeTime,
        durationMinutes,
        quality,
        energy,
        stress,
        awakenings,
        notes,
      },

      create: {
        userId: session.user.id,
        dateKey,
        bedtime,
        wakeTime,
        durationMinutes,
        quality,
        energy,
        stress,
        awakenings,
        notes,
      },
    });

    return NextResponse.json(sleep, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/sleep error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save sleep data.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!isValidDateKey(body.dateKey)) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }

    const existingSleep = await prisma.sleepLog.findUnique({
      where: {
        userId_dateKey: {
          userId: session.user.id,
          dateKey: body.dateKey,
        },
      },
    });

    if (!existingSleep) {
      return NextResponse.json(
        { error: "Sleep log not found." },
        { status: 404 },
      );
    }

    const bedtime =
      body.bedtime !== undefined
        ? parseDate(body.bedtime, "bedtime")
        : existingSleep.bedtime;

    const wakeTime =
      body.wakeTime !== undefined
        ? parseDate(body.wakeTime, "wakeTime")
        : existingSleep.wakeTime;

    let durationMinutes =
      body.durationMinutes !== undefined
        ? parseOptionalNumber(body.durationMinutes, "duration", 1, 24 * 60)
        : existingSleep.durationMinutes;

    const calculatedDuration = calculateDurationMinutes(bedtime, wakeTime);

    if (calculatedDuration !== null) {
      durationMinutes = calculatedDuration;
    }

    if (!durationMinutes) {
      return NextResponse.json(
        { error: "Invalid sleep duration." },
        { status: 400 },
      );
    }

    const quality =
      body.quality !== undefined
        ? parseOptionalNumber(body.quality, "quality", 1, 5)
        : existingSleep.quality;

    const energy =
      body.energy !== undefined
        ? parseOptionalNumber(body.energy, "energy", 1, 5)
        : existingSleep.energy;

    const stress =
      body.stress !== undefined
        ? parseOptionalNumber(body.stress, "stress", 1, 5)
        : existingSleep.stress;

    const awakenings =
      body.awakenings !== undefined
        ? parseOptionalNumber(body.awakenings, "awakenings", 0, 50)
        : existingSleep.awakenings;

    const notes =
      body.notes !== undefined
        ? typeof body.notes === "string"
          ? body.notes.trim().slice(0, 2000)
          : null
        : existingSleep.notes;

    const sleep = await prisma.sleepLog.update({
      where: {
        id: existingSleep.id,
      },

      data: {
        bedtime,
        wakeTime,
        durationMinutes,
        quality,
        energy,
        stress,
        awakenings,
        notes,
      },
    });

    return NextResponse.json(sleep);
  } catch (error) {
    console.error("PATCH /api/sleep error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update sleep data.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateKey = searchParams.get("date");

    if (!isValidDateKey(dateKey)) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }

    const sleep = await prisma.sleepLog.findUnique({
      where: {
        userId_dateKey: {
          userId: session.user.id,
          dateKey,
        },
      },
    });

    if (!sleep) {
      return NextResponse.json(
        { error: "Sleep log not found." },
        { status: 404 },
      );
    }

    await prisma.sleepLog.delete({
      where: {
        id: sleep.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/sleep error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete sleep data.",
      },
      {
        status: 500,
      },
    );
  }
}
