"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  Plus,
  Play,
  Info,
  CalendarDays,
} from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";

import {
  translateExerciseLabel,
  translateExerciseName,
  translateWorkoutDayName,
  translateWorkoutPlanName,
  translateWorkoutPlanDescription,
} from "@/lib/i18n/exercise-labels";

import DeleteExerciseButton from "@/components/workouts/DeleteExerciseButton";
import AddDayButton from "@/components/workouts/AddDayButton";

type WorkoutPlanDetails = {
  id: string;
  name: string;
  description: string | null;
  isTemplate: boolean;
  days: {
    id: string;
    name: string;
    dayNumber: number;
    exercises: {
      id: string;
      order: number;
      targetSets: number | null;
      targetReps: number | null;
      exercise: {
        id: string;
        name: string;
        primaryMuscle: string;
        equipment: string | null;
      };
    }[];
  }[];
};

type Props = {
  plan: WorkoutPlanDetails;
  needsReview: boolean;
};

export default function WorkoutPlanDetailContent({ plan, needsReview }: Props) {
  const { t, isRTL, language } = useLanguage();

  const numberFormat = new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : "en-US",
  );

  const totalExercises = plan.days.reduce(
    (total, day) => total + day.exercises.length,
    0,
  );

  const arrowClass = isRTL ? "rotate-180" : "";

  return (
    <div
      className="mx-auto max-w-5xl space-y-8 pb-10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div>
        <Link
          href="/workouts"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950 dark:hover:text-white"
        >
          <ArrowLeft size={17} className={arrowClass} />
          {t("workoutDetailBack")}
        </Link>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                <Dumbbell size={23} />
              </div>

              <h1 className="break-words text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {translateWorkoutPlanName(plan.name, language)}
              </h1>
            </div>

            {plan.description && (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                {translateWorkoutPlanDescription(plan.description, language)}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
              <span>
                {numberFormat.format(plan.days.length)}{" "}
                {t(
                  plan.days.length === 1
                    ? "workoutDetailDaySingular"
                    : "workoutDetailDays",
                )}
              </span>

              <span>•</span>

              <span>
                {numberFormat.format(totalExercises)}{" "}
                {t(
                  totalExercises === 1
                    ? "workoutDetailExerciseSingular"
                    : "workoutDetailExercises",
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <AddDayButton planId={plan.id} />

            <Link
              href={`/workouts/plans/${plan.id}/add-exercise`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium !text-white transition hover:bg-zinc-800 dark:bg-white dark:!text-zinc-950 dark:hover:bg-zinc-200"
            >
              <Plus size={17} />
              <span>{t("workoutDetailAddExercise")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Four-week review */}
      {needsReview && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                {t("workoutDetailFourWeekReview")}
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                {t("workoutDetailReviewHeading")}
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {t("workoutDetailReviewDescription")}
              </p>
            </div>

            <Link
              href={`/workouts/plans/${plan.id}/review`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              {t("workoutDetailReviewProgress")}
            </Link>
          </div>
        </section>
      )}

      {/* Days */}
      <div className="space-y-5">
        {plan.days.map((day) => (
          <section
            key={day.id}
            className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Day Header */}
            <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {t("workoutDetailDay")} {numberFormat.format(day.dayNumber)}
                </p>

                <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">
                  {translateWorkoutDayName(day.name, language)}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {numberFormat.format(day.exercises.length)}{" "}
                  {t(
                    day.exercises.length === 1
                      ? "workoutDetailExerciseSingular"
                      : "workoutDetailExercises",
                  )}
                </p>
              </div>

              <Link
                href={`/workouts/plans/${plan.id}/session/${day.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <Play size={16} />
                {t("workoutDetailStartWorkout")}
              </Link>
            </div>

            {/* Exercises */}
            {day.exercises.length === 0 ? (
              <div className="p-8 text-center">
                <Dumbbell size={25} className="mx-auto text-zinc-400" />

                <p className="mt-3 text-sm font-medium">
                  {t("workoutDetailNoExercises")}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  {t("workoutDetailAddExercisesHint")}
                </p>

                <Link
                  href={`/workouts/plans/${plan.id}/add-exercise`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
                >
                  <Plus size={15} />
                  {t("workoutDetailAddExercise")}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {day.exercises.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 p-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold dark:bg-zinc-800">
                      {numberFormat.format(index + 1)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/exercises/${item.exercise.id}`}
                        className="font-medium text-zinc-950 hover:underline dark:text-white"
                      >
                        {translateExerciseName(item.exercise.name, language)}
                      </Link>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                        {item.exercise.primaryMuscle && (
                          <span>
                            {translateExerciseLabel(
                              item.exercise.primaryMuscle,
                              "muscle",
                              t,
                              language,
                            )}
                          </span>
                        )}

                        {item.exercise.equipment && (
                          <>
                            <span>•</span>
                            <span>
                              {translateExerciseLabel(
                                item.exercise.equipment,
                                "equipment",
                                t,
                                language,
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-end">
                        <p className="text-sm font-semibold">
                          {item.targetSets == null
                            ? "-"
                            : numberFormat.format(item.targetSets)}{" "}
                          ×{" "}
                          {item.targetReps == null
                            ? "-"
                            : numberFormat.format(item.targetReps)}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {t("workoutDetailSetsReps")}
                        </p>
                      </div>

                      <DeleteExerciseButton
                        planId={plan.id}
                        workoutExerciseId={item.id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
