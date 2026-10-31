
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

type ExerciseItem = {
  exerciseId: string;
  name: string;
  primaryMuscle: string;
  sessionCount: number;
  progression: {
    status:
      | "INSUFFICIENT_DATA"
      | "CHECK_DATA"
      | "IMPROVING"
      | "DECLINING"
      | "STABLE";
    recommendation: string;
    latestEstimated1RM: number | null;
    previousEstimated1RM: number | null;
    validSetCount: number;
  };
};

type ApiResponse = {
  exercises: ExerciseItem[];
};

const statusLabels: Record<ExerciseItem["progression"]["status"], string> = {
  IMPROVING: "Improving",
  STABLE: "Stable",
  DECLINING: "Declining",
  CHECK_DATA: "Check data",
  INSUFFICIENT_DATA: "Not enough data",
};

export default function ReviewWorkoutPlanPage() {
  const params = useParams<{ id: string }>();
  const planId = params.id;

  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/progress/exercises", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load your training analysis.");
        }

        const data: ApiResponse = await response.json();

        if (active) {
          setExercises(data.exercises ?? []);
        }
      } catch {
        if (active) {
          setError("Your training analysis could not be loaded. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const improving = exercises.filter(
    (item) => item.progression.status === "IMPROVING",
  ).length;

  const needsAttention = exercises.filter((item) =>
    ["CHECK_DATA", "DECLINING", "INSUFFICIENT_DATA"].includes(
      item.progression.status,
    ),
  ).length;

  return (
    <main className="mx-auto max-w-5xl space-y-7">
      <Link
        href={`/workouts/plans/${planId}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to workout plan
      </Link>

      <header>
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Activity size={20} />
          <span className="text-sm font-semibold">
            FOUR-WEEK REVIEW
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Review your training
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Review your recent performance and data quality before making
          changes to your workout plan.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-200 p-12 text-sm text-zinc-500 dark:border-zinc-800">
          <LoaderCircle size={18} className="animate-spin" />
          Analyzing your training...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 p-5">
          <p className="text-sm text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-medium underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">Tracked exercises</p>
              <p className="mt-2 text-3xl font-semibold">{exercises.length}</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <p className="text-sm text-zinc-500">Improving</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
                {improving}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-sm text-zinc-500">Needs attention</p>
              <p className="mt-2 text-3xl font-semibold text-amber-600 dark:text-amber-400">
                {needsAttention}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Exercise analysis</h2>

            {exercises.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800">
                No completed exercise data is available yet.
              </div>
            ) : (
              exercises.map((item) => (
                <article
                  key={item.exerciseId}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.primaryMuscle} · {item.sessionCount} sessions
                      </p>
                    </div>

                    <span className="h-fit w-fit rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium dark:bg-zinc-800">
                      {statusLabels[item.progression.status]}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {item.progression.recommendation}
                  </p>
                </article>
              ))
            )}
          </section>

          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <div className="flex items-start gap-3">
              {needsAttention > 0 ? (
                <AlertTriangle
                  size={22}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
              ) : (
                <CheckCircle2
                  size={22}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />
              )}

              <div>
                <h2 className="font-semibold">
                  Ready for the next step?
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  This review summarizes your recorded performance. The
                  updated plan generator is the next step and will need to
                  preserve your current plan until you approve a replacement.
                </p>

                <Link
                  href={`/workouts/plans/${planId}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Return to plan
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
