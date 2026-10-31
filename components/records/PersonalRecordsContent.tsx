"use client";

import { Trophy } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  translateExerciseLabel,
  translateExerciseName,
} from "@/lib/i18n/exercise-labels";

type PersonalRecord = {
  id: string;
  weight: number;
  reps: number;
  estimated1RM: number | null;
  achievedAt: Date;
  exercise: {
    name: string;
    primaryMuscle: string;
  };
};

export default function PersonalRecordsContent({
  records,
}: {
  records: PersonalRecord[];
}) {
  const { t, isRTL, language } = useLanguage();

  const locale = language === "fa" ? "fa-IR" : "en-US";

  const numberFormat = new Intl.NumberFormat(locale);

  const decimalFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const dateFormat = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto max-w-6xl space-y-8"
    >
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <Trophy size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("personalRecordsTitle")}
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t("personalRecordsDescription")}
            </p>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <Trophy
            size={32}
            className="mx-auto mb-3 text-zinc-400"
          />

          <h2 className="font-medium">
            {t("personalRecordsEmptyTitle")}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {t("personalRecordsEmptyDescription")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">
                    {translateExerciseName(
                      record.exercise.name,
                      language
                    )}
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    {translateExerciseLabel(
                      record.exercise.primaryMuscle,
                      "muscle",
                      t,
                      language
                    )}
                  </p>
                </div>

                <Trophy
                  size={18}
                  className="text-zinc-400"
                />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-zinc-500">
                    {t("personalRecordsWeight")}
                  </p>

                  <p className="mt-1 font-semibold">
                    {numberFormat.format(record.weight)} kg
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500">
                    {t("personalRecordsReps")}
                  </p>

                  <p className="mt-1 font-semibold">
                    {numberFormat.format(record.reps)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500">
                    {t("personalRecordsEstimated1RM")}
                  </p>

                  <p className="mt-1 font-semibold">
                    {record.estimated1RM != null
                      ? decimalFormat.format(record.estimated1RM)
                      : "-"}{" "}
                    kg
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-zinc-100 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
                {dateFormat.format(new Date(record.achievedAt))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}