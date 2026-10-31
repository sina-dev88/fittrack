import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getStartOfWeek(date: Date) {
  const result = new Date(date);

  const day = result.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getWeekKey(date: Date) {
  const start = getStartOfWeek(date);

  return start.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const [workouts, sets, prs] =
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
            completedAt: true,
            duration: true,
          },
        }),

        prisma.workoutSet.findMany({
          where: {
            workout: {
              userId,
              status: "COMPLETED",
            },
            status: "COMPLETED",
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            weight: true,
            reps: true,
            createdAt: true,
            workoutExercise: {
              select: {
                exercise: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),

        prisma.personalRecord.findMany({
          where: {
            userId,
          },
          orderBy: {
            achievedAt: "asc",
          },
          select: {
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

    /*
     * Weekly volume + workout frequency
     */

    const weeklyMap = new Map<
      string,
      {
        week: string;
        volume: number;
        workouts: number;
      }
    >();

    for (const workout of workouts) {
      if (!workout.completedAt) continue;

      const week = getWeekKey(workout.completedAt);

      if (!weeklyMap.has(week)) {
        weeklyMap.set(week, {
          week,
          volume: 0,
          workouts: 0,
        });
      }

      const item = weeklyMap.get(week)!;

      item.workouts += 1;
    }

    for (const set of sets) {
      if (set.weight === null || set.reps === null) {
        continue;
      }

      const week = getWeekKey(set.createdAt);

      if (!weeklyMap.has(week)) {
        weeklyMap.set(week, {
          week,
          volume: 0,
          workouts: 0,
        });
      }

      const item = weeklyMap.get(week)!;

      item.volume += set.weight * set.reps;
    }

    const weekly = Array.from(
      weeklyMap.values()
    )
      .sort((a, b) =>
        a.week.localeCompare(b.week)
      )
      .slice(-12);

    /*
     * Strength progression
     */

    const strengthMap = new Map<
      string,
      {
        date: string;
        exercise: string;
        estimated1RM: number;
      }
    >();

    for (const pr of prs) {
      if (pr.estimated1RM === null) continue;

      const key =
        `${pr.exercise.id}-${pr.achievedAt.toISOString()}`;

      strengthMap.set(key, {
        date: pr.achievedAt
          .toISOString()
          .slice(0, 10),
        exercise: pr.exercise.name,
        estimated1RM: Number(
          pr.estimated1RM.toFixed(1)
        ),
      });
    }

    const strength = Array.from(
      strengthMap.values()
    ).slice(-50);

    /*
     * Overall statistics
     */

    const totalVolume = sets.reduce(
      (total, set) => {
        if (
          set.weight === null ||
          set.reps === null
        ) {
          return total;
        }

        return (
          total + set.weight * set.reps
        );
      },
      0
    );

    const totalWorkouts = workouts.length;

    const totalDuration = workouts.reduce(
      (total, workout) =>
        total + (workout.duration ?? 0),
      0
    );

    const averageWorkoutDuration =
      totalWorkouts > 0
        ? Math.round(
            totalDuration / totalWorkouts
          )
        : 0;

    return NextResponse.json({
      weekly,
      strength,
      summary: {
        totalVolume,
        totalWorkouts,
        averageWorkoutDuration,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/progress/analytics error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load progress analytics.",
      },
      {
        status: 500,
      }
    );
  }
}
