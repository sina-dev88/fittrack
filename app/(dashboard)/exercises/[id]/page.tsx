import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

import ExerciseDetailContent from "@/components/exercises/ExerciseDetailContent";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExerciseDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const exercise = await prisma.exercise.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      primaryMuscle: true,
      secondaryMuscles: true,
      equipment: true,
      difficulty: true,
      description: true,
      instructions: true,
      commonMistakes: true,
      isCustom: true,
      favorites: session?.user?.id
        ? {
            where: {
              userId: session.user.id,
            },
            select: {
              id: true,
            },
          }
        : false,
    },
  });

  if (!exercise) {
    notFound();
  }

  return (
    <ExerciseDetailContent
      exercise={{
        id: exercise.id,
        name: exercise.name,
        primaryMuscle: exercise.primaryMuscle,
        secondaryMuscles: exercise.secondaryMuscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        description: exercise.description,
        instructions: exercise.instructions,
        commonMistakes: exercise.commonMistakes,
        isCustom: exercise.isCustom,
      }}
      initialFavorited={
        Array.isArray(exercise.favorites) &&
        exercise.favorites.length > 0
      }
    />
  );
}
