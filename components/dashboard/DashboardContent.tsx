"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Dumbbell,
  Flame,
  Timer,
  Trophy,
  Weight,
} from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

type WeeklyDataItem = {
  day: string;
  value: number;
};

type PersonalRecordItem = {
  id: string;
  exerciseName: string;
  weight: number;
};

type DashboardContentProps = {
  dateISO: string;
  userName: string;

  todayWorkoutName: string | null;
  todayWorkoutExercisesCount: number;
  hasTodayWorkout: boolean;
  latestPlanId: string | null;

  completedWorkoutsCount: number;
  totalTrainingMinutes: number;
  totalVolume: number;
  totalCalories: number;

  workoutsChange: string;
  trainingTimeChange: string;
  volumeChange: string;

  thisWeekWorkoutCount: number;
  weeklyData: WeeklyDataItem[];

  goal: string | null;
  currentWeight: number | null;
  personalRecords: PersonalRecordItem[];
};

const weekdayKeys: Record<string, TranslationKey> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

const goalKeys: Record<string, TranslationKey> = {
  MUSCLE_GAIN: "goalBuildMuscle",
  FAT_LOSS: "goalFatLoss",
  STRENGTH: "goalBuildStrength",
  MAINTENANCE: "goalMaintenance",
  GENERAL_FITNESS: "goalGeneralFitness",
  ENDURANCE: "goalEndurance",
};

export default function DashboardContent({
  dateISO,
  userName,
  todayWorkoutName,
  todayWorkoutExercisesCount,
  hasTodayWorkout,
  latestPlanId,
  completedWorkoutsCount,
  totalTrainingMinutes,
  totalVolume,
  totalCalories,
  workoutsChange,
  trainingTimeChange,
  volumeChange,
  thisWeekWorkoutCount,
  weeklyData,
  goal,
  currentWeight,
  personalRecords,
}: DashboardContentProps) {
  const { language, isRTL, t } = useLanguage();

  const locale = language === "fa" ? "fa-IR" : "en-US";

  const numberFormat = new Intl.NumberFormat(locale);

  function formatNumber(value: number) {
    return numberFormat.format(value);
  }

  function formatChange(value: string) {
    if (language === "en") return value;

    return value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
  }

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (language === "fa") {
      if (hours === 0) {
        return `${formatNumber(mins)} ${t("minutesShort")}`;
      }

      if (mins === 0) {
        return `${formatNumber(hours)} ${t("hoursShort")}`;
      }

      return `${formatNumber(hours)} ${t("hoursShort")} و ${formatNumber(mins)} ${t("minutesShort")}`;
    }

    if (hours === 0) {
      return `${mins}m`;
    }

    return `${hours}h ${mins}m`;
  }

  const today = new Intl.DateTimeFormat(
    language === "fa" ? "fa-IR-u-ca-persian" : "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  ).format(new Date(dateISO));

  const goalLabel = goal
    ? goalKeys[goal]
      ? t(goalKeys[goal])
      : goal
    : t("noGoalSet");
  const displayName = userName || t("athlete");
  const stats = [
    {
      title: "workouts",
      value: formatNumber(completedWorkoutsCount),
      change: workoutsChange,
      icon: Dumbbell,
    },
    {
      title: "trainingTime",
      value: formatDuration(totalTrainingMinutes),
      change: trainingTimeChange,
      icon: Timer,
    },
    {
      title: "volume",
      value: `${formatNumber(Math.round(totalVolume))} kg`,
      change: volumeChange,
      icon: Weight,
    },
    {
      title: "calories",
      value: formatNumber(totalCalories),
      change: "—",
      icon: Flame,
    },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Welcome */}
      <section>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {today}
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {t("goodMorning")}, {displayName} 👋
        </h1>

        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          {t("readyWorkout")}
        </p>
      </section>

      {/* Today's Workout */}
      <section className="overflow-hidden rounded-2xl bg-zinc-900 p-6 text-white dark:bg-zinc-800">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              {t("todayWorkout")}
            </div>

            <h2 className="text-2xl font-bold">
              {todayWorkoutName ?? t("noWorkoutPlanned")}
            </h2>

            <div className="mt-4 flex flex-wrap gap-5 text-sm text-zinc-300">
              <span className="flex items-center gap-2">
                <Dumbbell size={16} />
                {formatNumber(todayWorkoutExercisesCount)} {t("exercises")}
              </span>

              <span className="flex items-center gap-2">
                <Timer size={16} />
                {t("readyToTrain")}
              </span>
            </div>
          </div>

          {latestPlanId && hasTodayWorkout && (
            <Link
              href={`/workouts/${latestPlanId}/session`}
              className="!text-zinc-900 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold transition hover:bg-zinc-200"
            >
              <span className="!text-zinc-900">{t("startWorkout")}</span>

              <ArrowUpRight
                size={18}
                className={`!text-zinc-900 ${isRTL ? "rotate-[-90deg]" : ""}`}
              />
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <Icon size={19} />
                </div>

                <span className="text-xs font-semibold text-emerald-600">
                  {formatChange(stat.change)}
                </span>
              </div>

              <p className="mt-5 text-sm text-zinc-500 dark:text-zinc-400">
                {t(stat.title)}
              </p>

              <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* Analytics */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Progress */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-zinc-950 dark:text-white">
                {t("weeklyProgress")}
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {t("trainingActivityThisWeek")}
              </p>
            </div>

            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {formatNumber(thisWeekWorkoutCount)} {t("workouts")}
            </span>
          </div>

          <div className="mt-8 flex h-56 items-end justify-between gap-3">
            {weeklyData.map((item) => (
              <div
                key={item.day}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-3"
              >
                <div
                  className="w-full max-w-10 rounded-t-lg bg-zinc-900 transition hover:bg-zinc-700 dark:bg-zinc-200 dark:hover:bg-zinc-300"
                  style={{
                    height: `${item.value}%`,
                  }}
                />

                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t(weekdayKeys[item.day] ?? "mon")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold text-zinc-950 dark:text-white">
            {t("currentGoal")}
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {goalLabel}
          </p>

          <div className="mt-8 flex items-center justify-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-[12px] border-zinc-200 dark:border-zinc-700">
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {currentWeight === null ? "—" : formatNumber(currentWeight)}
                </p>

                <p className="text-xs text-zinc-500">kg</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t("current")}
            </span>

            <span className="font-semibold text-zinc-950 dark:text-white">
              {currentWeight !== null
                ? `${formatNumber(currentWeight)} kg`
                : t("notSet")}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t("target")}
            </span>

            <span className="font-semibold text-zinc-950 dark:text-white">
              {t("notSet")}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-full w-0 rounded-full bg-zinc-900 dark:bg-white" />
          </div>
        </div>
      </section>

      {/* Personal Records */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <Trophy size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-zinc-950 dark:text-white">
              {t("personalRecords")}
            </h2>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("yourStrongestLifts")}
            </p>
          </div>
        </div>

        {personalRecords.length === 0 ? (
          <div className="mt-6 rounded-xl bg-zinc-50 p-5 text-center dark:bg-zinc-800/60">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("noPersonalRecords")}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {personalRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60"
              >
                <span className="min-w-0 text-sm font-medium">
                  {record.exerciseName}
                </span>

                <span className="shrink-0 font-bold">
                  {formatNumber(record.weight)} kg 🏆
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
export function DashboardUserMissing() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl" dir={isRTL ? "rtl" : "ltr"}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-bold">{t("noUserFound")}</h1>

        <p className="mt-2 text-sm text-zinc-500">{t("createUserToStart")}</p>
      </div>
    </div>
  );
}
