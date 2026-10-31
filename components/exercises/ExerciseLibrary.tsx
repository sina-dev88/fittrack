"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dumbbell, Search, SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  translateExerciseLabel,
  translateExerciseName,
} from "@/lib/i18n/exercise-labels";

type Exercise = {
  id: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string | null;
  equipment: string | null;
  difficulty: string | null;
  description: string | null;
  isCustom: boolean;
};

const muscleOptions = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs",
];

const equipmentOptions = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Kettlebell",
  "Resistance Band",
];

const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];

export default function ExerciseLibrary() {
  const { t, isRTL, language } = useLanguage();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const numberFormat = new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : "en-US",
  );

  async function loadExercises() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      // Keep canonical English values in API queries; only labels are translated.
      if (search) params.set("search", search);
      if (muscle) params.set("muscle", muscle);
      if (equipment) params.set("equipment", equipment);
      if (difficulty) params.set("difficulty", difficulty);

      const response = await fetch(`/api/exercises?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load exercises.");
      }

      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error(error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadExercises();
    }, 300);

    return () => clearTimeout(timeout);
    // Keep the existing search/filter debounce behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, muscle, equipment, difficulty]);

  function clearFilters() {
    setSearch("");
    setMuscle("");
    setEquipment("");
    setDifficulty("");
  }

  const hasFilters = Boolean(search || muscle || equipment || difficulty);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Search + Filter */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 ${
                isRTL ? "right-3" : "left-3"
              }`}
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("exerciseSearchPlaceholder")}
              aria-label={t("exerciseSearchPlaceholder")}
              className={`h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-600 ${
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:w-auto"
          >
            <SlidersHorizontal size={17} />
            {t("exerciseFiltersLabel")}
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <X size={16} />
              {t("exerciseClearFiltersLabel")}
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid gap-3 border-t border-zinc-200 pt-4 sm:grid-cols-3 dark:border-zinc-800">
            <select
              value={muscle}
              onChange={(event) => setMuscle(event.target.value)}
              aria-label={t("exerciseAllMuscles")}
              className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            >
              <option value="">{t("exerciseAllMuscles")}</option>

              {muscleOptions.map((item) => (
                <option key={item} value={item}>
                  {translateExerciseLabel(item, "muscle", t, language)}
                </option>
              ))}
            </select>

            <select
              value={equipment}
              onChange={(event) => setEquipment(event.target.value)}
              aria-label={t("exerciseAllEquipment")}
              className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            >
              <option value="">{t("exerciseAllEquipment")}</option>

              {equipmentOptions.map((item) => (
                <option key={item} value={item}>
                  {translateExerciseLabel(item, "equipment", t, language)}
                </option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              aria-label={t("exerciseAllLevels")}
              className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            >
              <option value="">{t("exerciseAllLevels")}</option>

              {difficultyOptions.map((item) => (
                <option key={item} value={item}>
                  {translateExerciseLabel(item, "difficulty", t, language)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between">
        <p
          className="text-sm text-zinc-500 dark:text-zinc-400"
          aria-live="polite"
        >
          {loading
            ? t("exerciseLoadingResults")
            : `${numberFormat.format(exercises.length)} ${t(
                exercises.length === 1
                  ? "exerciseResultSingular"
                  : "exerciseResultPlural",
              )}`}
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        /* Empty */
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Dumbbell size={24} className="text-zinc-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-zinc-950 dark:text-white">
            {t("exerciseNoResultsTitle")}
          </h2>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t("exerciseChangeSearchFilters")}
          </p>
        </div>
      ) : (
        /* Cards */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/exercises/${exercise.id}`}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <Dumbbell
                    size={20}
                    className="text-zinc-600 dark:text-zinc-300"
                  />
                </div>

                {exercise.isCustom && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {t("exerciseCustomLabel")}
                  </span>
                )}
              </div>

              <h2 className="mt-5 text-lg font-semibold text-zinc-950 transition group-hover:text-zinc-700 dark:text-white dark:group-hover:text-zinc-300">
                {translateExerciseName(exercise.name, language)}
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {exercise.primaryMuscle && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {translateExerciseLabel(
                      exercise.primaryMuscle,
                      "muscle",
                      t,
                      language,
                    )}
                  </span>
                )}

                {exercise.equipment && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {translateExerciseLabel(
                      exercise.equipment,
                      "equipment",
                      t,
                      language,
                    )}
                  </span>
                )}

                {exercise.difficulty && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {translateExerciseLabel(
                      exercise.difficulty,
                      "difficulty",
                      t,
                      language,
                    )}
                  </span>
                )}
              </div>

              {exercise.description && (
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {exercise.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
