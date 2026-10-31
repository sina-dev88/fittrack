
"use client";

import { BarChart3, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import LogSleepModal from "./LogSleepModal";

type SleepLatest = {
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
};

type SleepSummaryData = {
  averageSleepMinutes: number;
  averageSleepHours: number;
  averageQuality: number;
  averageEnergy: number;
  averageStress: number;
  recordedDays: number;
  consistency: number;
};

type SleepSummaryProps = {
  latest: SleepLatest | null;
  summary: SleepSummaryData;
  onSaved?: (sleep: SleepLatest) => void;
};

function formatDuration(minutes: number, language: "en" | "fa") {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (language === "fa") {
    return mins === 0
      ? `${hours} ساعت`
      : `${hours} ساعت و ${mins} دقیقه`;
  }

  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export default function SleepSummary({
  latest,
  summary,
  onSaved,
}: SleepSummaryProps) {
  const { t, language, isRTL } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-300" />
              <h2 className="text-lg font-semibold">
                {t("sleepSummaryTitle")}
              </h2>
            </div>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t("sleepSummaryDescription")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {t("sleepLogSleep")}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("sleepAverage")}
            </p>

            <p className="mt-2 text-2xl font-bold">
              {formatDuration(summary.averageSleepMinutes, language)}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("sleepConsistency")}
            </p>

            <p className="mt-2 text-2xl font-bold" dir="ltr">
              {summary.consistency}%
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("lastNight")}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <p className="text-2xl font-bold">
                {latest
                  ? formatDuration(latest.durationMinutes, language)
                  : "—"}
              </p>

              {latest && <TrendingUp className="h-4 w-4 text-zinc-500" />}
            </div>
          </div>
        </div>
      </div>

      <LogSleepModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={(sleep) => {
          setIsModalOpen(false);
          onSaved?.(sleep);
        }}
      />
    </>
  );
}
