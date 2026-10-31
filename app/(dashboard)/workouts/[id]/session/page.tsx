"use client";

import Link from "next/link";
import { ArrowLeft, Check, Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/components/language/LanguageProvider";
import {
  translateExerciseName,
  translateWorkoutDayName,
  translateWorkoutPlanName,
} from "@/lib/i18n/exercise-labels";

type Exercise = {
  id: string;
  name: string;
};

type WorkoutExercise = {
  id: string;
  targetSets: number | null;
  targetReps: number | null;
  exercise: Exercise;
};

type WorkoutDay = {
  id: string;
  dayNumber: number;
  name: string;
  exercises: WorkoutExercise[];
};

type Plan = {
  id: string;
  name: string;
  days: WorkoutDay[];
};

type SetData = {
  weight: string;
  reps: string;
  completed: boolean;
};

export default function WorkoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();

  const planId = params.id as string;
  const locale = language === "fa" ? "fa-IR" : "en-US";
  const numberFormat = new Intl.NumberFormat(locale);
  const twoDigitFormat = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  const [plan, setPlan] = useState<Plan | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  const [sets, setSets] = useState<Record<string, SetData[]>>({});

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Workout duration
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rest timer
  const [restSeconds, setRestSeconds] = useState(0);
  const [restRunning, setRestRunning] = useState(false);

  // Load workout plan
  useEffect(() => {
    async function loadWorkout() {
      try {
        const response = await fetch(
          `/api/workout-plans/${planId}/session`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || t("workoutSessionLoadFailed"));
          return;
        }

        setPlan(data.plan);

        const initialSets: Record<string, SetData[]> = {};

        for (const day of data.plan.days) {
          for (const exercise of day.exercises) {
            initialSets[exercise.id] = Array.from({
              length: exercise.targetSets ?? 3,
            }).map(() => ({
              weight: "",
              reps: String(exercise.targetReps ?? ""),
              completed: false,
            }));
          }
        }

        setSets(initialSets);
      } catch (error) {
        console.error(error);
        alert(t("workoutSessionGenericError"));
      } finally {
        setLoading(false);
      }
    }

    loadWorkout();
  }, [planId, t]);

  // Workout duration timer
  useEffect(() => {
    if (startedAt === null) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - startedAt) / 1000
      );

      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  // Rest timer
  useEffect(() => {
    if (!restRunning) return;

    const interval = setInterval(() => {
      setRestSeconds((current) => {
        if (current <= 1) {
          setRestRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restRunning]);

  function formatTime(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => twoDigitFormat.format(value))
      .join(":");
  }

  function startRestTimer(seconds = 90) {
    setRestSeconds(seconds);
    setRestRunning(true);
  }

  function addRestTime(seconds: number) {
    setRestSeconds((current) =>
      Math.max(0, current + seconds)
    );
  }

  function resetRestTimer() {
    setRestSeconds(0);
    setRestRunning(false);
  }

  async function startWorkout() {
    if (!plan) return;

    setStarting(true);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutPlanId: plan.id,
          name: plan.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || t("workoutSessionStartFailed"));
        return;
      }

      setWorkoutId(data.id);

      if (data.startedAt) {
        setStartedAt(
          new Date(data.startedAt).getTime()
        );
      } else {
        setStartedAt(Date.now());
      }
    } catch (error) {
      console.error(error);
      alert(t("workoutSessionGenericError"));
    } finally {
      setStarting(false);
    }
  }

  function updateSet(
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) {
    setSets((current) => {
      const exerciseSets = [
        ...(current[exerciseId] ?? []),
      ];

      exerciseSets[setIndex] = {
        ...exerciseSets[setIndex],
        [field]: value,
      };

      return {
        ...current,
        [exerciseId]: exerciseSets,
      };
    });
  }

  async function completeSet(
    exercise: WorkoutExercise,
    setIndex: number
  ) {
    if (!workoutId) {
      alert(t("workoutSessionStartFirst"));
      return;
    }

    const currentSet =
      sets[exercise.id]?.[setIndex];

    if (!currentSet) return;

    const weight = Number(currentSet.weight);
    const reps = Number(currentSet.reps);

    if (!Number.isFinite(weight) || weight < 0) {
      alert(t("workoutSessionValidWeight"));
      return;
    }

    if (!Number.isInteger(reps) || reps < 1) {
      alert(t("workoutSessionValidReps"));
      return;
    }

    try {
      const response = await fetch(
        `/api/workouts/${workoutId}/sets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workoutExerciseId: exercise.id,
            setNumber: setIndex + 1,
            weight,
            reps,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || t("workoutSessionSaveSetFailed"));
        return;
      }

      setSets((current) => {
        const exerciseSets = [
          ...(current[exercise.id] ?? []),
        ];

        exerciseSets[setIndex] = {
          ...exerciseSets[setIndex],
          completed: true,
        };

        return {
          ...current,
          [exercise.id]: exerciseSets,
        };
      });

      // Start rest timer AFTER successfully saving the set
      startRestTimer(90);
    } catch (error) {
      console.error(error);
      alert(t("workoutSessionGenericError"));
    }
  }

  async function finishWorkout() {
    if (!workoutId) {
      alert(t("workoutSessionStartFirst"));
      return;
    }

    setFinishing(true);

    try {
      const response = await fetch(
        `/api/workouts/${workoutId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "COMPLETED",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || t("workoutSessionFinishFailed"));
        return;
      }

      router.push("/workouts");
    } catch (error) {
      console.error(error);
      alert(t("workoutSessionGenericError"));
    } finally {
      setFinishing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-zinc-500">
          {t("workoutSessionLoading")}
        </p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <Link
          href="/workouts"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-950"
        >
          <ArrowLeft size={17} className={isRTL ? "rotate-180" : ""} />
          {t("workoutSessionBackToWorkouts")}
        </Link>

        <div className="rounded-2xl border border-dashed p-12 text-center">
          <h1 className="text-xl font-semibold">
            {t("workoutSessionNotFound")}
          </h1>
        </div>
      </div>
    );
  }

  const completedSets = Object.values(sets)
    .flat()
    .filter((set) => set.completed).length;

  const totalSets = Object.values(sets).flat().length;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto max-w-4xl space-y-8"
    >

      {/* Header */}
      <div>
        <Link
          href={`/workouts/${plan.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
        >
          <ArrowLeft size={17} className={isRTL ? "rotate-180" : ""} />
          {t("workoutSessionBackToWorkout")}
        </Link>

        <div className="mt-5">
          <p className="text-sm font-medium text-zinc-500">
            {t("workoutSessionTitle")}
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {translateWorkoutPlanName(plan.name, language)}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {numberFormat.format(completedSets)} / {numberFormat.format(totalSets)} {t("workoutSessionSetsCompleted")}
          </p>

          {/* Workout Timer */}
          <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                {t("workoutSessionWorkoutTime")}
              </p>

              <p className="mt-1 font-mono text-lg font-semibold">
                {formatTime(elapsedSeconds)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Workout */}
      {!workoutId && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">
            {t("workoutSessionReadyToTrain")}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {t("workoutSessionStartDescription")}
          </p>

          <button
            type="button"
            onClick={startWorkout}
            disabled={starting}
            className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting
              ? t("workoutSessionStarting")
              : t("workoutSessionStartWorkout")}
          </button>
        </div>
      )}

      {/* Rest Timer */}
      {workoutId && restSeconds > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                {t("workoutSessionRestTimer")}
              </p>

              <p className="mt-1 font-mono text-3xl font-bold">
                {formatTime(restSeconds)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={() => addRestTime(-30)}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {t("workoutSessionSubtractThirtySeconds")}
              </button>

              <button
                type="button"
                onClick={() =>
                  setRestRunning((current) => !current)
                }
                className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                {restRunning ? t("workoutSessionPause") : t("workoutSessionStart")}
              </button>

              <button
                type="button"
                onClick={() =>
                  addRestTime(30)
                }
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {t("workoutSessionAddThirtySeconds")}
              </button>

              <button
                type="button"
                onClick={resetRestTimer}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {t("workoutSessionReset")}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-6">

        {plan.days.map((day) => (
          <section key={day.id}>

            <div className="mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                {t("workoutSessionDay")} {numberFormat.format(day.dayNumber)}
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                {translateWorkoutDayName(day.name, language)}
              </h2>
            </div>

            <div className="space-y-4">

              {day.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >

                  {/* Exercise Header */}
                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <Dumbbell size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {translateExerciseName(exercise.exercise.name, language)}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {numberFormat.format(exercise.targetSets ?? 3)} {t("workoutSessionSetsUnit")} ×{" "}
                        {numberFormat.format(exercise.targetReps ?? 10)} {t("workoutSessionRepsUnit")}
                      </p>
                    </div>

                  </div>

                  {/* Sets */}
                  <div className="mt-5 space-y-3">

                    {(sets[exercise.id] ?? []).map(
                      (set, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[40px_1fr_1fr_auto] items-center gap-3"
                        >

                          <span className="text-sm font-medium text-zinc-500">
                            {index + 1}
                          </span>

                          {/* Weight */}
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weight}
                            onChange={(event) =>
                              updateSet(
                                exercise.id,
                                index,
                                "weight",
                                event.target.value
                              )
                            }
                            placeholder={t("workoutSessionWeightPlaceholder")}
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                          />

                          {/* Reps */}
                          <input
                            type="number"
                            min="1"
                            value={set.reps}
                            onChange={(event) =>
                              updateSet(
                                exercise.id,
                                index,
                                "reps",
                                event.target.value
                              )
                            }
                            placeholder={t("workoutSessionRepsPlaceholder")}
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                          />

                          {/* Complete */}
                          <button
                            type="button"
                            onClick={() =>
                              completeSet(
                                exercise,
                                index
                              )
                            }
                            disabled={!workoutId}
                            className="flex h-11 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check size={16} />

                            {set.completed
                              ? t("workoutSessionDone")
                              : t("workoutSessionComplete")}
                          </button>

                        </div>
                      )
                    )}

                  </div>
                </div>
              ))}

            </div>
          </section>
        ))}

      </div>

      {/* Finish Workout */}
      {workoutId && (
        <div className="sticky bottom-4">

          <button
            type="button"
            onClick={finishWorkout}
            disabled={finishing}
            className="w-full rounded-2xl bg-black px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {finishing
              ? t("workoutSessionFinishing")
              : t("workoutSessionFinishWorkout")}
          </button>

        </div>
      )}

    </div>
  );
}
