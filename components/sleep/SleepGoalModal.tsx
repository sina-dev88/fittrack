"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Loader2, Moon, Target, X } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";

type SleepGoal = {
  id: string;
  targetMinutes: number;
  targetBedtime: string | null;
  targetWakeTime: string | null;
};

type SleepGoalModalProps = {
  open: boolean;
  goal: SleepGoal | null;
  onClose: () => void;
  onSaved?: (goal: SleepGoal) => void;
};

const durationOptions = [
  { minutes: 360, label: "6h" },
  { minutes: 420, label: "7h" },
  { minutes: 450, label: "7h 30m" },
  { minutes: 480, label: "8h" },
  { minutes: 510, label: "8h 30m" },
  { minutes: 540, label: "9h" },
  { minutes: 600, label: "10h" },
];

function formatDuration(minutes: number, language: "en" | "fa") {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (language === "fa") {
    return remainingMinutes === 0
      ? `${hours} ساعت`
      : `${hours} ساعت و ${remainingMinutes} دقیقه`;
  }

  return remainingMinutes === 0
    ? `${hours}h`
    : `${hours}h ${remainingMinutes}m`;
}

export default function SleepGoalModal({
  open,
  goal,
  onClose,
  onSaved,
}: SleepGoalModalProps) {
  const { t, language, isRTL } = useLanguage();

  const [targetMinutes, setTargetMinutes] = useState(480);
  const [targetBedtime, setTargetBedtime] = useState("00:00");
  const [targetWakeTime, setTargetWakeTime] = useState("08:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setTargetMinutes(goal?.targetMinutes ?? 480);
    setTargetBedtime(goal?.targetBedtime ?? "00:00");
    setTargetWakeTime(goal?.targetWakeTime ?? "08:00");
    setError("");

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open, goal]);

  const calculatedSchedule = useMemo(() => {
    const [bedHour, bedMinute] = targetBedtime.split(":").map(Number);
    const [wakeHour, wakeMinute] = targetWakeTime.split(":").map(Number);

    if (
      !Number.isFinite(bedHour) ||
      !Number.isFinite(bedMinute) ||
      !Number.isFinite(wakeHour) ||
      !Number.isFinite(wakeMinute)
    ) {
      return null;
    }

    const bedtimeTotal = bedHour * 60 + bedMinute;
    const wakeTotal = wakeHour * 60 + wakeMinute;

    let difference = wakeTotal - bedtimeTotal;

    if (difference <= 0) {
      difference += 24 * 60;
    }

    return difference;
  }, [targetBedtime, targetWakeTime]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/sleep/goal", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetMinutes,
          targetBedtime: targetBedtime || null,
          targetWakeTime: targetWakeTime || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update sleep goal.");
      }

      const updatedGoal = result.goal ?? result;

      if (updatedGoal && typeof updatedGoal.id === "string") {
        onSaved?.({
          id: updatedGoal.id,
          targetMinutes: updatedGoal.targetMinutes,
          targetBedtime: updatedGoal.targetBedtime,
          targetWakeTime: updatedGoal.targetWakeTime,
        });
      }

      onClose();

      onClose();
    } catch (error) {
      console.error(error);
      setError(t("sleepGoalSaveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className="
          flex max-h-[calc(100dvh-24px)] w-full max-w-lg flex-col
          overflow-hidden rounded-3xl border border-zinc-200 bg-white
          shadow-2xl dark:border-zinc-800 dark:bg-zinc-900
          sm:max-h-[calc(100dvh-48px)]
        "
      >
        <div className="shrink-0 border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">{t("sleepGoal")}</h2>
                <p className="text-xs text-muted-foreground">
                  {t("sleepGoalModalDescription")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
              aria-label={t("close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <form
            id="sleep-goal-form"
            onSubmit={handleSubmit}
            className="space-y-6 p-5 sm:p-6"
          >
            <div className="rounded-2xl border bg-zinc-50 p-5 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("sleepDailyTarget")}
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {formatDuration(targetMinutes, language)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Moon className="h-5 w-5 text-primary" />
                </div>
              </div>

              {calculatedSchedule !== null && (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  <span dir="ltr">{targetBedtime}</span>
                  <span>→</span>
                  <span dir="ltr">{targetWakeTime}</span>
                  <span className="ms-1">
                    ({formatDuration(calculatedSchedule, language)})
                  </span>
                </div>
              )}
            </div>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold">{t("sleepDuration")}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("sleepDurationQuestion")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {durationOptions.map((option) => {
                  const selected = targetMinutes === option.minutes;

                  return (
                    <button
                      key={option.minutes}
                      type="button"
                      disabled={saving}
                      onClick={() => setTargetMinutes(option.minutes)}
                      className={`relative rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {selected && (
                        <span className="absolute end-2 top-2">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}

                      {language === "fa"
                        ? formatDuration(option.minutes, language)
                        : option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold">{t("sleepSchedule")}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("sleepScheduleDescription")}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="target-bedtime"
                    className="mb-2 block text-sm font-medium"
                  >
                    {t("sleepBedtime")}
                  </label>
                  <input
                    id="target-bedtime"
                    type="time"
                    value={targetBedtime}
                    onChange={(event) => setTargetBedtime(event.target.value)}
                    disabled={saving}
                    className="h-12 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-zinc-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="target-wake"
                    className="mb-2 block text-sm font-medium"
                  >
                    {t("wakeUpLabel")}
                  </label>
                  <input
                    id="target-wake"
                    type="time"
                    value={targetWakeTime}
                    onChange={(event) => setTargetWakeTime(event.target.value)}
                    disabled={saving}
                    className="h-12 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-zinc-900"
                  />
                </div>
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
              >
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="shrink-0 border-t border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 rounded-xl border px-5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              form="sleep-goal-form"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? t("saving") : t("sleepSaveGoal")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
