"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAchievements } from "@/components/achievements/AchievementProvider";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  translateExerciseLabel,
  translateExerciseName,
  translateWorkoutDayName,
} from "@/lib/i18n/exercise-labels";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock3,
  Dumbbell,
  Play,
  Plus,
  TimerReset,
} from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  primaryMuscle: string;
  equipment: string | null;
};

type WorkoutExercise = {
  id: string;
  order: number;
  targetSets: number | null;
  targetReps: number | null;
  exercise: Exercise;
};
type WorkoutDay = {
  id: string;
  name: string;
  dayNumber: number;
  exercises: WorkoutExercise[];
};

type Plan = {
  id: string;
  name: string;
  description: string | null;
  days: WorkoutDay[];
};

type SetRow = {
  id: string;
  setNumber: number;
  weight: string;
  reps: string;
  rpe: string;
  rir: string;
  status: "COMPLETED" | "FAILED" | "SKIPPED";
  saved: boolean;
};

export default function WorkoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();

  const locale = language === "fa" ? "fa-IR" : "en-US";
  const numberFormat = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale],
  );
  const twoDigitFormat = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumIntegerDigits: 2,
        maximumFractionDigits: 0,
        useGrouping: false,
      }),
    [locale],
  );

  const planId = String(params.id);
  const dayId = String(params.dayId);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  const [sets, setSets] = useState<Record<string, SetRow[]>>({});

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [restSeconds, setRestSeconds] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const { showAchievements } = useAchievements();

  const [error, setError] = useState("");

  const day = useMemo(() => {
    if (!plan?.days || !Array.isArray(plan.days)) {
      return null;
    }

    const normalizedDayId = String(dayId);

    const foundDay =
      plan.days.find((item) => String(item.id) === normalizedDayId) ?? null;

    console.log("SESSION DEBUG:", {
      planId,
      dayId,
      planDays: plan.days.map((item) => ({
        id: item.id,
        name: item.name,
      })),
      foundDay,
    });

    return foundDay;
  }, [plan, dayId]);

  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);

        const response = await fetch(`/api/workout-plans/${planId}/session`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load workout.");
        }

        setPlan(data.plan);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load workout.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [planId]);

  useEffect(() => {
    if (!workoutId) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [workoutId]);

  useEffect(() => {
    if (!restActive || restSeconds <= 0) return;

    const interval = window.setInterval(() => {
      setRestSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          setRestActive(false);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [restActive, restSeconds]);

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${twoDigitFormat.format(minutes)}:${twoDigitFormat.format(remaining)}`;
  }

  function getDisplayError(message: string) {
    switch (message) {
      case "Workout day not found.":
        return t("workoutSessionDayNotFound");
      case "Failed to load workout.":
        return t("workoutSessionLoadError");
      case "Failed to start workout.":
        return t("workoutSessionStartError");
      case "Failed to save set.":
        return t("workoutSessionSaveError");
      case "Failed to finish workout.":
        return t("workoutSessionFinishError");
      case "Something went wrong.":
        return t("workoutSessionGenericError");
      default:
        return message;
    }
  }

  function startRestTimer(seconds = 90) {
    setRestSeconds(seconds);
    setRestActive(true);
  }

  function addSet(exerciseId: string) {
    setSets((current) => {
      const existing = current[exerciseId] ?? [];

      return {
        ...current,
        [exerciseId]: [
          ...existing,
          {
            id: crypto.randomUUID(),
            setNumber: existing.length + 1,
            weight: "",
            reps: "",
            rpe: "",
            rir: "",
            status: "COMPLETED",
            saved: false,
          },
        ],
      };
    });
  }

  function updateSet(
    exerciseId: string,
    setId: string,
    field: "weight" | "reps" | "rpe" | "rir",
    value: string,
  ) {
    setSets((current) => ({
      ...current,
      [exerciseId]: (current[exerciseId] ?? []).map((set) =>
        set.id === setId
          ? {
              ...set,
              [field]: value,
              saved: false,
            }
          : set,
      ),
    }));
  }
  async function startWorkout() {
    if (!day) {
      setError("Workout day not found.");
      return;
    }

    try {
      setStarting(true);
      setError("");

      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutPlanId: planId,
          workoutDayId: dayId,
          name: day.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start workout.");
      }

      setWorkoutId(data.id);
      setElapsedSeconds(0);

      const initialSets: Record<string, SetRow[]> = {};

      day.exercises.forEach((exercise) => {
        initialSets[exercise.id] = [];

        const targetSets = exercise.targetSets ?? 3;

        for (let i = 0; i < targetSets; i++) {
          initialSets[exercise.id].push({
            id: crypto.randomUUID(),
            setNumber: i + 1,
            weight: "",
            reps: String(exercise.targetReps ?? ""),
            rpe: "",
            rir: "",
            status: "COMPLETED",
            saved: false,
          });
        }
      });

      setSets(initialSets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start workout.");
    } finally {
      setStarting(false);
    }
  }

  async function completeSet(exercise: WorkoutExercise, set: SetRow) {
    if (!workoutId) return;

    const weight = Number(set.weight);
    const reps = Number(set.reps);

    if (
      !Number.isFinite(weight) ||
      weight < 0 ||
      !Number.isInteger(reps) ||
      reps < 1
    ) {
      const exerciseName = translateExerciseName(exercise.exercise.name, language);
      setError(
        language === "fa"
          ? `وزنه و تعداد تکرار معتبر برای «${exerciseName}» وارد کن.`
          : `Enter a valid weight and reps for ${exerciseName}.`,
      );
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/workouts/${workoutId}/sets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutExerciseId: exercise.id,
          setNumber: set.setNumber,
          weight,
          reps,
          rpe: set.rpe === "" ? null : Number(set.rpe),
          rir: set.rir === "" ? null : Number(set.rir),
          status: set.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save set.");
      }

      setSets((current) => ({
        ...current,
        [exercise.id]: (current[exercise.id] ?? []).map((item) =>
          item.id === set.id
            ? {
                ...item,
                status: "COMPLETED",
                saved: true,
              }
            : item,
        ),
      }));

      startRestTimer(90);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save set.");
    }
  }

  async function finishWorkout() {
    if (!workoutId) {
      return;
    }

    try {
      setFinishing(true);
      setError("");

      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to finish workout.");
      }

      if (
        result.unlockedAchievements &&
        result.unlockedAchievements.length > 0
      ) {
        showAchievements(
          result.unlockedAchievements.map(
            (item: {
              achievement: {
                id: string;
                name: string;
                description: string;
                icon: string;
              };
            }) => ({
              id: item.achievement.id,
              name: item.achievement.name,
              description: item.achievement.description,
              icon: item.achievement.icon,
            }),
          ),
        );
      }

      router.push(`/workouts/${workoutId}`);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to finish workout.",
      );
    } finally {
      setFinishing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="h-8 w-52 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-red-500">{getDisplayError(error)}</p>
      </div>
    );
  }

  if (!plan || !day) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-zinc-500">{t("workoutSessionDayNotFound")}</p>
      </div>
    );
  }

  const totalVolume = Object.values(sets)
    .flat()
    .reduce((total, set) => {
      const weight = Number(set.weight);
      const reps = Number(set.reps);

      if (Number.isFinite(weight) && Number.isFinite(reps)) {
        return total + weight * reps;
      }

      return total;
    }, 0);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href={`/workouts/plans/${plan.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
          >
            <ArrowLeft size={17} className={isRTL ? "rotate-180" : ""} />
            {t("workoutSessionBackToPlan")}
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
              <Dumbbell size={22} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {t("workoutSessionDay")} {numberFormat.format(day.dayNumber)}
              </p>

              <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">
                {translateWorkoutDayName(day.name, language)}
              </h1>
            </div>
          </div>
        </div>

        {!workoutId ? (
          <button
            type="button"
            onClick={startWorkout}
            disabled={starting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium !text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:!text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Play size={17} />
            {starting ? t("workoutSessionStarting") : t("workoutSessionStartWorkout")}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock3 size={16} />
                {formatTime(elapsedSeconds)}
              </div>
            </div>

            <button
              type="button"
              onClick={finishWorkout}
              disabled={finishing}
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium !text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:!text-zinc-950"
            >
              {finishing ? t("workoutSessionFinishing") : t("workoutSessionFinish")}
            </button>
          </div>
        )}
      </div>

      {/* Rest Timer */}
      {restActive && (
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <TimerReset size={20} />

            <div>
              <p className="text-sm font-semibold">{t("workoutSessionRestTimer")}</p>

              <p className="text-xs text-zinc-500">
                {t("workoutSessionRestDescription")}
              </p>
            </div>
          </div>

          <span className="text-xl font-bold">{formatTime(restSeconds)}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {getDisplayError(error)}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">{t("workoutSessionExercises")}</p>
          <p className="mt-1 text-xl font-bold">{numberFormat.format(day.exercises.length)}</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">{t("workoutSessionSets")}</p>
          <p className="mt-1 text-xl font-bold">
            {numberFormat.format(Object.values(sets).flat().length)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">{t("workoutSessionVolume")}</p>
          <p className="mt-1 text-xl font-bold">
            {numberFormat.format(Math.round(totalVolume))}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">{t("workoutSessionTime")}</p>
          <p className="mt-1 text-xl font-bold">{formatTime(elapsedSeconds)}</p>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-5">
        {day.exercises.map((exercise) => {
          const exerciseSets = sets[exercise.id] ?? [];

          return (
            <section
              key={exercise.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="border-b border-zinc-100 p-5 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                      {translateExerciseName(exercise.exercise.name, language)}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                      {translateExerciseLabel(
                        exercise.exercise.primaryMuscle,
                        "muscle",
                        t,
                        language,
                      )}
                      {exercise.exercise.equipment &&
                        ` • ${translateExerciseLabel(
                          exercise.exercise.equipment,
                          "equipment",
                          t,
                          language,
                        )}`}
                    </p>
                  </div>

                  <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium dark:bg-zinc-800">
                    {t("workoutSessionTarget")} {exercise.targetSets == null ? "-" : numberFormat.format(exercise.targetSets)} ×{" "}
                    {exercise.targetReps == null ? "-" : numberFormat.format(exercise.targetReps)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead>
                    <tr className={`border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800 ${isRTL ? "text-right" : "text-left"}`}>
                      <th className={`px-5 py-3 ${isRTL ? "text-right" : "text-left"}`}>{t("workoutSessionSet")}</th>
                      <th className={`px-3 py-3 ${isRTL ? "text-right" : "text-left"}`}>{t("workoutSessionWeight")}</th>
                      <th className={`px-3 py-3 ${isRTL ? "text-right" : "text-left"}`}>{t("workoutSessionReps")}</th>
                      <th className={`px-3 py-3 ${isRTL ? "text-right" : "text-left"}`}>RPE</th>
                      <th className={`px-3 py-3 ${isRTL ? "text-right" : "text-left"}`}>RIR</th>
                      <th className={`px-5 py-3 ${isRTL ? "text-left" : "text-right"}`}>{t("workoutSessionAction")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {exerciseSets.map((set) => (
                      <tr
                        key={set.id}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                      >
                        <td className="px-5 py-4 font-medium">
                          {numberFormat.format(set.setNumber)}
                        </td>

                        <td className="px-3 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weight}
                            onChange={(e) =>
                              updateSet(
                                exercise.id,
                                set.id,
                                "weight",
                                e.target.value,
                              )
                            }
                            className="h-9 w-24 rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
                            placeholder="kg"
                            disabled={!workoutId}
                          />
                        </td>

                        <td className="px-3 py-4">
                          <input
                            type="number"
                            min="1"
                            value={set.reps}
                            onChange={(e) =>
                              updateSet(
                                exercise.id,
                                set.id,
                                "reps",
                                e.target.value,
                              )
                            }
                            className="h-9 w-20 rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
                            placeholder={t("workoutSessionRepsPlaceholder")}
                            disabled={!workoutId}
                          />
                        </td>

                        <td className="px-3 py-4">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={set.rpe}
                            onChange={(e) =>
                              updateSet(
                                exercise.id,
                                set.id,
                                "rpe",
                                e.target.value,
                              )
                            }
                            className="h-9 w-20 rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
                            placeholder="RPE"
                            disabled={!workoutId}
                          />
                        </td>

                        <td className="px-3 py-4">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="1"
                            value={set.rir}
                            onChange={(e) =>
                              updateSet(
                                exercise.id,
                                set.id,
                                "rir",
                                e.target.value,
                              )
                            }
                            className="h-9 w-20 rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-950"
                            placeholder="RIR"
                            disabled={!workoutId}
                          />
                        </td>

                        <td className={`px-5 py-4 ${isRTL ? "text-left" : "text-right"}`}>
                          <button
                            type="button"
                            onClick={() => completeSet(exercise, set)}
                            disabled={!workoutId || set.saved}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-medium !text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:!text-zinc-950"
                          >
                            <Check size={14} />
                            {set.saved ? t("workoutSessionSaved") : t("workoutSessionSave")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end border-t border-zinc-100 p-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => addSet(exercise.id)}
                  disabled={!workoutId}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <Plus size={14} />
                  {t("workoutSessionAddSet")}
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
