
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

import WorkoutPlanDetailContent from "@/components/workouts/WorkoutPlanDetailContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WorkoutPlanPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const plan = await prisma.workoutPlan.findUnique({
    where: {
      id,
    },
    select: {
      createdAt: true,
      lastReviewedAt: true,
      nextReviewAt: true,
      isTemplate: true,
      id: true,
      userId: true,
      name: true,
      description: true,
      days: {
        orderBy: {
          dayNumber: "asc",
        },
        select: {
          id: true,
          name: true,
          dayNumber: true,
          exercises: {
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              order: true,
              targetSets: true,
              targetReps: true,
              exercise: {
                select: {
                  id: true,
                  name: true,
                  primaryMuscle: true,
                  equipment: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!plan || plan.userId !== session.user.id) {
    notFound();
  }

  const FOUR_WEEKS = 28 * 24 * 60 * 60 * 1000;

  const now = new Date();

  const reviewDueAt =
    plan.nextReviewAt ??
    new Date(plan.createdAt.getTime() + FOUR_WEEKS);

  const needsReview =
    !plan.isTemplate &&
    reviewDueAt.getTime() <= now.getTime();

  return (
    <WorkoutPlanDetailContent
      plan={plan}
      needsReview={needsReview}
    />
  );
}

