import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  ACHIEVEMENTS,
} from "@/lib/achievements";
import {
  checkAchievements,
  getAchievementProgress,
} from "@/lib/achievement-engine";

const XP_PER_LEVEL = 500;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const userId =
      session.user.id;

    await checkAchievements(userId);

    const [
      achievements,
      progress,
    ] = await Promise.all([
      prisma.achievement.findMany({
        orderBy: [
          {
            category: "asc",
          },
          {
            requirement: "asc",
          },
        ],
        include: {
          users: {
            where: {
              userId,
            },
            select: {
              unlockedAt: true,
            },
          },
        },
      }),

      getAchievementProgress(
        userId,
      ),
    ]);

    const definitionMap =
      new Map(
        ACHIEVEMENTS.map(
          (achievement) => [
            achievement.key,
            achievement,
          ],
        ),
      );

    const result =
      achievements.map(
        (achievement) => {
          const definition =
            definitionMap.get(
              achievement.key,
            );

          const current =
            progress[
              achievement.key
            ];

          return {
            id: achievement.id,
            key: achievement.key,
            name: achievement.name,
            description:
              achievement.description,
            icon: achievement.icon,
            category:
              achievement.category,
            requirement:
              achievement.requirement,

            value:
              current?.value ?? 0,

            percentage:
              current?.percentage ?? 0,

            unlocked:
              achievement.users
                .length > 0,

            unlockedAt:
              achievement.users[0]
                ?.unlockedAt ?? null,

            xp:
              definition?.xp ?? 0,

            rarity:
              definition?.rarity ??
              "COMMON",
          };
        },
      );

    const totalXp =
      result
        .filter(
          (achievement) =>
            achievement.unlocked,
        )
        .reduce(
          (total, achievement) =>
            total + achievement.xp,
          0,
        );

    const level =
      Math.floor(
        totalXp / XP_PER_LEVEL,
      ) + 1;

    const currentLevelXp =
      totalXp %
      XP_PER_LEVEL;

    const nextLevelXp =
      XP_PER_LEVEL;

    const levelPercentage =
      Math.min(
        100,
        Math.round(
          (currentLevelXp /
            nextLevelXp) *
            100,
        ),
      );

    const unlockedCount =
      result.filter(
        (achievement) =>
          achievement.unlocked,
      ).length;

    return NextResponse.json({
      achievements: result,

      stats: {
        unlocked:
          unlockedCount,

        total:
          result.length,

        completion:
          result.length === 0
            ? 0
            : Math.round(
                (unlockedCount /
                  result.length) *
                  100,
              ),

        xp: totalXp,

        level,

        currentLevelXp,

        nextLevelXp,

        levelPercentage,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/achievements error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load achievements.",
      },
      {
        status: 500,
      },
    );
  }
}
