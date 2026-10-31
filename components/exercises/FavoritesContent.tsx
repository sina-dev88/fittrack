"use client";

import Link from "next/link";
import { Dumbbell, Heart } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { translateExerciseLabel } from "@/lib/i18n/exercise-labels";

type FavoriteItem = {
  id: string;
  exercise: {
    id: string;
    name: string;
    primaryMuscle: string;
    secondaryMuscles: string | null;
    equipment: string | null;
    difficulty: string | null;
    description: string | null;
  };
};

export default function FavoritesContent({
  favorites,
}: {
  favorites: FavoriteItem[];
}) {
  const { t, isRTL } = useLanguage();

  return (
    <div
      className="mx-auto max-w-7xl space-y-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Heart
              size={20}
              className="fill-current text-rose-500"
            />

            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {t("exerciseLibraryTitle")}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {t("favoritesPageTitle")}
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t("favoritesPageDescription")}
          </p>
        </div>

        <Link
          href="/exercises"
          className="flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <Dumbbell size={17} />
          <span>{t("browseExercises")}</span>
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
            <Heart size={28} className="text-zinc-400" />
          </div>

          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            {t("noFavoriteExercises")}
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {t("saveExercisesHint")}
          </p>

          <Link
            href="/exercises"
            className="mt-5 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {t("exploreExercises")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((favorite) => {
            const exercise = favorite.exercise;

            return (
              <Link
                key={favorite.id}
                href={`/exercises/${exercise.id}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800">
                      <Dumbbell size={20} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-zinc-950 group-hover:underline dark:text-white">
                        {exercise.name}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {translateExerciseLabel(
                          exercise.primaryMuscle,
                          "muscle",
                          t,
                        )}
                      </p>
                    </div>
                  </div>

                  <Heart
                    size={19}
                    className="shrink-0 fill-current text-rose-500"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {exercise.equipment && (
                    <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {translateExerciseLabel(
                        exercise.equipment,
                        "equipment",
                        t,
                      )}
                    </span>
                  )}

                  {exercise.difficulty && (
                    <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {translateExerciseLabel(
                        exercise.difficulty,
                        "difficulty",
                        t,
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
            );
          })}
        </div>
      )}
    </div>
  );
}