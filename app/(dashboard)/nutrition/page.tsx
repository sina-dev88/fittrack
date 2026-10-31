"use client";

import NutritionTargetsModal from "@/components/nutrition/NutritionTargetsModal";
import NutritionHistory from "@/components/nutrition/NutritionHistory";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  Apple,
  Beef,
  Droplets,
  Flame,
  Pencil,
  Plus,
  Target,
  Trash2,
  Utensils,
  Wheat,
} from "lucide-react";

import AddFoodModal, {
  FoodData,
} from "@/components/nutrition/AddFoodModal";

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

type Food = {
  id: string;
  name: string;
  servingSize: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

type Meal = {
  id: string;
  type: MealType;
  name: string;
  foods: Food[];
};

type NutritionData = {
  date: string;
  targets: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    water: number | null;
  };
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  water: {
    totalMl: number;
  };
  meals: Meal[];
};

const mealConfig: Record<
  MealType,
  {
    label: string;
    icon: typeof Apple;
  }
> = {
  BREAKFAST: {
    label: "Breakfast",
    icon: Apple,
  },
  LUNCH: {
    label: "Lunch",
    icon: Utensils,
  },
  DINNER: {
    label: "Dinner",
    icon: Beef,
  },
  SNACK: {
    label: "Snacks",
    icon: Wheat,
  },
};

const mealOrder: MealType[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];

const mealTranslationKeys = {
  BREAKFAST: "nutritionBreakfast",
  LUNCH: "nutritionLunch",
  DINNER: "nutritionDinner",
  SNACK: "nutritionSnacks",
} as const;

export default function NutritionPage() {
  const { t, isRTL, language } = useLanguage();
  const [data, setData] = useState<NutritionData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddFood, setShowAddFood] = useState(false);

  const [selectedMealType, setSelectedMealType] =
    useState<MealType>("BREAKFAST");

  const [editingFood, setEditingFood] =
    useState<FoodData | null>(null);

  const [deletingFoodId, setDeletingFoodId] =
    useState<string | null>(null);

  const [addingWater, setAddingWater] = useState(false);

  const [showTargets, setShowTargets] = useState(false);

  const handleTargetsSaved = (
    targets: NutritionData["targets"],
  ) => {
    setData((currentData) => {
      if (!currentData) {
        return currentData;
      }

      return {
        ...currentData,
        targets,
      };
    });
  };

  const loadNutrition = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const response = await fetch("/api/nutrition", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              t("nutritionLoadError"),
          );
        }

        setData(result);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : t("nutritionLoadError"),
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [t],
  );

  useEffect(() => {
    loadNutrition();
  }, [loadNutrition]);

  const openAddFood = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setEditingFood(null);
    setShowAddFood(true);
  };

  const openEditFood = (
    food: Food,
    mealType: MealType,
  ) => {
    setSelectedMealType(mealType);

    setEditingFood({
      id: food.id,
      name: food.name,
      servingSize: food.servingSize,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      mealType,
    });

    setShowAddFood(true);
  };

  const closeFoodModal = () => {
    setShowAddFood(false);
    setEditingFood(null);
  };

  const handleFoodSaved = async () => {
    await loadNutrition(false);
  };

  const handleAddWater = async (
    amountMl: number,
  ) => {
    try {
      setAddingWater(true);
      setError("");

      const response = await fetch(
        "/api/nutrition/water",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amountMl,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            t("nutritionAddWaterError"),
        );
      }

      setData((currentData) => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,
          water: {
            totalMl:
              currentData.water.totalMl +
              result.amountMl,
          },
        };
      });
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : t("nutritionAddWaterError"),
      );
    } finally {
      setAddingWater(false);
    }
  };

  const handleDeleteFood = async (
    foodId: string,
  ) => {
    const confirmed = window.confirm(
      t("nutritionConfirmDeleteFood"),
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingFoodId(foodId);
      setError("");

      const response = await fetch(
        `/api/nutrition/foods/${foodId}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            t("nutritionDeleteFoodError"),
        );
      }

      setData((currentData) => {
        if (!currentData) {
          return currentData;
        }

        const updatedMeals =
          currentData.meals.map((meal) => ({
            ...meal,
            foods: meal.foods.filter(
              (food) => food.id !== foodId,
            ),
          }));

        return {
          ...currentData,
          meals: updatedMeals,
        };
      });
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : t("nutritionDeleteFoodError"),
      );
    } finally {
      setDeletingFoodId(null);
    }
  };

  const mealGroups = useMemo(() => {
    const existingMeals = data?.meals ?? [];

    return mealOrder.map((type) => {
      const existingMeal =
        existingMeals.find(
          (meal) => meal.type === type,
        );

      return (
        existingMeal ?? {
          id: `empty-${type}`,
          type,
          name: mealConfig[type].label,
          foods: [],
        }
      );
    });
  }, [data]);

  const totalCalories =
    data?.totals.calories ?? 0;

  const totalProtein =
    data?.totals.protein ?? 0;

  const totalCarbs =
    data?.totals.carbs ?? 0;

  const totalFat =
    data?.totals.fat ?? 0;

  const calorieTarget =
    data?.targets.calories ?? null;

  const proteinTarget =
    data?.targets.protein ?? null;

  const caloriesProgress =
    calorieTarget && calorieTarget > 0
      ? Math.min(
          (totalCalories / calorieTarget) * 100,
          100,
        )
      : 0;

  const proteinProgress =
    proteinTarget && proteinTarget > 0
      ? Math.min(
          (totalProtein / proteinTarget) * 100,
          100,
        )
      : 0;

  if (loading) {
    return (
      <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl bg-white dark:bg-zinc-900"
              />
            ),
          )}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-white dark:bg-zinc-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
            {t("nutritionTitle")}
          </h1>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("nutritionDescription")}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            openAddFood("BREAKFAST")
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          <Plus size={18} />
          {t("nutritionAddFood")}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Daily Targets */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Target size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-zinc-950 dark:text-white">
                {t("nutritionDailyTargets")}
              </h2>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t("nutritionDailyGoalsDescription")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowTargets(true)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Pencil size={16} />
            {t("nutritionEditTargets")}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {/* Calories */}
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("nutritionCalories")}
            </p>

            <p className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">
              {data?.targets.calories
                ? Math.round(
                    data.targets.calories,
                  )
                : "—"}

              <span className="ml-1 text-xs font-normal text-zinc-400">
                kcal
              </span>
            </p>
          </div>

          {/* Protein */}
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("nutritionProtein")}
            </p>

            <p className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">
              {data?.targets.protein
                ? Math.round(
                    data.targets.protein,
                  )
                : "—"}

              <span className="ml-1 text-xs font-normal text-zinc-400">
                g
              </span>
            </p>
          </div>

          {/* Carbs */}
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("nutritionCarbs")}
            </p>

            <p className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">
              {data?.targets.carbs
                ? Math.round(
                    data.targets.carbs,
                  )
                : "—"}

              <span className="ml-1 text-xs font-normal text-zinc-400">
                g
              </span>
            </p>
          </div>

          {/* Fat */}
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("nutritionFat")}
            </p>

            <p className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">
              {data?.targets.fat
                ? Math.round(
                    data.targets.fat,
                  )
                : "—"}

              <span className="ml-1 text-xs font-normal text-zinc-400">
                g
              </span>
            </p>
          </div>

          {/* Water */}
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("nutritionWater")}
            </p>

            <p className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">
              {data?.targets.water
                ? (
                    data.targets.water / 1000
                  ).toFixed(1)
                : "—"}

              <span className="ml-1 text-xs font-normal text-zinc-400">
                L
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Nutrition History */}
      <div className="w-full min-w-0">
        <NutritionHistory />
      </div>

      {/* Daily Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Calories */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              <Flame size={20} />
            </div>

            <span className="text-xs font-medium text-zinc-400">
              kcal
            </span>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-bold text-zinc-950 dark:text-white">
              {Math.round(totalCalories)}
            </p>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {calorieTarget
                ? language === "fa"
                  ? `از ${Math.round(calorieTarget)} کیلوکالری`
                  : `of ${Math.round(calorieTarget)} kcal`
                : t("nutritionDailyCalories")}
            </p>
          </div>

          {calorieTarget && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{
                    width: `${caloriesProgress}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Protein */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <Beef size={20} />
            </div>

            <span className="text-xs font-medium text-zinc-400">
              g
            </span>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-bold text-zinc-950 dark:text-white">
              {Math.round(totalProtein)}g
            </p>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {proteinTarget
                ? language === "fa"
                  ? `از ${Math.round(proteinTarget)} گرم`
                  : `of ${Math.round(proteinTarget)}g`
                : t("nutritionProtein")}
            </p>
          </div>

          {proteinTarget && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-red-500 transition-all"
                  style={{
                    width: `${proteinProgress}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Carbs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Wheat size={20} />
            </div>

            <span className="text-xs font-medium text-zinc-400">
              g
            </span>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-bold text-zinc-950 dark:text-white">
              {Math.round(totalCarbs)}g
            </p>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t("nutritionCarbohydrates")}
            </p>
          </div>
        </div>

        {/* Fat */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400">
              <Apple size={20} />
            </div>

            <span className="text-xs font-medium text-zinc-400">
              g
            </span>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-bold text-zinc-950 dark:text-white">
              {Math.round(totalFat)}g
            </p>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t("nutritionDietaryFat")}
            </p>
          </div>
        </div>
      </div>

      {/* Water */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        {(() => {
          const waterTotal =
            data?.water.totalMl ?? 0;

          const waterTarget =
            data?.targets.water ?? 2500;

          const waterProgress =
            waterTarget > 0
              ? Math.min(
                  (waterTotal / waterTarget) *
                    100,
                  100,
                )
              : 0;

          return (
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Droplets size={21} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-zinc-950 dark:text-white">
                      {t("nutritionWater")}
                    </h2>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {t("nutritionHydrationDescription")}
                    </p>
                  </div>
                </div>

                <div className={isRTL ? "text-start" : "text-end"}>
                  <p className="text-xl font-bold text-zinc-950 dark:text-white">
                    {(
                      waterTotal / 1000
                    ).toFixed(2)}{" "}
                    L
                  </p>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    /{" "}
                    {(
                      waterTarget / 1000
                    ).toFixed(1)}{" "}
                    L
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">
                    {t("nutritionDailyGoal")}
                  </span>

                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {Math.round(
                      waterProgress,
                    )}
                    %
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${waterProgress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Quick Add */}
              <div>
                <p className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t("nutritionQuickAdd")}
                </p>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[250, 500, 750, 1000].map(
                    (amount) => (
                      <button
                        key={amount}
                        type="button"
                        disabled={addingWater}
                        onClick={() =>
                          handleAddWater(amount)
                        }
                        className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                      >
                        +{amount} ml
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t("nutritionRemaining")}
                </span>

                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {Math.max(
                    waterTarget -
                      waterTotal,
                    0,
                  )}{" "}
                  ml
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {mealGroups.map((meal) => {
          const config =
            mealConfig[meal.type];

          const Icon = config.icon;

          const mealCalories =
            meal.foods.reduce(
              (total, food) =>
                total +
                (food.calories ?? 0),
              0,
            );

          const mealProtein =
            meal.foods.reduce(
              (total, food) =>
                total +
                (food.protein ?? 0),
              0,
            );

          return (
            <section
              key={meal.type}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Meal Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 sm:px-5 dark:border-zinc-800">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-zinc-950 dark:text-white">
                      {t(mealTranslationKeys[meal.type])}
                    </h2>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {Math.round(
                        mealCalories,
                      )}{" "}
                      kcal ·{" "}
                      {Math.round(
                        mealProtein,
                      )}
                      {t("nutritionProteinUnitLabel")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openAddFood(meal.type)
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  aria-label={`${t("nutritionAddFoodTo")} ${t(mealTranslationKeys[meal.type])}`}
                >
                  <Plus size={19} />
                </button>
              </div>

              {/* Foods */}
              {meal.foods.length > 0 ? (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {meal.foods.map(
                    (food) => (
                      <div
                        key={food.id}
                        className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                              {food.name}
                            </h3>

                            {food.servingSize && (
                              <span className="shrink-0 text-xs text-zinc-400">
                                {
                                  food.servingSize
                                }
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>
                              {Math.round(
                                food.calories ??
                                  0,
                              )}{" "}
                              kcal
                            </span>

                            <span>
                              {t("nutritionProteinAbbreviation")}{" "}
                              {Math.round(
                                food.protein ??
                                  0,
                              )}
                              g
                            </span>

                            <span>
                              {t("nutritionCarbsAbbreviation")}{" "}
                              {Math.round(
                                food.carbs ??
                                  0,
                              )}
                              g
                            </span>

                            <span>
                              {t("nutritionFatAbbreviation")}{" "}
                              {Math.round(
                                food.fat ??
                                  0,
                              )}
                              g
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditFood(
                                food,
                                meal.type,
                              )
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Pencil size={14} />
                            <span>
                              {t("nutritionEditFood")}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteFood(
                                food.id,
                              )
                            }
                            disabled={
                              deletingFoodId ===
                              food.id
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            <Trash2
                              size={14}
                            />

                            <span>
                              {deletingFoodId ===
                              food.id
                                ? t("nutritionDeletingFood")
                                : t("nutritionDeleteFood")}
                            </span>
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                    <Utensils size={20} />
                  </div>

                  <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t("nutritionNoFoodYet")}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t("nutritionAddFirstFoodToMeal")}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      openAddFood(meal.type)
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    <Plus size={15} />
                    {t("nutritionAddFood")}
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Targets Modal */}
      {showTargets && data && (
        <NutritionTargetsModal
          targets={data.targets}
          onSuccess={handleTargetsSaved}
          onClose={() =>
            setShowTargets(false)
          }
        />
      )}

      {/* Add / Edit Food Modal */}
      {showAddFood && (
        <AddFoodModal
          defaultMealType={
            selectedMealType
          }
          food={editingFood}
          onSuccess={handleFoodSaved}
          onClose={closeFoodModal}
        />
      )}
    </div>
  );
}