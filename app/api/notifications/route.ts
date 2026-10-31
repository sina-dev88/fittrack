import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.workoutPlan.findMany({
      where: {
        userId,
        isTemplate: false,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        nextReviewAt: true,
        _count: {
          select: {
            workouts: {
              where: { status: "COMPLETED" },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = Date.now();
    const FOUR_WEEKS = 28 * 24 * 60 * 60 * 1000;

    const notifications = plans
      .filter((plan) => {
        const dueAt =
          plan.nextReviewAt?.getTime() ?? plan.createdAt.getTime() + FOUR_WEEKS;

        return dueAt <= now;
      })
      .map((plan) => ({
        id: `plan-review-${plan.id}`,
        type: "PLAN_REVIEW" as const,
        title: "Time to review your workout plan",
        message: `Your plan "${plan.name}" is ready for a progress review.`,
        planId: plan.id,
        planName: plan.name,
        createdAt: plan.createdAt.toISOString(),
        completedWorkouts: plan._count.workouts,
        href: `/workouts/plans/${plan.id}`,
      }));

    return NextResponse.json({
      notifications,
      unreadCount: notifications.length,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);

    return NextResponse.json(
      { error: "Failed to load notifications." },
      { status: 500 },
    );
  }
}
