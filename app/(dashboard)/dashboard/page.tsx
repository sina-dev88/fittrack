import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardContent, {
  DashboardUserMissing,
} from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true,
    },
  });

 if (!user) {
  return <DashboardUserMissing />;
}

  const now = new Date();

  // Current week starts on Monday.
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1;

  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  // Previous week.
  const startOfPreviousWeek = new Date(startOfWeek);
  startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

  const completedWorkouts = await prisma.workout.findMany({
    where: {
      userId: user.id,
      status: "COMPLETED",
    },
    orderBy: {
      completedAt: "desc",
    },
    include: {
      sets: {
        where: {
          status: "COMPLETED",
        },
      },
    },
  });

  const thisWeekWorkouts = completedWorkouts.filter((workout) => {
    if (!workout.completedAt) return false;

    return (
      workout.completedAt >= startOfWeek && workout.completedAt < endOfWeek
    );
  });

  const previousWeekWorkouts = completedWorkouts.filter((workout) => {
    if (!workout.completedAt) return false;

    return (
      workout.completedAt >= startOfPreviousWeek &&
      workout.completedAt < startOfWeek
    );
  });

  // Total training time.
  const totalTrainingMinutes = completedWorkouts.reduce(
    (total, workout) => total + (workout.duration ?? 0),
    0,
  );

  // Current and previous week's training time.
  const thisWeekTrainingMinutes = thisWeekWorkouts.reduce(
    (total, workout) => total + (workout.duration ?? 0),
    0,
  );

  const previousWeekTrainingMinutes = previousWeekWorkouts.reduce(
    (total, workout) => total + (workout.duration ?? 0),
    0,
  );

  // Total training volume.
  const totalVolume = completedWorkouts.reduce((total, workout) => {
    return (
      total +
      workout.sets.reduce((setTotal, set) => {
        return setTotal + (set.weight ?? 0) * (set.reps ?? 0);
      }, 0)
    );
  }, 0);

  // Calories are counted only when recorded.
  const totalCalories = completedWorkouts.reduce(
    (total, workout) => total + (workout.calories ?? 0),
    0,
  );

  function calculateChange(current: number, previous: number) {
    if (previous === 0) {
      return current > 0 ? "+100%" : "0%";
    }

    const change = ((current - previous) / previous) * 100;

    return `${change >= 0 ? "+" : ""}${Math.round(change)}%`;
  }

  const thisWeekVolume = thisWeekWorkouts.reduce(
    (total, workout) =>
      total +
      workout.sets.reduce(
        (setTotal, set) => setTotal + (set.weight ?? 0) * (set.reps ?? 0),
        0,
      ),
    0,
  );

  const previousWeekVolume = previousWeekWorkouts.reduce(
    (total, workout) =>
      total +
      workout.sets.reduce(
        (setTotal, set) => setTotal + (set.weight ?? 0) * (set.reps ?? 0),
        0,
      ),
    0,
  );

  // Weekly activity.
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const weeklyData = weekDays.map((dayName, index) => {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(dayStart.getDate() + index);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = thisWeekWorkouts.filter((workout) => {
      if (!workout.completedAt) return false;

      return workout.completedAt >= dayStart && workout.completedAt < dayEnd;
    }).length;

    return {
      day: dayName,
      value: count > 0 ? 100 : 8,
    };
  });

  // Latest workout plan.
  const latestPlan = await prisma.workoutPlan.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      days: {
        orderBy: {
          dayNumber: "asc",
        },
        include: {
          exercises: true,
        },
      },
    },
  });

  const todayWorkout = latestPlan?.days[0] ?? null;

  // Personal records.
  const personalRecords = await prisma.personalRecord.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      weight: "desc",
    },
    include: {
      exercise: {
        select: {
          name: true,
        },
      },
    },
    take: 3,
  });

  const currentWeight = user.profile?.weight;

  return (
    <DashboardContent
      dateISO={now.toISOString()}
      userName={user.name || ""}
      todayWorkoutName={todayWorkout?.name ?? null}
      todayWorkoutExercisesCount={todayWorkout?.exercises.length ?? 0}
      hasTodayWorkout={todayWorkout !== null}
      latestPlanId={latestPlan?.id ?? null}
      completedWorkoutsCount={completedWorkouts.length}
      totalTrainingMinutes={totalTrainingMinutes}
      totalVolume={totalVolume}
      totalCalories={totalCalories}
      workoutsChange={calculateChange(
        thisWeekWorkouts.length,
        previousWeekWorkouts.length,
      )}
      trainingTimeChange={calculateChange(
        thisWeekTrainingMinutes,
        previousWeekTrainingMinutes,
      )}
      volumeChange={calculateChange(thisWeekVolume, previousWeekVolume)}
      thisWeekWorkoutCount={thisWeekWorkouts.length}
      weeklyData={weeklyData}
      goal={user.profile?.goal ?? null}
      currentWeight={currentWeight == null ? null : Number(currentWeight)}
      personalRecords={personalRecords.map((record) => ({
        id: record.id,
        exerciseName: record.exercise.name,
        weight: Number(record.weight),
      }))}
    />
  );
}
