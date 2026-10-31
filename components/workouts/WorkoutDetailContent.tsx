"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Dumbbell,
  Flame,
  Layers3,
  TrendingUp,
  Weight,
} from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import {
  translateExerciseLabel,
  translateExerciseName,
  translateWorkoutDayName,
} from "@/lib/i18n/exercise-labels";

type WorkoutSet = {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  rir: number | null;
  restTime: number | null;
  status: string;
  notes: string | null;
};

type WorkoutExercise = {
  id: string;
  name: string;
  primaryMuscle: string;
  equipment: string | null;
  order: number;
  targetSets: number | null;
  targetReps: number | null;
  sets: WorkoutSet[];
};

type WorkoutData = {
  name: string;
  status: string;
  completedAt: Date | null;
  duration: number | null;
  calories: number | null;
};

function getStatusTranslationKey(status: string) {
  switch (status) {
    case "COMPLETED":
      return "completedWorkoutStatusCompleted" as const;
    case "IN_PROGRESS":
      return "completedWorkoutStatusInProgress" as const;
    case "PENDING":
      return "completedWorkoutStatusPending" as const;
    case "SKIPPED":
      return "completedWorkoutStatusSkipped" as const;
    default:
      return null;
  }
}

export default function WorkoutDetailContent({
  workout,
  exercises,
  completedSetsCount,
  totalVolume,
}: {
  workout: WorkoutData;
  exercises: WorkoutExercise[];
  completedSetsCount: number;
  totalVolume: number;
}) {
  const { t, isRTL, language } = useLanguage();

  const locale = language === "fa" ? "fa-IR" : "en-US";

  const numberFormat = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  });

  const dateFormat = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function formatNumber(value: number) {
    return numberFormat.format(value);
  }

  function formatDate(date: Date | null) {
    if (!date) return t("completedWorkoutUnknownDate");
    return dateFormat.format(new Date(date));
  }

  function formatDuration(duration: number | null) {
    if (!duration) return "—";

    // The existing database value is stored in seconds.
    const minutes = Math.floor(duration / 60);

    if (minutes < 60) {
      return `${formatNumber(minutes)} ${t("completedWorkoutMinutes")}`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${formatNumber(hours)} ${t("completedWorkoutHours")}`;
    }

    return `${formatNumber(hours)} ${t("completedWorkoutHours")} ${formatNumber(remainingMinutes)} ${t("completedWorkoutMinutes")}`;
  }

  function translateStatus(status: string) {
    const key = getStatusTranslationKey(status);
    return key ? t(key) : status;
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto max-w-6xl space-y-8"
    >
      {/* Header */}
      <div>
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950 dark:hover:text-white"
        >
          <ArrowLeft
            size={16}
            className={isRTL ? "rotate-180" : undefined}
          />
          {t("completedWorkoutBack")}
        </Link>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <Dumbbell
                  size={23}
                  className="text-zinc-700 dark:text-zinc-200"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-zinc-500">
                  {t("completedWorkoutLabel")}
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  {translateWorkoutDayName(workout.name, language)}
                </h1>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-2">
                <CalendarDays size={15} />
                {formatDate(workout.completedAt)}
              </span>

              <span className="flex items-center gap-2">
                <Check size={15} />
                {translateStatus(workout.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Clock3 size={16} />
            {t("completedWorkoutDuration")}
          </div>

          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
            {formatDuration(workout.duration)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Layers3 size={16} />
            {t("completedWorkoutSets")}
          </div>

          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
            {formatNumber(completedSetsCount)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Weight size={16} />
            {t("completedWorkoutVolume")}
          </div>

          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
            {formatNumber(totalVolume)}
            <span className="ms-1 text-sm font-medium text-zinc-500">kg</span>
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Flame size={16} />
            {t("completedWorkoutCalories")}
          </div>

          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
            {workout.calories != null
              ? formatNumber(workout.calories)
              : "—"}
          </p>
        </div>
      </div>

      {/* Exercises */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
            {t("completedWorkoutExercises")}
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("completedWorkoutDescription")}
          </p>
        </div>

        <div className="space-y-5">
          {exercises.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <TrendingUp
                size={28}
                className="mx-auto text-zinc-400"
              />

              <p className="mt-3 text-sm text-zinc-500">
                {t("completedWorkoutEmptyExercises")}
              </p>
            </div>
          ) : (
            exercises.map((exercise, index) => {
              const exerciseVolume = exercise.sets.reduce(
                (total, set) =>
                  total + (set.weight ?? 0) * (set.reps ?? 0),
                0
              );

              return (
                <section
                  key={`${exercise.id}-${index}`}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Exercise Header */}
                  <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                            {formatNumber(index + 1)}
                          </span>

                          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
                            {translateExerciseName(exercise.name, language)}
                          </h3>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 ps-11">
                          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {translateExerciseLabel(
                              exercise.primaryMuscle,
                              "muscle",
                              t,
                              language
                            )}
                          </span>

                          {exercise.equipment && (
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                              {translateExerciseLabel(
                                exercise.equipment,
                                "equipment",
                                t,
                                language
                              )}
                            </span>
                          )}

                          {exercise.targetSets != null &&
                            exercise.targetReps != null && (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                {t("completedWorkoutTarget")}: {formatNumber(exercise.targetSets)} × {formatNumber(exercise.targetReps)}
                              </span>
                            )}
                        </div>
                      </div>

                      <div className="text-start">
                        <p className="text-xs text-zinc-500">
                          {t("completedWorkoutExerciseVolume")}
                        </p>

                        <p className="mt-1 font-semibold text-zinc-950 dark:text-white">
                          {formatNumber(exerciseVolume)} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sets Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
                          <th className="px-5 py-3 text-start">
                            {t("completedWorkoutSet")}
                          </th>
                          <th className="px-5 py-3 text-start">
                            {t("completedWorkoutWeight")}
                          </th>
                          <th className="px-5 py-3 text-start">
                            {t("completedWorkoutReps")}
                          </th>
                          <th className="px-5 py-3 text-start">RPE</th>
                          <th className="px-5 py-3 text-start">RIR</th>
                          <th className="px-5 py-3 text-start">
                            {t("completedWorkoutRest")}
                          </th>
                          <th className="px-5 py-3 text-start">
                            {t("completedWorkoutStatus")}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {exercise.sets.map((set) => (
                          <tr
                            key={set.id}
                            className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/70"
                          >
                            <td className="px-5 py-4 font-medium text-zinc-950 dark:text-white">
                              {formatNumber(set.setNumber)}
                            </td>

                            <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">
                              {set.weight !== null
                                ? `${formatNumber(set.weight)} kg`
                                : "—"}
                            </td>

                            <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">
                              {set.reps != null
                                ? formatNumber(set.reps)
                                : "—"}
                            </td>

                            <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">
                              {set.rpe != null
                                ? formatNumber(set.rpe)
                                : "—"}
                            </td>

                            <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">
                              {set.rir != null
                                ? formatNumber(set.rir)
                                : "—"}
                            </td>

                            <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">
                              {set.restTime
                                ? `${formatNumber(set.restTime)}${t("completedWorkoutSeconds")}`
                                : "—"}
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                <Check size={12} />
                                {translateStatus(set.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Notes */}
                  {exercise.sets.some((set) => set.notes) && (
                    <div className="border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
                      <p className="mb-2 text-xs font-medium text-zinc-500">
                        {t("completedWorkoutNotes")}
                      </p>

                      <div className="space-y-1">
                        {exercise.sets
                          .filter((set) => set.notes)
                          .map((set) => (
                            <p
                              key={set.id}
                              className="text-sm text-zinc-700 dark:text-zinc-300"
                            >
                              <span className="font-medium">
                                {t("completedWorkoutSet")} {formatNumber(set.setNumber)}:
                              </span>{" "}
                              {set.notes}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
