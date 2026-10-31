
"use client";

import { BarChart3, ChevronDown, Moon } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";

type Range = "7 Days" | "14 Days" | "30 Days";

type SleepHistoryItem = {
  date: string;
  durationMinutes: number;
  quality: number | null;
  energy: number | null;
  stress: number | null;
  awakenings: number | null;
  hasData: boolean;
};

type Props = {
  history: SleepHistoryItem[];
  targetMinutes: number;
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

function formatDay(date: string, range: Range, language: "en" | "fa") {
  const parsed = new Date(`${date}T12:00:00`);

  if (range === "30 Days") {
    return new Intl.DateTimeFormat(
      language === "fa" ? "fa-IR-u-ca-persian" : "en-US",
      { day: "numeric" },
    ).format(parsed);
  }

  return new Intl.DateTimeFormat(
    language === "fa" ? "fa-IR-u-ca-persian" : "en-US",
    {
      weekday: range === "14 Days" ? "narrow" : "short",
    },
  ).format(parsed);
}

export default function SleepHistory({ history, targetMinutes }: Props) {
  const { t, language, isRTL } = useLanguage();
  const [range, setRange] = useState<Range>("7 Days");
  const [open, setOpen] = useState(false);

  const ranges: Range[] = ["7 Days", "14 Days", "30 Days"];

  const rangeLabels: Record<Range, string> = {
    "7 Days": t("sleepLast7Days"),
    "14 Days": t("sleepLast14Days"),
    "30 Days": t("sleepLast30Days"),
  };

  const visibleData = useMemo(() => {
    const count =
      range === "7 Days" ? 7 : range === "14 Days" ? 14 : 30;

    return history.slice(-count);
  }, [history, range]);

  const recordedData = visibleData.filter(
    (item) => item.hasData && item.durationMinutes > 0,
  );

  const average =
    recordedData.length > 0
      ? recordedData.reduce((sum, item) => sum + item.durationMinutes, 0) /
        recordedData.length
      : 0;

  const bestNight =
    recordedData.length > 0
      ? Math.max(...recordedData.map((item) => item.durationMinutes))
      : 0;

  const maxHours = 10;
  const targetHours = targetMinutes / 60;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full rounded-2xl border bg-card p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">{t("sleepHistoryTitle")}</h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("sleepHistoryDescription")}
          </p>
        </div>

        {/* Range selector */}
        <div className="relative">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="relative z-[101] inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-muted"
          >
            {rangeLabels[range]}

            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <>
              <button
                type="button"
                aria-label={t("close")}
                className="fixed inset-0 z-[99] cursor-default"
                onClick={() => setOpen(false)}
              />

              <div className="absolute end-0 top-[calc(100%+8px)] z-[100] w-36 overflow-hidden rounded-xl border bg-card shadow-2xl">
                {ranges.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setRange(item);
                      setOpen(false);
                    }}
                    className={`block w-full px-3 py-2.5 text-sm transition hover:bg-muted ${
                      isRTL ? "text-right" : "text-left"
                    } ${range === item ? "font-semibold text-primary" : ""}`}
                  >
                    {rangeLabels[item]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-8 w-full">
        <div className="relative h-72 w-full">
          {/* Y axis */}
          <div
            dir="ltr"
            className="pointer-events-none absolute bottom-10 left-0 top-0 flex w-9 flex-col justify-between text-right text-xs text-muted-foreground"
          >
            {[10, 8, 6, 4, 2, 0].map((hours) => (
              <span key={hours}>
                {hours}h
              </span>
            ))}
          </div>

          {/* Plot */}
          <div className="absolute bottom-10 left-11 right-0 top-0">
            <div className="absolute inset-0 border-b border-l" />

            {/* Grid */}
            <div className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4, 5].map((line) => (
                <div
                  key={line}
                  className="w-full border-t border-dashed border-muted"
                />
              ))}
            </div>

            {/* Target line */}
            {targetHours <= maxHours && (
              <div
                className="pointer-events-none absolute left-0 right-0 z-[5] border-t border-dashed border-primary/60"
                style={{
                  bottom: `${(targetHours / maxHours) * 100}%`,
                }}
              />
            )}

            {/* Bars */}
            <div className="absolute inset-0 z-10 flex items-stretch gap-1 px-2 sm:gap-2">
              {visibleData.map((item, index) => {
                const hours = item.durationMinutes / 60;
                const height = Math.min((hours / maxHours) * 100, 100);

                return (
                  <div
                    key={`${item.date}-${index}`}
                    className="flex min-w-0 flex-1 flex-col"
                  >
                    <div className="relative flex min-h-0 flex-1 items-end justify-center">
                      {item.hasData ? (
                        <div
                          className="group relative w-full max-w-12 rounded-t-md bg-primary transition-all duration-200 hover:opacity-90"
                          style={{ height: `${height}%` }}
                        >
                          <div
                            dir={isRTL ? "rtl" : "ltr"}
                            className="absolute bottom-full left-1/2 z-[110] mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-lg group-hover:block"
                          >
                            {formatDuration(item.durationMinutes, language)}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>

                    <div className="flex h-6 shrink-0 items-end justify-center">
                      <span className="text-xs text-muted-foreground">
                        {formatDay(item.date, range, language)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {t("sleepChartTargetNote")}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="min-w-0 rounded-xl border bg-background p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Moon className="h-4 w-4" />
            <span className="text-sm">{t("sleepAverage")}</span>
          </div>

          <p className="mt-2 text-2xl font-bold">
            {average > 0 ? formatDuration(Math.round(average), language) : "—"}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border bg-background p-4">
          <p className="text-sm text-muted-foreground">
            {t("sleepBestNight")}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {bestNight > 0 ? formatDuration(bestNight, language) : "—"}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border bg-background p-4">
          <p className="text-sm text-muted-foreground">
            {t("sleepGoal")}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatDuration(targetMinutes, language)}
          </p>
        </div>
      </div>
    </section>
  );
}
