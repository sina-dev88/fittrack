import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import WorkoutHistoryDetailContent from "@/components/workouts/WorkoutHistoryDetailContent";

type Props = {
  params: Promise<{
    workoutId: string;
  }>;
};

export default async function WorkoutHistoryDetailPage({
  params,
}: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workoutId } = await params;

  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      userId: session.user.id,
    },
    include: {
      workoutPlan: {
        select: {
          name: true,
        },
      },
      sets: {
        orderBy: [
          {
            workoutExerciseId: "asc",
          },
          {
            setNumber: "asc",
          },
        ],
        include: {
          workoutExercise: {
            include: {
              exercise: {
                select: {
                  name: true,
                  primaryMuscle: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  const totalVolume = workout.sets.reduce((total, set) => {
    return total + (set.weight ?? 0) * (set.reps ?? 0);
  }, 0);

  return (
    <WorkoutHistoryDetailContent
      workout={workout}
      totalVolume={totalVolume}
    />
  );
}