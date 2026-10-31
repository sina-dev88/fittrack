import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WorkoutsContent from "@/components/workouts/WorkoutsContent";

export default async function WorkoutsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const plans = await prisma.workoutPlan.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      isTemplate: true,
      days: {
        orderBy: {
          dayNumber: "asc",
        },
        select: {
          id: true,
          name: true,
          dayNumber: true,
          exercises: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return <WorkoutsContent plans={plans} />;
}
