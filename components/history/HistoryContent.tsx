"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Layers3,
  Weight,
} from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";

type WorkoutHistoryItem = {
  id: string;
  name: string;
  completedAt: string | null;
  duration: number | null;
  calories: number | null;
  totalVolume: number;
  setCount: number;
};

export default function HistoryContent({
  history,
}: {
  history: WorkoutHistoryItem[];
}) {
  const { language, isRTL, t } = useLanguage();

  const locale =
    language === "fa" ? "fa-IR-u-ca-persian" : "en-US";

  const numberFormat = new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : "en-US",
  );

  function formatNumber(value: number) {
    return numberFormat.format(value);
  }

  function formatDate(date: string | null) {
    if (!date) {
      return t("unknownWorkoutDate");
    }

    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  }

  function formatDuration(duration: number | null) {
    if (!duration || duration <= 0) {
      return "—";
    }

    if (duration < 60) {
      return `${formatNumber(duration)} ${t("historyMinutesShort")}`;
    }

    const hours = Math.floor(duration / 60);
    const remainingMinutes = duration % 60;

    if (language === "fa") {
      const hourText = `${formatNumber(hours)} ${t("historyHoursShort")}`;

      if (remainingMinutes === 0) {
        return hourText;
      }

      return `${hourText} و ${formatNumber(remainingMinutes)} ${t("historyMinutesShort")}`;
    }

    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  return (
    <div
      className="mx-auto max-w-6xl space-y-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {t("historyTrainingLabel")}
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {t("workoutHistoryTitle")}
        </h1>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t("workoutHistoryDescription")}
        </p>
      </div>

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Dumbbell size={24} className="text-zinc-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-zinc-950 dark:text-white">
            {t("noCompletedWorkouts")}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            {t("completeFirstWorkout")}
          </p>

          <Link
            href="/workouts"
            className="mt-6 inline-flex h-10 items-center rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {t("goToWorkouts")}
          </Link>
        </div>
      ) : (
        /* Completed workout list */
        <div className="space-y-4">
          {history.map((workout) => (
            <Link
              key={workout.id}
              href={`/workouts/${workout.id}`}
              className="group block rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <Dumbbell
                        size={20}
                        className="text-zinc-600 dark:text-zinc-300"
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-zinc-950 dark:text-white">
                        {workout.name}
                      </h2>

                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <CalendarDays size={14} />
                        <span>{formatDate(workout.completedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <ChevronRight
                  size={20}
                  className={`mt-2 shrink-0 text-zinc-400 transition ${
                    isRTL
                      ? "rotate-180 group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Clock3 size={14} />
                    {t("historyDuration")}
                  </div>

                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    {formatDuration(workout.duration)}
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Layers3 size={14} />
                    {t("historySets")}
                  </div>

                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    {formatNumber(workout.setCount)}
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Weight size={14} />
                    {t("historyVolume")}
                  </div>

                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    {formatNumber(workout.totalVolume)} kg
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Flame size={14} />
                    {t("historyCalories")}
                  </div>

                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    {workout.calories === null
                      ? "—"
                      : formatNumber(workout.calories)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}