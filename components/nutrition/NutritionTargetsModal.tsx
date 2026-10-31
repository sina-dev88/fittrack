"use client";

import { useEffect, useState } from "react";
import { Save, Target, X } from "lucide-react";

type NutritionTargets = {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  water: number | null;
};

type Props = {
  targets: NutritionTargets;
  onSuccess: (targets: NutritionTargets) => void;
  onClose: () => void;
};

export default function NutritionTargetsModal({
  targets,
  onSuccess,
  onClose,
}: Props) {
  const [calories, setCalories] = useState(
    targets.calories?.toString() ?? "",
  );

  const [protein, setProtein] = useState(
    targets.protein?.toString() ?? "",
  );

  const [carbs, setCarbs] = useState(
    targets.carbs?.toString() ?? "",
  );

  const [fat, setFat] = useState(
    targets.fat?.toString() ?? "",
  );

  const [water, setWater] = useState(
    targets.water?.toString() ?? "",
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCalories(
      targets.calories?.toString() ?? "",
    );
    setProtein(
      targets.protein?.toString() ?? "",
    );
    setCarbs(
      targets.carbs?.toString() ?? "",
    );
    setFat(targets.fat?.toString() ?? "");
    setWater(
      targets.water?.toString() ?? "",
    );
  }, [targets]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/nutrition/targets",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calories,
            protein,
            carbs,
            fat,
            water,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to update targets.",
        );
      }

      onSuccess(result);
      onClose();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update targets.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="my-auto max-h-[calc(100vh-24px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 sm:p-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Target size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                Daily Targets
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Set your daily nutrition goals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 sm:space-y-5 sm:p-5"
        >
          {/* Calories */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Calories
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                max="10000"
                step="1"
                value={calories}
                onChange={(event) =>
                  setCalories(event.target.value)
                }
                placeholder="2800"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-16 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                kcal
              </span>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Protein */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Protein
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={protein}
                  onChange={(event) =>
                    setProtein(event.target.value)
                  }
                  placeholder="150"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-9 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                  g
                </span>
              </div>
            </div>

            {/* Carbs */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Carbs
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="1500"
                  step="1"
                  value={carbs}
                  onChange={(event) =>
                    setCarbs(event.target.value)
                  }
                  placeholder="320"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-9 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                  g
                </span>
              </div>
            </div>

            {/* Fat */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Fat
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={fat}
                  onChange={(event) =>
                    setFat(event.target.value)
                  }
                  placeholder="80"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-9 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                  g
                </span>
              </div>
            </div>
          </div>

          {/* Water */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Water
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                max="10000"
                step="50"
                value={water}
                onChange={(event) =>
                  setWater(event.target.value)
                }
                placeholder="2500"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-16 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                ml
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:justify-end dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <Save size={16} />

              {saving
                ? "Saving..."
                : "Save Targets"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}