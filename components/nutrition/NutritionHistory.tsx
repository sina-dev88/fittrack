"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Droplets,
  Flame,
  Loader2,
  TrendingUp,
  Wheat,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type NutritionHistoryItem = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  targets: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    water: number | null;
  };
};

type NutritionHistoryResponse = {
  days: number;
  history: NutritionHistoryItem[];
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    waterMl: number;
  };
  recordedDays: number;
};

type Range = 7 | 30 | 90;

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getCompletion(value: number, target: number | null) {
  if (!target || target <= 0) return null;

  return Math.round((value / target) * 100);
}

function formatWater(ml: number) {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)} L`;
  }

  return `${Math.round(ml)} ml`;
}

export default function NutritionHistory() {
  const [range, setRange] = useState<Range>(7);
  const [data, setData] = useState<NutritionHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/nutrition/history?days=${range}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to load nutrition history.",
        );
      }

      setData(result);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load nutrition history.",
      );
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const chartData = useMemo(() => {
    if (!data) return [];

    return data.history.map((day) => ({
      ...day,
      label: formatDate(day.date),
      water: Math.round(day.waterMl / 1000),
    }));
  }, [data]);

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex min-h-[240px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Loader2 size={18} className="animate-spin" />
            Loading nutrition history...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-8 rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900/50 dark:bg-zinc-900">
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>

        <button
          type="button"
          onClick={loadHistory}
          className="mt-4 rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Try Again
        </button>
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="mt-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp
              size={20}
              className="text-zinc-700 dark:text-zinc-300"
            />

            <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
              Nutrition History
            </h2>
          </div>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Track your nutrition trends over time.
          </p>
        </div>

        {/* Range Selector */}
        <div className="inline-flex w-fit rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {([7, 30, 90] as Range[]).map((value) => {
            const active = range === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4 ${
                  active
                    ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {value}D
              </button>
            );
          })}
        </div>
      </div>

      {/* Average Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AverageCard
          icon={<Flame size={18} />}
          title="Avg Calories"
          value={`${data.averages.calories}`}
          unit="kcal"
        />

        <AverageCard
          icon={<Wheat size={18} />}
          title="Avg Protein"
          value={`${data.averages.protein}`}
          unit="g"
        />

        <AverageCard
          icon={<Droplets size={18} />}
          title="Avg Water"
          value={formatWater(data.averages.waterMl)}
          unit=""
        />

        <AverageCard
          icon={<CalendarDays size={18} />}
          title="Logged Days"
          value={`${data.recordedDays}`}
          unit={`/ ${data.days}`}
        />
      </div>

      {/* Calories Chart */}
      <ChartCard
        title="Calories"
        description="Daily calorie intake"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              className="text-zinc-500"
              minTickGap={20}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              className="text-zinc-500"
            />

            <Tooltip
              content={<CaloriesTooltip />}
            />

            <Line
              type="monotone"
              dataKey="calories"
              stroke="currentColor"
              className="text-orange-500"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Macro Chart */}
      <ChartCard
        title="Macros"
        description="Protein, carbs and fat intake"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              className="text-zinc-500"
              minTickGap={20}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              className="text-zinc-500"
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="protein"
              name="Protein"
              stroke="currentColor"
              className="text-blue-500"
              strokeWidth={2.5}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="carbs"
              name="Carbs"
              stroke="currentColor"
              className="text-amber-500"
              strokeWidth={2.5}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="fat"
              name="Fat"
              stroke="currentColor"
              className="text-rose-500"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Water Chart */}
      <ChartCard
        title="Water Intake"
        description="Daily water consumption"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              className="text-zinc-500"
              minTickGap={20}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              className="text-zinc-500"
              tickFormatter={(value) => `${value}L`}
            />

            <Tooltip
              formatter={(value) => [
                `${value} L`,
                "Water",
              ]}
            />

            <Line
              type="monotone"
              dataKey="water"
              stroke="currentColor"
              className="text-cyan-500"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Daily Breakdown */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-950 dark:text-white">
            Daily Breakdown
          </h3>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Detailed nutrition records for the selected period.
          </p>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {data.history
            .slice()
            .reverse()
            .map((day) => {
              const calorieCompletion = getCompletion(
                day.calories,
                day.targets.calories,
              );

              const proteinCompletion = getCompletion(
                day.protein,
                day.targets.protein,
              );

              return (
                <div
                  key={day.date}
                  className="px-5 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Date */}
                    <div className="flex items-center gap-3 lg:min-w-[180px]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        <CalendarDays size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                          {formatFullDate(day.date)}
                        </p>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {day.calories > 0 || day.waterMl > 0
                            ? "Nutrition logged"
                            : "No data"}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:flex-1 lg:justify-end">
                      <DailyStat
                        label="Calories"
                        value={`${day.calories}`}
                        unit="kcal"
                        completion={calorieCompletion}
                      />

                      <DailyStat
                        label="Protein"
                        value={`${day.protein}`}
                        unit="g"
                        completion={proteinCompletion}
                      />

                      <DailyStat
                        label="Carbs"
                        value={`${day.carbs}`}
                        unit="g"
                      />

                      <DailyStat
                        label="Water"
                        value={formatWater(day.waterMl)}
                        unit=""
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}

function AverageCard({
  icon,
  title,
  value,
  unit,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
        {icon}

        <span className="text-xs font-medium sm:text-sm">
          {title}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-xl font-bold text-zinc-950 dark:text-white sm:text-2xl">
          {value}
        </span>

        {unit && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5">
        <h3 className="font-semibold text-zinc-950 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <div className="h-[280px] w-full">
        {children}
      </div>
    </div>
  );
}

function DailyStat({
  label,
  value,
  unit,
  completion,
}: {
  label: string;
  value: string;
  unit: string;
  completion?: number | null;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-zinc-950 dark:text-white">
        {value}
        {unit && (
          <span className="ml-1 text-xs font-normal text-zinc-400">
            {unit}
          </span>
        )}
      </p>

      {completion !== null &&
        completion !== undefined && (
          <p
            className={`mt-1 text-[11px] font-medium ${
              completion >= 100
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {completion}% target
          </p>
        )}
    </div>
  );
}

function CaloriesTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
        {payload[0]?.value ?? 0} kcal
      </p>
    </div>
  );
}
