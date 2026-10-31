import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import FavoritesContent from "@/components/exercises/FavoritesContent";

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const favorites = await prisma.favoriteExercise.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      exercise: {
        select: {
          id: true,
          name: true,
          primaryMuscle: true,
          secondaryMuscles: true,
          equipment: true,
          difficulty: true,
          description: true,
        },
      },
    },
  });

  return <FavoritesContent favorites={favorites} />;
}
