"use client";
import {
  translateExerciseName,
  translateExerciseLabel,
  translateWorkoutDayName,
} from "@/lib/i18n/exercise-labels";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Dumbbell,
  CalendarDays,
  MapPin,
  LoaderCircle,
  Check,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";
import { translateWorkoutPlanName } from "@/lib/i18n/exercise-labels";
type Exercise = {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  name: string;
  primaryMuscle: string;
  equipment: string | null;
};

type WorkoutDay = {
  name: string;
  dayNumber: number;
  exercises: Exercise[];
};

type Preview = {
  name: string;
  description: string;
  goal: string;
  experienceLevel: string;
  trainingDays: number;
  days: WorkoutDay[];
};

export default function NewWorkoutPage() {
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("MUSCLE_GAIN");
  const [experienceLevel, setExperienceLevel] = useState("BEGINNER");
  const [trainingDays, setTrainingDays] = useState("3");
  const [location, setLocation] = useState("GYM");

  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

 const planName = name.trim() || "My Training Plan";

  const numberFormatter = new Intl.NumberFormat(
    language === "fa" ? "fa-IR" : "en-US",
  );

  const formatNumber = (value: number) => numberFormatter.format(value);

  const fieldClass =
    "mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white";

  async function generatePreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setPreview(null);

    try {
      const response = await fetch("/api/workout-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "preview",
          name: planName,
          description,
          goal,
          experienceLevel,
          trainingDays: Number(trainingDays),
          location,
        }),
      });

      const data = await response.json();

      console.log("Workout preview:", data);

      if (!response.ok) {
        throw new Error(data.error || t("workoutGeneratorError"));
      }

      setPreview(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("workoutGeneratorConnectionError"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmPlan() {
    if (!preview) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/workout-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "confirm",
          name: planName,
          description: preview.description,
          days: preview.days.map((day) => ({
            name: day.name,
            exercises: day.exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              targetSets: exercise.targetSets,
              targetReps: exercise.targetReps,
            })),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("workoutGeneratorSaveError"));
      }

      router.push(`/workouts/plans/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("workoutGeneratorConnectionError"),
      );
    } finally {
      setSaving(false);
    }
  }

  function updateExercise(
    dayIndex: number,
    exerciseIndex: number,
    field: "targetSets" | "targetReps",
    value: number,
  ) {
    if (!preview) return;

    setPreview((current) => {
      if (!current) return current;

      return {
        ...current,
        days: current.days.map((day, dIndex) =>
          dIndex !== dayIndex
            ? day
            : {
                ...day,
                exercises: day.exercises.map((exercise, eIndex) =>
                  eIndex !== exerciseIndex
                    ? exercise
                    : { ...exercise, [field]: value },
                ),
              },
        ),
      };
    });
  }

  function removeExercise(dayIndex: number, exerciseIndex: number) {
    setPreview((current) => {
      if (!current) return current;

      return {
        ...current,
        days: current.days.map((day, dIndex) =>
          dIndex !== dayIndex
            ? day
            : {
                ...day,
                exercises: day.exercises
                  .filter((_, eIndex) => eIndex !== exerciseIndex)
                  .map((exercise, index) => ({
                    ...exercise,
                    order: index + 1,
                  })),
              },
        ),
      };
    });
  }

  const totalExercises =
    preview?.days.reduce((sum, day) => sum + day.exercises.length, 0) ?? 0;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto max-w-4xl space-y-8 pb-10"
    >
      <header>
        <Link
          href="/workouts"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-lime-600"
        >
          <ArrowLeft size={17} className={isRTL ? "rotate-180" : ""} />
          {t("workoutGeneratorBack")}
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-600 dark:text-lime-400">
            <Sparkles size={27} />
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("workoutGeneratorTitle")}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              {t("workoutGeneratorDescription")}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={generatePreview} className="space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Dumbbell size={19} className="text-lime-600 dark:text-lime-400" />

            <h2 className="text-lg font-semibold">
              {t("workoutGeneratorProfile")}
            </h2>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-start text-sm font-medium">
              {t("workoutGeneratorPlanName")}

              <input
                value={name || t("workoutGeneratorDefaultPlanName")}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
                className={fieldClass}
                placeholder={t("workoutGeneratorPlanNamePlaceholder")}
              />
            </label>

            <label className="text-start text-sm font-medium">
              {t("workoutGeneratorMainGoal")}

              <select
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                className={fieldClass}
              >
                <option value="MUSCLE_GAIN">
                  {t("workoutGeneratorMuscleGain")}
                </option>
                <option value="STRENGTH">
                  {t("workoutGeneratorStrength")}
                </option>
                <option value="FAT_LOSS">{t("workoutGeneratorFatLoss")}</option>
                <option value="GENERAL_FITNESS">
                  {t("workoutGeneratorGeneralFitness")}
                </option>
                <option value="MAINTENANCE">
                  {t("workoutGeneratorMaintenance")}
                </option>
                <option value="ENDURANCE">
                  {t("workoutGeneratorEndurance")}
                </option>
              </select>
            </label>

            <label className="text-start text-sm font-medium">
              {t("workoutGeneratorExperienceLevel")}

              <select
                value={experienceLevel}
                onChange={(event) => setExperienceLevel(event.target.value)}
                className={fieldClass}
              >
                <option value="BEGINNER">
                  {t("workoutGeneratorBeginner")}
                </option>
                <option value="INTERMEDIATE">
                  {t("workoutGeneratorIntermediate")}
                </option>
                <option value="ADVANCED">
                  {t("workoutGeneratorAdvanced")}
                </option>
              </select>
            </label>

            <label className="text-start text-sm font-medium">
              <span className="flex items-center gap-2">
                <CalendarDays size={16} />
                {t("workoutGeneratorTrainingDays")}
              </span>

              <select
                value={trainingDays}
                onChange={(event) => setTrainingDays(event.target.value)}
                className={fieldClass}
              >
                {[2, 3, 4, 5, 6].map((days) => (
                  <option key={days} value={days}>
                    {formatNumber(days)} {t("workoutGeneratorDaysUnit")}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-start text-sm font-medium sm:col-span-2">
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                {t("workoutGeneratorLocation")}
              </span>

              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={fieldClass}
              >
                <option value="GYM">{t("workoutGeneratorGym")}</option>
                <option value="HOME">{t("workoutGeneratorHome")}</option>
                <option value="BOTH">{t("workoutGeneratorBoth")}</option>
              </select>
            </label>

            <label className="text-start text-sm font-medium sm:col-span-2">
              {t("workoutGeneratorAdditionalNotes")}

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                maxLength={1000}
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-start text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-zinc-800 dark:bg-zinc-950"
                placeholder={t("workoutGeneratorNotesPlaceholder")}
              />
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading || saving}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 text-sm font-bold text-zinc-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}

          {loading
            ? t("workoutGeneratorGenerating")
            : t("workoutGeneratorGeneratePreview")}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {preview && (
        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-lime-600 dark:text-lime-400">
                {t("workoutGeneratorPreviewLabel")}
              </p>

              <h2 className="mt-1 text-2xl font-bold"> {translateWorkoutPlanName(planName, language)}</h2>

              <p className="mt-1 text-sm text-zinc-500">
                {formatNumber(preview.days.length)}{" "}
                {t("workoutGeneratorTrainingDaysUnit")}
                {" · "}
                {formatNumber(totalExercises)}{" "}
                {t("workoutGeneratorExercisesUnit")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPreview(null)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <RefreshCw size={16} />
              {t("workoutGeneratorChangeSettings")}
            </button>
          </div>

          {preview.days.map((day, dayIndex) => (
            <div
              key={`${day.dayNumber}-${day.name}`}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-5 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    {t("workoutGeneratorDay")} {formatNumber(day.dayNumber)}
                  </p>

                  <h3 className="mt-1 text-lg font-bold">
                    {translateWorkoutDayName(day.name, language)}
                  </h3>
                </div>

                <span className="shrink-0 rounded-lg bg-lime-400/15 px-3 py-1.5 text-xs font-semibold text-lime-700 dark:text-lime-400">
                  {formatNumber(day.exercises.length)}{" "}
                  {t("workoutGeneratorExercisesUnit")}
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {day.exercises.map((exercise, exerciseIndex) => (
                  <div
                    key={`${day.dayNumber}-${exercise.exerciseId}-${exerciseIndex}`}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold dark:bg-zinc-800">
                        {formatNumber(exerciseIndex + 1)}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold">
                          {translateExerciseName(exercise.name, language)}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {translateExerciseLabel(
                            exercise.primaryMuscle,
                            "muscle",
                            t,
                            language,
                          )}

                          {exercise.equipment
                            ? ` · ${translateExerciseLabel(
                                exercise.equipment,
                                "equipment",
                                t,
                                language,
                              )}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs text-zinc-500">
                        {t("workoutGeneratorSets")}

                        <select
                          value={exercise.targetSets}
                          onChange={(event) =>
                            updateExercise(
                              dayIndex,
                              exerciseIndex,
                              "targetSets",
                              Number(event.target.value),
                            )
                          }
                          className="mt-1 block h-10 w-20 rounded-lg border border-zinc-200 bg-white px-2 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                            <option key={value} value={value}>
                              {formatNumber(value)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs text-zinc-500">
                        {t("workoutGeneratorReps")}

                        <select
                          value={exercise.targetReps}
                          onChange={(event) =>
                            updateExercise(
                              dayIndex,
                              exerciseIndex,
                              "targetReps",
                              Number(event.target.value),
                            )
                          }
                          className="mt-1 block h-10 w-20 rounded-lg border border-zinc-200 bg-white px-2 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30].map(
                            (value) => (
                              <option key={value} value={value}>
                                {formatNumber(value)}
                              </option>
                            ),
                          )}
                        </select>
                      </label>

                      <button
                        type="button"
                        onClick={() => removeExercise(dayIndex, exerciseIndex)}
                        title={t("workoutGeneratorRemoveExercise")}
                        aria-label={t("workoutGeneratorRemoveExercise")}
                        className="mt-4 rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}

                {day.exercises.length === 0 && (
                  <p className="p-5 text-sm text-amber-600">
                    {t("workoutGeneratorEmptyDay")}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setPreview(null)}
              disabled={saving}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              {t("workoutGeneratorBackToSettings")}
            </button>

            <button
              type="button"
              onClick={confirmPlan}
              disabled={
                saving || preview.days.some((day) => day.exercises.length === 0)
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 text-sm font-bold text-zinc-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}

              {saving
                ? t("workoutGeneratorSaving")
                : t("workoutGeneratorConfirmSave")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
