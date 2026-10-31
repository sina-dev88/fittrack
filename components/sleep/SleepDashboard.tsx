"use client";

import { useCallback, useEffect, useState } from "react";

import RecoveryOverview from "@/components/sleep/RecoveryOverview";
import SleepGoalCard from "@/components/sleep/SleepGoalCard";
import SleepSummary from "@/components/sleep/SleepSummary";
import SleepHistory from "@/components/sleep/SleepHistory";
import RecoveryFactors from "@/components/sleep/RecoveryFactors";

import { useLanguage } from "@/components/language/LanguageProvider";

export type SleepHistoryItem = {
  date: string;
  durationMinutes: number;
  quality: number | null;
  energy: number | null;
  stress: number | null;
  awakenings: number | null;
  hasData: boolean;
};

export type SleepData = {
  recovery: {
    score: number;
    label: string;
    factors: {
      sleep: number;
      training: number;
      nutrition: number;
      consistency: number;
    };
  };

  goal: {
    id: string;
    targetMinutes: number;
    targetBedtime: string | null;
    targetWakeTime: string | null;
  } | null;

  latest: {
    id: string;
    dateKey: string;
    bedtime: string | null;
    wakeTime: string | null;
    durationMinutes: number;
    quality: number | null;
    energy: number | null;
    stress: number | null;
    awakenings: number | null;
    notes: string | null;
  } | null;

  summary: {
    averageSleepMinutes: number;
    averageSleepHours: number;
    averageQuality: number;
    averageEnergy: number;
    averageStress: number;
    recordedDays: number;
    consistency: number;
  };

  history: SleepHistoryItem[];
};

export default function SleepDashboard() {
  const { t, isRTL } = useLanguage();

  const [data, setData] = useState<SleepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadSleep = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setHasError(false);

      const response = await fetch("/api/sleep?days=30", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load sleep data.");
      }

      setData(result);
    } catch (error) {
      console.error(error);
      setHasError(true);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadSleep(true);
  }, [loadSleep]);

  if (loading) {
    return (
      <div className="w-full space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div>
          <div className="h-8 w-52 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        </div>

        <div className="h-80 animate-pulse rounded-2xl bg-muted" />

        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {t("sleepPageTitle")}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("sleepPageDescription")}
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <p>{t("sleepLoadError")}</p>

          <button
            type="button"
            onClick={() => void loadSleep(true)}
            className="mt-4 block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {t("sleepRetry")}
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {t("sleepPageTitle")}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("sleepPageDescription")}
        </p>
      </div>

      <RecoveryOverview recovery={data.recovery} latest={data.latest} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SleepGoalCard
          goal={data.goal}
          latest={data.latest}
          onUpdated={(updatedGoal) => {
            setData((current) =>
              current
                ? {
                    ...current,
                    goal: updatedGoal,
                  }
                : current,
            );
          }}
        />
        <SleepSummary
          latest={data.latest}
          summary={data.summary}
          onSaved={(sleep) => {
            setData((current) => {
              if (!current) return current;

              return {
                ...current,
                latest: sleep,
              };
            });
          }}
        />
      </div>

      <SleepHistory
        history={data.history}
        targetMinutes={data.goal?.targetMinutes ?? 480}
      />

      <RecoveryFactors recovery={data.recovery} />
    </div>
  );
}
