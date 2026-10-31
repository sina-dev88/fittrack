
"use client";

import { useState } from "react";
import { Moon, Pencil, Target } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";
import SleepGoalModal from "./SleepGoalModal";

type SleepGoal = {
  id: string;
  targetMinutes: number;
  targetBedtime: string | null;
  targetWakeTime: string | null;
};

type SleepLatest = {
  durationMinutes: number;
} | null;

type SleepGoalCardProps = {
  goal: SleepGoal | null;
  latest?: SleepLatest;
  onUpdated?: (goal: SleepGoal) => void;
};

function formatDuration(minutes: number, language: "en" | "fa") {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (language === "fa") {
    return remainingMinutes === 0
      ? `${hours} ساعت`
      : `${hours} ساعت و ${remainingMinutes} دقیقه`;
  }

  return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}m`;
}

export default function SleepGoalCard({
  goal,
  latest = null,
  onUpdated,
}: SleepGoalCardProps) {
  const { t, language, isRTL } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const targetSleepMinutes = goal?.targetMinutes ?? 480;
  const currentSleepMinutes = latest?.durationMinutes ?? 0;

  const progress =
    targetSleepMinutes > 0
      ? Math.min(
          Math.round((currentSleepMinutes / targetSleepMinutes) * 100),
          100,
        )
      : 0;

  return (
    <>
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{t("sleepGoal")}</h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("sleepGoalDescription")}
            </p>
          </div>

          <Moon className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-bold">
                {formatDuration(targetSleepMinutes, language)}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("sleepDailyTarget")}
              </p>
            </div>

            <span className="text-sm font-medium" dir="ltr">
              {progress}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {latest
                ? t("sleepSleptLastNight").replace(
                    "{duration}",
                    formatDuration(currentSleepMinutes, language),
                  )
                : t("sleepNotLoggedYet")}
            </p>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
              {t("sleepEditGoal")}
            </button>
          </div>
        </div>
      </section>

      <SleepGoalModal
        open={isModalOpen}
        goal={goal}
        onClose={() => setIsModalOpen(false)}
        onSaved={(updatedGoal) => {
          setIsModalOpen(false);
          onUpdated?.(updatedGoal);
        }}
      />
    </>
  );
}

