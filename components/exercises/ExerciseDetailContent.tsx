"use client";

import Link from "next/link";
import { ArrowLeft, Dumbbell, Info, TriangleAlert } from "lucide-react";
import {
  translateExerciseLabel,
  translateExerciseName,
} from "@/lib/i18n/exercise-labels";

import { translateExerciseContent } from "@/lib/i18n/exercise-content";
import { useLanguage } from "@/components/language/LanguageProvider";

import FavoriteButton from "@/components/exercises/FavoriteButton";
import AddToWorkoutButton from "@/components/exercises/AddToWorkoutButton";

type ExerciseDetails = {
  id: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string | null;
  equipment: string | null;
  difficulty: string | null;
  description: string | null;
  instructions: string | null;
  commonMistakes: string | null;
  isCustom: boolean;
};

type Props = {
  exercise: ExerciseDetails;
  initialFavorited: boolean;
};

export default function ExerciseDetailContent({
  exercise,
  initialFavorited,
}: Props) {
  const { t, isRTL, language } = useLanguage();

  const primaryMuscle = translateExerciseLabel(
    exercise.primaryMuscle,
    "muscle",
    t,
    language,
  );

  const secondaryMuscles = translateExerciseLabel(
    exercise.secondaryMuscles,
    "muscle",
    t,
    language,
  );

  const equipment = translateExerciseLabel(
    exercise.equipment,
    "equipment",
    t,
    language,
  );

  const difficulty = translateExerciseLabel(
    exercise.difficulty,
    "difficulty",
    t,
    language,
  );
  const exerciseName = translateExerciseName(exercise.name, language);

  const description = translateExerciseContent(
    exercise.name,
    "description",
    exercise.description,
    language,
  );

  const instructions = translateExerciseContent(
    exercise.name,
    "instructions",
    exercise.instructions,
    language,
  );

  const commonMistakes = translateExerciseContent(
    exercise.name,
    "commonMistakes",
    exercise.commonMistakes,
    language,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Back */}
      <Link
        href="/exercises"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950 dark:hover:text-white"
      >
        <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
        {t("backToExercises")}
      </Link>

      {/* Exercise overview */}
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Dumbbell size={28} className="text-zinc-700 dark:text-zinc-200" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {primaryMuscle}
              </span>

              {difficulty && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {difficulty}
                </span>
              )}

              {exercise.isCustom && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {t("customExercise")}
                </span>
              )}
            </div>

            <h1 className="mt-4 break-words text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              {exerciseName}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <FavoriteButton
                exerciseId={exercise.id}
                initialFavorited={initialFavorited}
              />

              <AddToWorkoutButton exerciseId={exercise.id} />
            </div>

            {description && (
              <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Exercise metadata */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("exerciseDetailPrimaryMuscle")}
            </p>

            <p className="mt-1 font-semibold text-zinc-950 dark:text-white">
              {primaryMuscle}
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("exerciseDetailSecondaryMuscles")}
            </p>

            <p className="mt-1 break-words font-semibold text-zinc-950 dark:text-white">
              {secondaryMuscles || "—"}
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("exerciseDetailEquipment")}
            </p>

            <p className="mt-1 font-semibold text-zinc-950 dark:text-white">
              {equipment || "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Instructions and common mistakes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Info size={19} className="text-zinc-600 dark:text-zinc-300" />
            </div>

            <div>
              <h2 className="font-semibold text-zinc-950 dark:text-white">
                {t("exerciseDetailInstructions")}
              </h2>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("exerciseDetailHowTo")}
              </p>
            </div>
          </div>

          <div className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            {instructions || t("exerciseDetailNoInstructions")}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <TriangleAlert
                size={19}
                className="text-zinc-600 dark:text-zinc-300"
              />
            </div>

            <div>
              <h2 className="font-semibold text-zinc-950 dark:text-white">
                {t("exerciseDetailMistakes")}
              </h2>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("exerciseDetailMistakesHint")}
              </p>
            </div>
          </div>

          <div className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            {commonMistakes || t("exerciseDetailNoMistakes")}
          </div>
        </section>
      </div>
    </div>
  );
}
