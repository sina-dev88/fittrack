"use client";

import {
  Activity,
  BedDouble,
  Clock3,
  Sparkles,
} from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

type RecoveryOverviewProps = {
  recovery: {
    score: number;
    label: string;
  };

  latest: {
    durationMinutes: number;
    quality: number | null;
    bedtime: string | null;
    wakeTime: string | null;
  } | null;
};

function getQualityLabel(
  quality: number | null,
): TranslationKey {
  if (quality === null) return "notLogged";
  if (quality >= 5) return "sleepQualityExcellent";
  if (quality >= 4) return "sleepQualityGood";
  if (quality >= 3) return "sleepQualityFair";

  return "sleepQualityPoor";
}

function getRecoveryLabel(label: string): TranslationKey | null {
  const normalized = label.trim().toLowerCase();

  const labels: Record<string, TranslationKey> = {
    excellent: "recoveryExcellent",
    good: "recoveryGood",
    moderate: "recoveryModerate",
    "needs attention": "recoveryNeedsAttention",
  };

  return labels[normalized] ?? null;
}

export default function RecoveryOverview({
  recovery,
  latest,
}: RecoveryOverviewProps) {
  const { language, isRTL, t } = useLanguage();

  const locale = language === "fa" ? "fa-IR" : "en-US";

  const numberFormat = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  });

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (language === "fa") {
      return `${numberFormat.format(hours)} ${t("sleepModalHours")} و ${numberFormat.format(remainingMinutes)} ${t("sleepModalMinutes")}`;
    }

    return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
  }

  function formatTime(value: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const translatedRecoveryLabel = getRecoveryLabel(
    recovery.label,
  );

  const recoveryData = [
    {
      title: t("recoveryScore"),
      value: numberFormat.format(recovery.score),
      suffix: "/100",
      description: translatedRecoveryLabel
        ? t(translatedRecoveryLabel)
        : recovery.label,
      icon: Activity,
    },
    {
      title: t("recoverySleep"),
      value: latest
        ? formatDuration(latest.durationMinutes)
        : "—",
      description: t("lastNight"),
      icon: BedDouble,
    },
    {
      title: t("sleepModalQuality"),
      value: t(getQualityLabel(latest?.quality ?? null)),
      description: t("lastNight"),
      icon: Sparkles,
    },
    {
      title: t("sleepModalBedtime"),
      value: formatTime(latest?.bedtime ?? null),
      description: `${t("wakeUpLabel")} ${formatTime(
        latest?.wakeTime ?? null,
      )}`,
      icon: Clock3,
    },
  ];

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          {t("todaysRecovery")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("recoveryOverviewDescription")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {recoveryData.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-muted-foreground">
                    {item.title}
                  </p>

                  <div
                    className="mt-2 flex min-w-0 items-baseline gap-1"
                    dir="auto"
                  >
                    <span className="break-words text-xl font-bold sm:text-2xl">
                      {item.value}
                    </span>

                    {item.suffix && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {item.suffix}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-2 break-words text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}


