import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProgressContent from "@/components/progress/ProgressContent";

function getStartOfWeek(date: Date) {
  const result = new Date(date);

  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getWeekKey(date: Date) {
  return getStartOfWeek(date).toISOString().slice(0, 10);
}

export default async function ProgressPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [metrics, workouts, sets, prs] = await Promise.all([
    prisma.bodyMetric.findMany({
      where: {
        userId,
      },
      orderBy: {
        recordedAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        weight: true,
        bodyFat: true,
        recordedAt: true,
      },
    }),

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

  const weeklyMap = new Map<
    string,
    {
      week: string;
      volume: number;
      workouts: number;
    }
  >();

  // Aggregate completed workouts by week.
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

    weeklyMap.get(week)!.workouts += 1;
  }

  // Aggregate completed set volume by week.
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

    weeklyMap.get(week)!.volume += set.weight * set.reps;
  }

  const weekly = Array.from(weeklyMap.values())
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12);

  const strength = prs
    .filter((record) => record.estimated1RM !== null)
    .slice(-50)
    .map((record) => ({
      date: record.achievedAt.toISOString().slice(0, 10),
      exercise: record.exercise.name,
      estimated1RM: Number(record.estimated1RM!.toFixed(1)),
    }));

  const totalVolume = sets.reduce((total, set) => {
    if (set.weight === null || set.reps === null) {
      return total;
    }

    return total + set.weight * set.reps;
  }, 0);

  const totalWorkouts = workouts.length;

  const latestWeightValue =
    metrics.find((metric) => metric.weight !== null)?.weight ?? null;

  const previousWeightValue =
    metrics.find((metric, index) => index > 0 && metric.weight !== null)
      ?.weight ?? null;

  const latestWeight =
    latestWeightValue === null ? null : Number(latestWeightValue);

  const previousWeight =
    previousWeightValue === null ? null : Number(previousWeightValue);

  const weightChange =
    latestWeight !== null && previousWeight !== null
      ? latestWeight - previousWeight
      : null;

  return (
    <ProgressContent
      metrics={metrics.map((metric) => ({
        id: metric.id,
        weight: metric.weight === null ? null : Number(metric.weight),
        bodyFat:
          metric.bodyFat === null ? null : Number(metric.bodyFat),
        recordedAt: metric.recordedAt.toISOString(),
      }))}
      weekly={weekly}
      strength={strength}
      latestWeight={latestWeight}
      weightChange={weightChange}
      totalWorkouts={totalWorkouts}
      totalVolume={totalVolume}
      personalRecordsCount={prs.length}
    />
  );
}
