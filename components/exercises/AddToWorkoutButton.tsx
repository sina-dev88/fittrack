"use client";

import { useEffect, useState } from "react";
import { Check, Dumbbell, X } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

type WorkoutPlan = {
  id: string;
  name: string;
  days: {
    id: string;
    name: string;
    dayNumber: number;
  }[];
};

type Props = {
  exerciseId: string;
};

export default function AddToWorkoutButton({
  exerciseId,
}: Props) {
  const { t, isRTL, language } = useLanguage();

  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const [targetSets, setTargetSets] = useState("3");
  const [targetReps, setTargetReps] = useState("10");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const numberFormat = new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : "en-US",
  );

  function localizedApiError(
    value: unknown,
    fallbackKey: TranslationKey,
  ) {
    if (typeof value !== "string" || !value.trim()) {
      return t(fallbackKey);
    }

    // Preserve server-provided detail in English; avoid exposing English
    // server messages in the Persian interface unless already localized.
    if (language === "en") return value;
    return /[\u0600-\u06FF]/.test(value) ? value : t(fallbackKey);
  }

  useEffect(() => {
    if (!open) return;

    async function loadPlans() {
      try {
        setPlansLoading(true);
        setError("");

        const response = await fetch("/api/workout-plans");

        if (!response.ok) {
          throw new Error("Failed to load workout plans.");
        }

        const data = await response.json();
        setPlans(data);

        if (data.length > 0) {
          setSelectedPlan(data[0].id);

          if (data[0].days?.length > 0) {
            setSelectedDay(data[0].days[0].id);
          } else {
            setSelectedDay("");
          }
        } else {
          setSelectedPlan("");
          setSelectedDay("");
        }
      } catch (error) {
        console.error(error);
        setError(t("addToWorkoutLoadError"));
      } finally {
        setPlansLoading(false);
      }
    }

    void loadPlans();
    // Load the user's plans only when this dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const currentPlan = plans.find((plan) => plan.id === selectedPlan);

  function handlePlanChange(planId: string) {
    setSelectedPlan(planId);

    const plan = plans.find((item) => item.id === planId);

    if (plan?.days?.length) {
      setSelectedDay(plan.days[0].id);
    } else {
      setSelectedDay("");
    }
  }

  async function handleAdd() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!selectedPlan || !selectedDay) {
        setError(t("addToWorkoutSelectPlanDayError"));
        return;
      }

      const sets = Number(targetSets);
      const reps = Number(targetReps);

      if (!Number.isInteger(sets) || sets < 1 || sets > 100) {
        setError(t("addToWorkoutSetsRangeError"));
        return;
      }

      if (!Number.isInteger(reps) || reps < 1 || reps > 1000) {
        setError(t("addToWorkoutRepsRangeError"));
        return;
      }

      const response = await fetch(
        `/api/workout-plans/${selectedPlan}/exercises`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workoutDayId: selectedDay,
            exerciseId,
            targetSets: sets,
            targetReps: reps,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        // Preserve the API's specific error message when available.
        setError(localizedApiError(data.error, "addToWorkoutFailed"));
        return;
      }

      setMessage(t("addToWorkoutSuccess"));

      setTimeout(() => {
        setOpen(false);
        setMessage("");
      }, 1000);
    } catch (error) {
      console.error(error);
      setError(t("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMessage("");
          setError("");
        }}
        className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        <Dumbbell size={17} />
        {t("addToWorkoutButtonLabel")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-to-workout-title"
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="add-to-workout-title"
                  className="text-xl font-semibold text-zinc-950 dark:text-white"
                >
                  {t("addToWorkoutDialogTitle")}
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {t("addToWorkoutDialogDescription")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("addToWorkoutClose")}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {plansLoading ? (
              <div className="mt-8 space-y-4" aria-label={t("addToWorkoutLoadingPlans")}>
                <div className="h-11 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-11 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-11 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ) : plans.length === 0 ? (
              <div className="mt-8 rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
                <Dumbbell className="mx-auto text-zinc-400" size={28} />

                {error ? (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                    {error}
                  </p>
                ) : (
                  <p className="mt-3 text-sm font-medium text-zinc-950 dark:text-white">
                    {t("addToWorkoutNoPlans")}
                  </p>
                )}

                {!error && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t("addToWorkoutCreatePlanFirst")}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium" htmlFor="workout-plan-select">
                    {t("addToWorkoutPlanLabel")}
                  </label>

                  <select
                    id="workout-plan-select"
                    value={selectedPlan}
                    onChange={(event) => handlePlanChange(event.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" htmlFor="workout-day-select">
                    {t("addToWorkoutDayLabel")}
                  </label>

                  <select
                    id="workout-day-select"
                    value={selectedDay}
                    onChange={(event) => setSelectedDay(event.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    {currentPlan?.days.map((day) => (
                      <option key={day.id} value={day.id}>
                        {t("addToWorkoutDayNumber")} {numberFormat.format(day.dayNumber)} — {day.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium" htmlFor="target-sets">
                      {t("addToWorkoutTargetSets")}
                    </label>

                    <input
                      id="target-sets"
                      type="number"
                      min="1"
                      max="100"
                      value={targetSets}
                      onChange={(event) => setTargetSets(event.target.value)}
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium" htmlFor="target-reps">
                      {t("addToWorkoutTargetReps")}
                    </label>

                    <input
                      id="target-reps"
                      type="number"
                      min="1"
                      max="1000"
                      value={targetReps}
                      onChange={(event) => setTargetReps(event.target.value)}
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400" role="alert">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" role="status">
                    <Check size={17} />
                    {message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={loading}
                  className="h-11 w-full rounded-xl bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {loading
                    ? t("addToWorkoutAdding")
                    : t("addToWorkoutSubmit")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

