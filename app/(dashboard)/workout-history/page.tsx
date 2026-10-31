import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Dumbbell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function WorkoutHistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const user = await prisma.user.findFirst();

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workout History</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your completed workouts will appear here.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">No user found.</p>
        </div>
      </div>
    );
  }

  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    orderBy: {
      completedAt: "desc",
    },
    take: 50,
    select: {
      id: true,
      name: true,
      completedAt: true,
      duration: true,
      workoutPlan: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          sets: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/workouts"
            className="mb-3 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-950 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Workouts
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">Workout History</h1>

          <p className="mt-1 text-sm text-zinc-500">
            Review your completed training sessions.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {workouts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Dumbbell size={24} />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            No completed workouts yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            Complete your first workout and it will appear here.
          </p>

          <Link
            href="/workouts"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Dumbbell size={17} />
            View Workouts
          </Link>
        </div>
      ) : (
        /* Workout List */
        <div className="space-y-3">
          {workouts.map((workout) => {
            const completedDate = workout.completedAt
              ? new Date(workout.completedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Unknown date";

            return (
              <Link
                key={workout.id}
                href={`/workout-history/${workout.id}`}
                className="group block rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <Dumbbell size={20} />
                    </div>

                    <div>
                      <h2 className="font-semibold group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                        {workout.name}
                      </h2>

                      {workout.workoutPlan && (
                        <p className="mt-1 text-sm text-zinc-500">
                          {workout.workoutPlan.name}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {completedDate}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} />
                          {workout.duration ? `${workout.duration} min` : "—"}
                        </span>

                        <span>{workout._count.sets} sets</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-zinc-400 transition group-hover:text-zinc-950 dark:group-hover:text-white">
                    View Details →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
