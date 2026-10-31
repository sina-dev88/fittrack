"use client";

import Link from "next/link";
import ProgressCharts from "@/components/progress/ProgressCharts";
import WeightForm from "@/components/progress/WeightForm";
import ExerciseProgress from "@/components/progress/ExerciseProgress";
import { useLanguage } from "@/components/language/LanguageProvider";

type Metric = {
  id: string;
  weight: number | null;
  bodyFat: number | null;
  recordedAt: string;
};

type WeeklyItem = {
  week: string;
  volume: number;
  workouts: number;
};

type StrengthItem = {
  date: string;
  exercise: string;
  estimated1RM: number;
};

type ProgressContentProps = {
  metrics: Metric[];
  weekly: WeeklyItem[];
  strength: StrengthItem[];
  latestWeight: number | null;
  weightChange: number | null;
  totalWorkouts: number;
  totalVolume: number;
  personalRecordsCount: number;
};

export default function ProgressContent({
  metrics,
  weekly,
  strength,
  latestWeight,
  weightChange,
  totalWorkouts,
  totalVolume,
  personalRecordsCount,
}: ProgressContentProps) {
  const { language, isRTL, t } = useLanguage();

  const locale = language === "fa" ? "fa-IR-u-ca-persian" : "en-US";

  const numberFormat = new Intl.NumberFormat(locale);

  const decimalFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const formatNumber = (value: number) => numberFormat.format(value);

  const formatDecimal = (value: number) => decimalFormat.format(value);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale).format(new Date(value));

  return (
    <div
      className="mx-auto max-w-6xl space-y-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            {t("progress")}
          </h1>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("progressDescription")}
          </p>
        </div>

        <Link
          href="/progress/prs"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {t("viewPersonalRecords")}
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("currentWeight")}
          </p>

          <p className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
            {latestWeight !== null
              ? `${formatNumber(latestWeight)} kg`
              : "—"}
          </p>

          {weightChange !== null && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {weightChange > 0 ? "+" : ""}
              {formatDecimal(weightChange)} kg {t("vsPrevious")}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("totalWorkoutsLabel")}
          </p>

          <p className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
            {formatNumber(totalWorkouts)}
          </p>

          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t("completedSessions")}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("totalVolumeLabel")}
          </p>

          <p className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
            {formatNumber(Math.round(totalVolume))} kg
          </p>

          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t("weightTimesReps")}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("personalRecords")}
          </p>

          <p className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
            {formatNumber(personalRecordsCount)}
          </p>

          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t("recordedPRs")}
          </p>
        </div>
      </div>

      {/* Weight history */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
            {t("bodyWeight")}
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("recordWeightOverTime")}
          </p>
        </div>

        <WeightForm />

        <div className="mt-6 space-y-3">
          {metrics.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("noMeasurementsYet")}
            </p>
          ) : (
            metrics.map((metric) => (
              <div
                key={metric.id}
                className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-950"
              >
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(metric.recordedAt)}
                </span>

                <span className="font-medium text-zinc-950 dark:text-white">
                  {metric.weight !== null
                    ? `${formatNumber(metric.weight)} kg`
                    : "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Exercise Performance */}
      <ExerciseProgress />

      {/* Charts */}
      <ProgressCharts weekly={weekly} strength={strength} />
    </div>
  );
}