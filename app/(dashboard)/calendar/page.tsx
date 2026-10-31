import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import WorkoutCalendar from "@/components/calendar/WorkoutCalendar";
import CalendarPageHeader from "@/components/calendar/CalendarPageHeader";

export default async function CalendarPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const workouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      completedAt: {
        not: null,
      },
    },
    orderBy: {
      completedAt: "asc",
    },
    select: {
      id: true,
      name: true,
      completedAt: true,
    },
  });

  const calendarWorkouts = workouts
    .filter(
      (
        workout,
      ): workout is typeof workout & {
        completedAt: Date;
      } => workout.completedAt !== null,
    )
    .map((workout) => ({
      id: workout.id,
      name: workout.name,
      completedAt: workout.completedAt.toISOString(),
    }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <CalendarPageHeader />

      <WorkoutCalendar workouts={calendarWorkouts} />
    </div>
  );
}
