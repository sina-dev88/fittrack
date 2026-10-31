"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Clock3,
  Loader2,
  Moon,
  Sparkles,
  X,
} from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

type SleepQuality = "POOR" | "FAIR" | "GOOD" | "EXCELLENT";

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

type LogSleepModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: (sleep: SleepLatest) => void;
};

const qualityOptions: {
  value: SleepQuality;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  score: number;
}[] = [
  {
    value: "POOR",
    labelKey: "sleepQualityPoor",
    descriptionKey: "sleepQualityPoorDescription",
    score: 1,
  },
  {
    value: "FAIR",
    labelKey: "sleepQualityFair",
    descriptionKey: "sleepQualityFairDescription",
    score: 2,
  },
  {
    value: "GOOD",
    labelKey: "sleepQualityGood",
    descriptionKey: "sleepQualityGoodDescription",
    score: 4,
  },
  {
    value: "EXCELLENT",
    labelKey: "sleepQualityExcellent",
    descriptionKey: "sleepQualityExcellentDescription",
    score: 5,
  },
];

function getLocalDateKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createLocalDate(time: string, addDay = false) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  if (addDay) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

export default function LogSleepModal({
  open,
  onClose,
  onSaved,
}: LogSleepModalProps) {
  const { t, isRTL, language } = useLanguage();

  const [bedtime, setBedtime] = useState("00:18");
  const [wakeUp, setWakeUp] = useState("08:00");

  const [quality, setQuality] = useState<SleepQuality>("GOOD");

  const [awakenings, setAwakenings] = useState(0);
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const locale =
    language === "fa" ? "fa-IR" : "en-US";

  const numberFormat = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    setError("");

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sleepDuration = useMemo(() => {
    const bedtimeDate = createLocalDate(bedtime);

    const bedtimeMinutes =
      bedtimeDate.getHours() * 60 +
      bedtimeDate.getMinutes();

    const wakeDate = createLocalDate(wakeUp);

    const wakeMinutes =
      wakeDate.getHours() * 60 +
      wakeDate.getMinutes();

    let difference = wakeMinutes - bedtimeMinutes;

    if (difference <= 0) {
      difference += 24 * 60;
    }

    return difference;
  }, [bedtime, wakeUp]);

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursText = numberFormat.format(hours);
    const minutesText = numberFormat.format(remainingMinutes);

    if (language === "fa") {
      return `${hoursText} ${t("sleepModalHours")} و ${minutesText} ${t("sleepModalMinutes")}`;
    }

    return `${hoursText}h ${minutesText}m`;
  }

  if (!open) return null;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const bedtimeDate = createLocalDate(bedtime);

      const bedtimeMinutes =
        bedtimeDate.getHours() * 60 +
        bedtimeDate.getMinutes();

      const [wakeHours, wakeMinutes] =
        wakeUp.split(":").map(Number);

      const wakeTotal = wakeHours * 60 + wakeMinutes;

      const crossesMidnight =
        wakeTotal <= bedtimeMinutes;

      const wakeDate = createLocalDate(
        wakeUp,
        crossesMidnight,
      );

      const selectedQuality = qualityOptions.find(
        (item) => item.value === quality,
      );

      const response = await fetch("/api/sleep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateKey: getLocalDateKey(),
          bedtime: bedtimeDate.toISOString(),
          wakeTime: wakeDate.toISOString(),
          quality: selectedQuality?.score ?? 4,
          awakenings,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error(t("sleepModalSaveError"));
      }

      const result = await response.json();

      if (result.sleep) {
        onSaved?.(result.sleep);
      }

      onClose();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        t("sleepModalSaveError"),
      );
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-sleep-title"
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:max-h-[calc(100dvh-48px)]"
      >
        {/* Header */}
        <div className="shrink-0 border-b bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Moon className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h2
                  id="log-sleep-title"
                  className="text-lg font-semibold text-zinc-950 dark:text-white"
                >
                  {t("sleepModalTitle")}
                </h2>

                <p className="text-xs text-muted-foreground">
                  {t("sleepModalDescription")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
              aria-label={t("sleepModalClose")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <form
            id="log-sleep-form"
            onSubmit={handleSubmit}
            className="space-y-6 p-5 sm:p-6"
          >
            {/* Estimated Sleep */}
            <div className="rounded-2xl border bg-background p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("sleepModalEstimated")}
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    {formatDuration(sleepDuration)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Clock3 className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div
                className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
                dir="ltr"
              >
                <span className="rounded-lg bg-muted px-2.5 py-1">
                  {bedtime}
                </span>

                <span>→</span>

                <span className="rounded-lg bg-muted px-2.5 py-1">
                  {wakeUp}
                </span>
              </div>
            </div>

            {/* Sleep schedule */}
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold">
                  {t("sleepModalSchedule")}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  {t("sleepModalScheduleDescription")}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="bedtime"
                    className="mb-2 block text-sm font-medium"
                  >
                    {t("sleepModalBedtime")}
                  </label>

                  <input
                    id="bedtime"
                    type="time"
                    dir="ltr"
                    value={bedtime}
                    onChange={(event) =>
                      setBedtime(event.target.value)
                    }
                    disabled={saving}
                    className="h-12 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="wake-up"
                    className="mb-2 block text-sm font-medium"
                  >
                    {t("sleepModalWakeUp")}
                  </label>

                  <input
                    id="wake-up"
                    type="time"
                    dir="ltr"
                    value={wakeUp}
                    onChange={(event) =>
                      setWakeUp(event.target.value)
                    }
                    disabled={saving}
                    className="h-12 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                </div>
              </div>
            </section>

            {/* Sleep quality */}
            <section>
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />

                  <h3 className="text-sm font-semibold">
                    {t("sleepModalQuality")}
                  </h3>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {t("sleepModalQualityDescription")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {qualityOptions.map((option) => {
                  const selected = quality === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setQuality(option.value)}
                      disabled={saving}
                      className={`relative rounded-xl border p-3 text-start transition-all ${
                        selected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "bg-background hover:bg-muted"
                      }`}
                    >
                      {selected && (
                        <span
                          className={`absolute top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground ${
                            isRTL ? "left-2" : "right-2"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                      )}

                      <p
                        className={`text-sm font-medium ${
                          selected ? "text-primary" : ""
                        }`}
                      >
                        {t(option.labelKey)}
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {t(option.descriptionKey)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Night awakenings */}
            <section>
              <label
                htmlFor="awakenings"
                className="mb-2 block text-sm font-medium"
              >
                {t("sleepModalAwakenings")}
              </label>

              <div className="flex items-center gap-3">
                <input
                  id="awakenings"
                  type="number"
                  min={0}
                  max={50}
                  value={awakenings}
                  onChange={(event) =>
                    setAwakenings(
                      Math.min(
                        50,
                        Math.max(0, Number(event.target.value)),
                      ),
                    )
                  }
                  disabled={saving}
                  className="h-12 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />

                <span className="shrink-0 text-sm text-muted-foreground">
                  {t("sleepModalTimes")}
                </span>
              </div>
            </section>

            {/* Notes */}
            <section>
              <label
                htmlFor="sleep-notes"
                className="mb-2 block text-sm font-medium"
              >
                {t("sleepModalNotes")}
              </label>

              <textarea
                id="sleep-notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                disabled={saving}
                placeholder={t("sleepModalNotesPlaceholder")}
                rows={3}
                maxLength={2000}
                className="w-full resize-none rounded-xl border bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </section>

            {/* Error */}
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

        {/* Footer */}
        <div className="shrink-0 border-t bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 rounded-xl border px-5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              {t("sleepModalCancel")}
            </button>

            <button
              type="submit"
              form="log-sleep-form"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {saving
                ? t("sleepModalSaving")
                : t("sleepModalSave")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
