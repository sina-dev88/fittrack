"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useLanguage } from "@/components/language/LanguageProvider";

type WeeklyData = {
  week: string;
  volume: number;
  workouts: number;
};

type StrengthData = {
  date: string;
  exercise: string;
  estimated1RM: number;
};

type Props = {
  weekly: WeeklyData[];
  strength: StrengthData[];
};

export default function ProgressCharts({ weekly, strength }: Props) {
  const { language, isRTL, t } = useLanguage();

  const locale =
    language === "fa" ? "fa-IR-u-ca-persian" : "en-US";

  const numberFormat = new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : "en-US",
    {
      maximumFractionDigits: 1,
    },
  );

  function formatNumber(value: unknown) {
    const numericValue = Number(value);

    return Number.isFinite(numericValue)
      ? numberFormat.format(numericValue)
      : String(value ?? "—");
  }

  function formatDate(value: string | number) {
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }).format(date);
  }

  const volumeData = weekly.map((item) => ({
    ...item,
    label: formatDate(item.week),
  }));

  return (
    <div
      className="space-y-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Weekly Volume */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
            {t("weeklyVolumeTitle")}
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("weeklyVolumeDescription")}
          </p>
        </div>

        <div className="h-72">
          {volumeData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
              {t("completeWorkoutsForVolume")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatNumber}
                />

                <Tooltip
                  cursor={false}
                  formatter={(value) => [
                    formatNumber(value),
                    t("chartVolume"),
                  ]}
                />

                <Bar
                  dataKey="volume"
                  name={t("chartVolume")}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Workout Frequency */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
            {t("workoutFrequencyTitle")}
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("workoutFrequencyDescription")}
          </p>
        </div>

        <div className="h-72">
          {weekly.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
              {t("completeWorkoutsForFrequency")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatNumber}
                />

                <Tooltip
                  cursor={false}
                  formatter={(value) => [
                    formatNumber(value),
                    t("chartWorkouts"),
                  ]}
                />

                <Bar
                  dataKey="workouts"
                  name={t("chartWorkouts")}
                  fill="#a1a1aa"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Strength */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
            {t("strengthProgressionTitle")}
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("strengthProgressionDescription")}
          </p>
        </div>

        <div className="h-80">
          {strength.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
              {t("completeSetsForStrength")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strength}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatDate}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatNumber}
                />

                <Tooltip
                  labelFormatter={(label) =>
                    formatDate(String(label))
                  }
                  formatter={(value) => [
                    formatNumber(value),
                    t("chartEstimatedOneRM"),
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="estimated1RM"
                  name={t("chartEstimatedOneRM")}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}