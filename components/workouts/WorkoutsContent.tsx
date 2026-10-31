
"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Plus,
} from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";

import {
  translateWorkoutDayName,
  translateWorkoutPlanName,
  translateWorkoutPlanDescription,
} from "@/lib/i18n/exercise-labels";

type WorkoutPlan = {
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
    }[];
  }[];
};

export default function WorkoutsContent({
  plans,
}: {
  plans: WorkoutPlan[];
}) {
  const { t, isRTL, language } = useLanguage();

  const numberFormat = new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : "en-US",
  );

  return (
    <div
      className="mx-auto max-w-7xl space-y-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {t("workoutPlanner")}
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {t("myWorkouts")}
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t("workoutsDescription")}
          </p>
        </div>

        <Link
          href="/workouts/new"
          className="flex w-fit items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium !text-white transition hover:bg-zinc-800 dark:bg-zinc-800 dark:!text-white dark:hover:bg-zinc-700"
        >
          <Plus size={18} className="!text-white" />

          <span className="!text-white">
            {t("createWorkoutPlan")}
          </span>
        </Link>
      </div>

      {/* Empty state */}
      {plans.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
            <Dumbbell
              size={30}
              className="text-zinc-500"
            />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-zinc-950 dark:text-white">
            {t("noWorkoutPlansYet")}
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {t("createFirstWorkoutPlan")}
          </p>

          <Link
            href="/workouts/new"
            className="mt-5 flex w-fit items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium !text-white transition hover:bg-zinc-800 dark:bg-zinc-800 dark:!text-white dark:hover:bg-zinc-700"
          >
            <Plus size={18} className="!text-white" />

            <span className="!text-white">
              {t("createWorkoutPlan")}
            </span>
          </Link>
        </div>
      ) : (
        /* Workout plan cards */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const exerciseCount = plan.days.reduce(
              (total, day) => total + day.exercises.length,
              0,
            );

            return (
              <Link
                key={plan.id}
                href={`/workouts/plans/${plan.id}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                    <Dumbbell size={22} />
                  </div>

                  <ChevronRight
                    size={20}
                    className={`text-zinc-400 transition-transform ${
                      isRTL
                        ? "group-hover:-translate-x-1 rotate-180"
                        : "group-hover:translate-x-1"
                    }`}
                  />
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
                      {translateWorkoutPlanName(
                        plan.name,
                        language,
                      )}
                    </h2>

                    {plan.isTemplate && (
                      <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800">
                        {t("templateLabel")}
                      </span>
                    )}
                  </div>

                  {plan.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                      {translateWorkoutPlanDescription(
                        plan.description,
                        language,
                      )}
                    </p>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <CalendarDays size={15} />

                      <span className="text-xs">
                        {t("daysLabel")}
                      </span>
                    </div>

                    <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
                      {numberFormat.format(plan.days.length)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Dumbbell size={15} />

                      <span className="text-xs">
                        {t("exercises")}
                      </span>
                    </div>

                    <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
                      {numberFormat.format(exerciseCount)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <div className="flex flex-wrap gap-2">
                    {plan.days.slice(0, 4).map((day) => (
                      <span
                        key={day.id}
                        className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {translateWorkoutDayName(
                          day.name,
                          language,
                        )}
                      </span>
                    ))}

                    {plan.days.length > 4 && (
                      <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        +{numberFormat.format(plan.days.length - 4)}{" "}
                        {t("moreDays")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
