"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  LoaderCircle,
  Minus,
  RefreshCw,
} from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

type ProgressStatus =
  | "INSUFFICIENT_DATA"
  | "CHECK_DATA"
  | "IMPROVING"
  | "DECLINING"
  | "STABLE";

type ExerciseProgressItem = {
  exerciseId: string;
  name: string;
  primaryMuscle: string;
  sessionCount: number;
  estimated1RMChangePercent: number | null;
  progression: {
    status: ProgressStatus;
    recommendation: string;
    latestEstimated1RM: number | null;
    previousEstimated1RM: number | null;
    validSetCount: number;
  };
};

type ProgressResponse = {
  exercises: ExerciseProgressItem[];
};

const statusConfig: Record<
  ProgressStatus,
  {
    labelKey: TranslationKey;
    className: string;
    icon: typeof Activity;
  }
> = {
  IMPROVING: {
    labelKey: "improving",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: ArrowUpRight,
  },
  STABLE: {
    labelKey: "stable",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: Minus,
  },
  DECLINING: {
    labelKey: "declining",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: ArrowDownRight,
  },
  CHECK_DATA: {
    labelKey: "checkData",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
    icon: AlertTriangle,
  },
  INSUFFICIENT_DATA: {
    labelKey: "insufficientData",
    className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
    icon: Activity,
  },
};

export default function ExerciseProgress() {
  const { language, isRTL, t } = useLanguage();

  const [items, setItems] = useState<ExerciseProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const locale = language === "fa" ? "fa-IR" : "en-US";

  const numberFormat = new Intl.NumberFormat(locale);

  const decimalFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  async function loadProgress() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/progress/exercises", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(t("couldNotLoadExerciseProgress"));
      }

      const data: ProgressResponse = await response.json();
      setItems(data.exercises ?? []);
    } catch (error) {
      console.error(error);
      setError(t("progressDataLoadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProgress();
    // Load the progress data when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const improvingCount = items.filter(
    (item) => item.progression.status === "IMPROVING",
  ).length;

  const checkCount = items.filter(
    (item) => item.progression.status === "CHECK_DATA",
  ).length;

  function getRecommendation(recommendation: string) {
    if (
      recommendation
        .trim()
        .toLowerCase()
        .includes(
          "complete at least two sessions with valid working sets",
        )
    ) {
      return t("recommendationNeedsMoreSessions");
    }

    return recommendation;
  }

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-emerald-500" />

            <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
              {t("exercisePerformanceTitle")}
            </h2>
          </div>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("trainingTrendsDescription")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadProgress()}
          disabled={loading}
          className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-xl border border-zinc-200 px-3 text-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800 sm:self-auto"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />

          {t("refresh")}
        </button>
      </div>

      {!loading && !error && items.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-500/5 p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("improving")}
            </p>

            <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {numberFormat.format(improvingCount)}
            </p>
          </div>

          <div className="rounded-xl bg-red-500/5 p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("needsDataReview")}
            </p>

            <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
              {numberFormat.format(checkCount)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500 dark:text-zinc-400">
            <LoaderCircle size={18} className="animate-spin" />
            {t("analyzingTraining")}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-500/5 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadProgress()}
              className="mt-3 text-sm font-medium underline"
            >
              {t("tryAgain")}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Activity size={28} className="text-zinc-400" />

            <p className="mt-3 font-medium text-zinc-950 dark:text-white">
              {t("noExerciseDataYet")}
            </p>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t("completeWorkoutForTrends")}
            </p>
          </div>
        ) : (
          items.map((item) => {
            const status = statusConfig[item.progression.status];
            const StatusIcon = status.icon;
            const change = item.estimated1RMChangePercent;

            return (
              <article
                key={item.exerciseId}
                className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-950 dark:text-white">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.primaryMuscle} ·{" "}
                      {numberFormat.format(item.sessionCount)}{" "}
                      {language === "fa"
                        ? "جلسه"
                        : item.sessionCount === 1
                          ? "session"
                          : "sessions"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${status.className}`}
                  >
                    <StatusIcon size={14} />
                    {t(status.labelKey)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t("estimatedOneRM")}
                    </p>

                    <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
                      {item.progression.latestEstimated1RM !== null
                        ? `${decimalFormat.format(item.progression.latestEstimated1RM)} kg`
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t("changeVsPrevious")}
                    </p>

                    <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
                      {change !== null
                        ? `${change > 0 ? "+" : ""}${decimalFormat.format(change)}%`
                        : "—"}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {getRecommendation(item.progression.recommendation)}
                </p>

                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {numberFormat.format(item.progression.validSetCount)}{" "}
                  {t("validSetsLatestSession")}
                </p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
