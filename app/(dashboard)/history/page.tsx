import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import HistoryContent from "@/components/history/HistoryContent";

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const workouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
    },
    orderBy: {
      completedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      completedAt: true,
      duration: true,
      calories: true,
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
  });

  const history = workouts.map((workout) => {
    const totalVolume = workout.sets.reduce(
      (total, set) =>
        total + (set.weight ?? 0) * (set.reps ?? 0),
      0,
    );

    return {
      id: workout.id,
      name: workout.name,
      completedAt: workout.completedAt?.toISOString() ?? null,
      duration: workout.duration,
      calories:
        workout.calories === null
          ? null
          : Number(workout.calories),
      totalVolume: Number(totalVolume),
      setCount: workout.sets.length,
    };
  });

  return <HistoryContent history={history} />;
}

