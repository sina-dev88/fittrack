import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS } from "@/lib/achievements";

export type AchievementProgress = {
  value: number;
  requirement: number;
  percentage: number;
};

function calculateLongestStreak(
  logs: {
    dateKey: string;
    completed: boolean;
  }[],
) {
  const dates = Array.from(
    new Set(logs.filter((log) => log.completed).map((log) => log.dateKey)),
  ).sort();

  if (dates.length === 0) {
    return 0;
  }

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const previousDate = new Date(`${dates[i - 1]}T00:00:00`);

    const currentDate = new Date(`${dates[i]}T00:00:00`);

    const difference =
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);

    if (difference === 1) {
      currentStreak += 1;

      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

async function collectAchievementStats(userId: string) {
  const [completedWorkouts, personalRecords, habits, habitLogs] =
    await Promise.all([
      prisma.workout.findMany({
        where: {
          userId,
          status: "COMPLETED",
        },
        select: {
          completedAt: true,
        },
      }),

      prisma.personalRecord.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      }),

      prisma.habit.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      }),

      prisma.habitLog.findMany({
        where: {
          userId,
          completed: true,
        },
        select: {
          habitId: true,
          dateKey: true,
          completed: true,
        },
        orderBy: {
          dateKey: "asc",
        },
      }),
    ]);

  const workoutCount = completedWorkouts.length;

  const prCount = personalRecords.length;

  const habitCount = habits.length;

  const workoutDays = new Set(
    completedWorkouts
      .map((workout) => workout.completedAt)
      .filter(Boolean)
      .map((date) => date!.toISOString().slice(0, 10)),
  ).size;

  const logsByHabit = new Map<
    string,
    {
      dateKey: string;
      completed: boolean;
    }[]
  >();

  for (const log of habitLogs) {
    const logs = logsByHabit.get(log.habitId) ?? [];

    logs.push({
      dateKey: log.dateKey,
      completed: log.completed,
    });

    logsByHabit.set(log.habitId, logs);
  }

  let longestHabitStreak = 0;

  for (const logs of logsByHabit.values()) {
    longestHabitStreak = Math.max(
      longestHabitStreak,
      calculateLongestStreak(logs),
    );
  }

  return {
    workoutCount,
    prCount,
    habitCount,
    workoutDays,
    longestHabitStreak,
  };
}

export async function getAchievementProgress(userId: string) {
  const stats = await collectAchievementStats(userId);

  const progress: Record<string, AchievementProgress> = {};

  for (const achievement of ACHIEVEMENTS) {
    let value = 0;

    switch (achievement.key) {
      case "first-workout":
      case "five-workouts":
      case "ten-workouts":
      case "twenty-five-workouts":
      case "fifty-workouts":
      case "hundred-workouts":
        value = stats.workoutCount;
        break;

      case "first-pr":
      case "five-prs":
      case "ten-prs":
      case "twenty-five-prs":
        value = stats.prCount;
        break;

      case "first-habit":
      case "three-habits":
        value = stats.habitCount;
        break;

      case "seven-day-habit":
      case "thirty-day-habit":
      case "sixty-day-habit":
        value = stats.longestHabitStreak;
        break;

      case "seven-workout-days":
      case "fourteen-workout-days":
      case "thirty-workout-days":
        value = stats.workoutDays;
        break;

      default:
        value = 0;
    }

    progress[achievement.key] = {
      value,
      requirement: achievement.requirement,
      percentage: Math.min(
        100,
        Math.round((value / achievement.requirement) * 100),
      ),
    };
  }

  return progress;
}

export async function checkAchievements(userId: string) {
  const progress = await getAchievementProgress(userId);

  const existingAchievements = await prisma.userAchievement.findMany({
    where: {
      userId,
    },
    select: {
      achievementId: true,
    },
  });

  const existingIds = new Set(
    existingAchievements.map((achievement) => achievement.achievementId),
  );

  const definitions = await prisma.achievement.findMany({
    where: {
      key: {
        in: ACHIEVEMENTS.map((achievement) => achievement.key),
      },
    },
  });

  const definitionMap = new Map(
    definitions.map((achievement) => [achievement.key, achievement]),
  );

  const unlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    const current = progress[achievement.key];

    if (!current || current.value < achievement.requirement) {
      continue;
    }

    const definition = definitionMap.get(achievement.key);

    if (!definition) {
      continue;
    }

    if (existingIds.has(definition.id)) {
      continue;
    }

    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: definition.id,
      },
      include: {
        achievement: true,
      },
    });

    unlocked.push(userAchievement);
  }

  return unlocked;
}
