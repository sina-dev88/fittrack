import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import WorkoutDetailContent from "@/components/workouts/WorkoutDetailContent";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WorkoutDetailPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const workout = await prisma.workout.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      status: true,
      startedAt: true,
      completedAt: true,
      duration: true,
      calories: true,
      createdAt: true,
      sets: {
        where: {
          status: {
            not: "SKIPPED",
          },
        },
        orderBy: [
          {
            workoutExercise: {
              order: "asc",
            },
          },
          {
            setNumber: "asc",
          },
        ],
        select: {
          id: true,
          setNumber: true,
          weight: true,
          reps: true,
          rpe: true,
          rir: true,
          restTime: true,
          status: true,
          notes: true,
          workoutExercise: {
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

  if (!workout) {
    notFound();
  }

  const completedSets = workout.sets.filter(
    (set) => set.status === "COMPLETED"
  );

  const totalVolume = completedSets.reduce(
    (total, set) =>
      total + (set.weight ?? 0) * (set.reps ?? 0),
    0
  );

  const exerciseMap = new Map<
    string,
    {
      id: string;
      name: string;
      primaryMuscle: string;
      equipment: string | null;
      order: number;
      targetSets: number | null;
      targetReps: number | null;
      sets: typeof workout.sets;
    }
  >();

  for (const set of workout.sets) {
    if (!set.workoutExercise) continue;

    const exercise = set.workoutExercise.exercise;
    const key = set.workoutExercise.id;

    if (!exerciseMap.has(key)) {
      exerciseMap.set(key, {
        id: exercise.id,
        name: exercise.name,
        primaryMuscle: exercise.primaryMuscle,
        equipment: exercise.equipment,
        order: set.workoutExercise.order,
        targetSets: set.workoutExercise.targetSets,
        targetReps: set.workoutExercise.targetReps,
        sets: [],
      });
    }

    exerciseMap.get(key)!.sets.push(set);
  }

  const exercises = Array.from(exerciseMap.values()).sort(
    (a, b) => a.order - b.order
  );

  return (
    <WorkoutDetailContent
      workout={{
        name: workout.name,
        status: workout.status,
        completedAt: workout.completedAt,
        duration: workout.duration,
        calories: workout.calories,
      }}
      exercises={exercises}
      completedSetsCount={completedSets.length}
      totalVolume={totalVolume}
    />
  );
}

