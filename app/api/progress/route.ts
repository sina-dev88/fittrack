import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getWeekKey(date: Date) {
  const d = new Date(date);

  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);

  return d.toISOString().slice(0, 10);
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

    const userId = session.user.id;

    const [workouts, bodyMetrics, personalRecords] =
      await Promise.all([
        prisma.workout.findMany({
          where: {
            userId,
            status: "COMPLETED",
          },
          orderBy: {
            completedAt: "asc",
          },
          select: {
            id: true,
            name: true,
            completedAt: true,
            duration: true,
            sets: {
              where: {
                status: "COMPLETED",
              },
              select: {
                weight: true,
                reps: true,
              },
            },
          },
        }),

        prisma.bodyMetric.findMany({
          where: {
            userId,
          },
          orderBy: {
            recordedAt: "asc",
          },
          select: {
            id: true,
            weight: true,
            bodyFat: true,
            recordedAt: true,
          },
        }),

        prisma.personalRecord.findMany({
          where: {
            userId,
          },
          orderBy: {
            achievedAt: "desc",
          },
          select: {
            id: true,
            weight: true,
            reps: true,
            estimated1RM: true,
            achievedAt: true,
            exercise: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      ]);

    const totalWorkouts = workouts.length;

    const totalSets = workouts.reduce(
      (total, workout) => total + workout.sets.length,
      0,
    );

    const totalVolume = workouts.reduce((total, workout) => {
      return (
        total +
        workout.sets.reduce(
          (setsTotal, set) =>
            setsTotal +
            (set.weight ?? 0) * (set.reps ?? 0),
          0,
        )
      );
    }, 0);

    const totalTrainingMinutes = workouts.reduce(
      (total, workout) => total + (workout.duration ?? 0),
      0,
    );

    const weeklyMap = new Map<
      string,
      {
        week: string;
        workouts: number;
        volume: number;
        sets: number;
      }
    >();

    for (const workout of workouts) {
      if (!workout.completedAt) continue;

      const week = getWeekKey(workout.completedAt);

      const existing = weeklyMap.get(week);

      const volume = workout.sets.reduce(
        (total, set) =>
          total +
          (set.weight ?? 0) * (set.reps ?? 0),
        0,
      );

      const sets = workout.sets.length;

      if (existing) {
        existing.workouts += 1;
        existing.volume += volume;
        existing.sets += sets;
      } else {
        weeklyMap.set(week, {
          week,
          workouts: 1,
          volume,
          sets,
        });
      }
    }

    const weeklyProgress = Array.from(
      weeklyMap.values(),
    );

    return NextResponse.json({
      summary: {
        totalWorkouts,
        totalSets,
        totalVolume,
        totalTrainingMinutes,
      },

      weeklyProgress,

      weightProgress: bodyMetrics.map((metric) => ({
        id: metric.id,
        weight: metric.weight,
        bodyFat: metric.bodyFat,
        date: metric.recordedAt,
      })),

      personalRecords,
    });
  } catch (error) {
    console.error("GET /api/progress error:", error);

    return NextResponse.json(
      { error: "Failed to load progress analytics." },
      { status: 500 },
    );
  }
}