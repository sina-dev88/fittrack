"use client";

import {
  Activity,
  Apple,
  BedDouble,
  CheckCircle2,
} from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

type RecoveryFactorsProps = {
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
};

type Factor = {
  key: keyof RecoveryFactorsProps["recovery"]["factors"];
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: typeof BedDouble;
};

const factorConfig: Factor[] = [
  {
    key: "sleep",
    labelKey: "recoverySleep",
    descriptionKey: "recoverySleepDescription",
    icon: BedDouble,
  },
  {
    key: "training",
    labelKey: "recoveryTraining",
    descriptionKey: "recoveryTrainingDescription",
    icon: Activity,
  },
  {
    key: "nutrition",
    labelKey: "recoveryNutrition",
    descriptionKey: "recoveryNutritionDescription",
    icon: Apple,
  },
  {
    key: "consistency",
    labelKey: "recoveryConsistency",
    descriptionKey: "recoveryConsistencyDescription",
    icon: CheckCircle2,
  },
];

function getScoreLabel(
  value: number,
  t: (key: TranslationKey) => string,
) {
  if (value >= 85) return t("recoveryExcellent");
  if (value >= 70) return t("recoveryGood");
  if (value >= 50) return t("recoveryModerate");

  return t("recoveryNeedsAttention");
}

export default function RecoveryFactors({
  recovery,
}: RecoveryFactorsProps) {
  const { t, isRTL, language } = useLanguage();

  const numberFormat = new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : "en-US",
  );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
    >
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          {t("recoveryFactorsTitle")}
        </h2>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("recoveryFactorsDescription")}
        </p>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        {factorConfig.map((factor) => {
          const Icon = factor.icon;
          const value = recovery.factors[factor.key];

          return (
            <div
              key={factor.key}
              className="flex min-w-0 min-h-[150px] flex-col rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <Icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {t(factor.labelKey)}
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    {t(factor.descriptionKey)}
                  </p>
                </div>

                <div className="w-14 shrink-0 text-end">
                  <p className="text-xl font-bold leading-none">
                    {numberFormat.format(value)}
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-zinc-500 dark:text-zinc-400">
                    {getScoreLabel(value, t)}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
                    style={{
                      width: `${Math.min(Math.max(value, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
