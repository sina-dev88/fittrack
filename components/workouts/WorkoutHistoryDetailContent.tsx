"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Dumbbell,
} from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";

import {
  translateExerciseLabel,
  translateExerciseName,
  translateWorkoutDayName,
  translateWorkoutPlanName,
} from "@/lib/i18n/exercise-labels";

type WorkoutHistoryDetails = {
  name: string;
  completedAt: Date | null;
  duration: number | null;
  workoutPlan: {
    name: string;
  } | null;
  sets: {
    id: string;
    setNumber: number;
    weight: number | null;
    reps: number | null;
    rpe: number | null;
    workoutExercise: {
      exercise: {
        name: string;
        primaryMuscle: string;
      };
    } | null;
  }[];
};

export default function WorkoutHistoryDetailContent({
  workout,
  totalVolume,
}: {
  workout: WorkoutHistoryDetails;
  totalVolume: number;
}) {
  const { t, isRTL, language } = useLanguage();

  const locale = language === "fa" ? "fa-IR" : "en-US";

  const numberFormat = new Intl.NumberFormat(locale);

  const dateFormat = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const completedDate = workout.completedAt
    ? dateFormat.format(new Date(workout.completedAt))
    : t("workoutHistoryUnknownDate");

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <Link
          href="/workout-history"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-950 dark:hover:text-white"
        >
          <ArrowLeft
            size={16}
            className={isRTL ? "rotate-180" : ""}
          />

          {t("workoutHistoryBack")}
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {translateWorkoutDayName(workout.name, language)}
            </h1>

            {workout.workoutPlan && (
              <p className="mt-1 text-sm text-zinc-500">
                {translateWorkoutPlanName(
                  workout.workoutPlan.name,
                  language
                )}
              </p>
            )}
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">
            {t("workoutHistoryCompleted")}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <CalendarDays
              size={19}
              className="text-zinc-400"
            />

            <div>
              <p className="text-xs text-zinc-500">
                {t("workoutHistoryDate")}
              </p>

              <p className="mt-1 text-sm font-semibold">
                {completedDate}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <Clock
              size={19}
              className="text-zinc-400"
            />

            <div>
              <p className="text-xs text-zinc-500">
                {t("workoutHistoryDuration")}
              </p>

              <p className="mt-1 text-sm font-semibold">
                {workout.duration
                  ? `${numberFormat.format(workout.duration)} ${t("workoutHistoryMinutes")}`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <Dumbbell
              size={19}
              className="text-zinc-400"
            />

            <div>
              <p className="text-xs text-zinc-500">
                {t("workoutHistorySets")}
              </p>

              <p className="mt-1 text-sm font-semibold">
                {numberFormat.format(workout.sets.length)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <p className="text-xs text-zinc-500">
              {t("workoutHistoryTotalVolume")}
            </p>

            <p className="mt-1 text-lg font-bold">
              {numberFormat.format(totalVolume)} kg
            </p>
          </div>
        </div>
      </div>

      {/* Workout Performance */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="font-semibold">
            {t("workoutHistoryPerformance")}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {t("workoutHistoryPerformanceDescription")}
          </p>
        </div>

        {workout.sets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-500">
              {t("workoutHistoryNoSets")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {workout.sets.map((set) => {
              const exercise = set.workoutExercise?.exercise;

              return (
                <div
                  key={set.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-medium">
                      {exercise
                        ? translateExerciseName(
                            exercise.name,
                            language
                          )
                        : t("workoutHistoryExercise")}
                    </h3>

                    {exercise?.primaryMuscle && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {translateExerciseLabel(
                          exercise.primaryMuscle,
                          "muscle",
                          t,
                          language
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-lg bg-zinc-100 px-3 py-1.5 font-medium dark:bg-zinc-800">
                      {t("workoutHistorySet")}{" "}
                      {numberFormat.format(set.setNumber)}
                    </span>

                    <span className="rounded-lg bg-zinc-100 px-3 py-1.5 font-medium dark:bg-zinc-800">
                      {numberFormat.format(set.weight ?? 0)} kg
                    </span>

                    <span className="rounded-lg bg-zinc-100 px-3 py-1.5 font-medium dark:bg-zinc-800">
                      {numberFormat.format(set.reps ?? 0)}{" "}
                      {t("workoutHistoryReps")}
                    </span>

                    {set.rpe !== null && (
                      <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        RPE {numberFormat.format(set.rpe)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}