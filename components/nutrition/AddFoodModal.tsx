"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";

type MealType =
  | "BREAKFAST"
  | "LUNCH"
  | "DINNER"
  | "SNACK";

export type FoodData = {
  id?: string;
  name: string;
  servingSize: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  mealType?: MealType;
};

type Props = {
  defaultMealType?: MealType;
  food?: FoodData | null;
  onSuccess: () => void;
  onClose: () => void;
};

export default function AddFoodModal({
  defaultMealType = "BREAKFAST",
  food,
  onSuccess,
  onClose,
}: Props) {
  const isEditing = Boolean(food?.id);

  const [mealType, setMealType] =
    useState<MealType>(
      food?.mealType ?? defaultMealType,
    );

  const [name, setName] = useState(
    food?.name ?? "",
  );

  const [servingSize, setServingSize] = useState(
    food?.servingSize ?? "",
  );

  const [calories, setCalories] = useState(
    food?.calories?.toString() ?? "",
  );

  const [protein, setProtein] = useState(
    food?.protein?.toString() ?? "",
  );

  const [carbs, setCarbs] = useState(
    food?.carbs?.toString() ?? "",
  );

  const [fat, setFat] = useState(
    food?.fat?.toString() ?? "",
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMealType(
      food?.mealType ?? defaultMealType,
    );
    setName(food?.name ?? "");
    setServingSize(food?.servingSize ?? "");
    setCalories(food?.calories?.toString() ?? "");
    setProtein(food?.protein?.toString() ?? "");
    setCarbs(food?.carbs?.toString() ?? "");
    setFat(food?.fat?.toString() ?? "");
  }, [food, defaultMealType]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const url = isEditing
        ? `/api/nutrition/foods/${food?.id}`
        : "/api/nutrition/foods";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          mealType,
          servingSize,
          calories,
          protein,
          carbs,
          fat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${
              isEditing ? "update" : "add"
            } food.`,
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
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
      <div className="my-auto max-h-[calc(100vh-24px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-xl sm:max-h-[calc(100vh-32px)] dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 sm:p-5 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
              {isEditing ? "Edit Food" : "Add Food"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {isEditing
                ? "Update nutrition information."
                : "Add nutrition information for this food."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 sm:space-y-5 sm:p-5"
        >
          <div>
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Meal
            </label>

            <select
              value={mealType}
              onChange={(event) =>
                setMealType(
                  event.target.value as MealType,
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            >
              <option value="BREAKFAST">
                Breakfast
              </option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
              <option value="SNACK">Snack</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Food name
            </label>

            <input
              required
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. Chicken breast"
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Serving size
            </label>

            <input
              value={servingSize}
              onChange={(event) =>
                setServingSize(event.target.value)
              }
              placeholder="e.g. 150 g"
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Calories
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                value={calories}
                onChange={(event) =>
                  setCalories(event.target.value)
                }
                placeholder="kcal"
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Protein
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                value={protein}
                onChange={(event) =>
                  setProtein(event.target.value)
                }
                placeholder="grams"
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Carbs
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                value={carbs}
                onChange={(event) =>
                  setCarbs(event.target.value)
                }
                placeholder="grams"
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Fat
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                value={fat}
                onChange={(event) =>
                  setFat(event.target.value)
                }
                placeholder="grams"
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl border border-zinc-200 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : isEditing ? (
                <Save size={17} />
              ) : (
                <Plus size={17} />
              )}

              {saving
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save Changes"
                  : "Add Food"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
