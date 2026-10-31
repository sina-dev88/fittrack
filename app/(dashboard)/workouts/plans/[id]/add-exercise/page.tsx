"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  Plus,
  Search,
} from "lucide-react";

type Day = {
  id: string;
  name: string;
  dayNumber: number;
};

type Plan = {
  id: string;
  name: string;
  days: Day[];
};

type Exercise = {
  id: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string | null;
  equipment: string | null;
  difficulty: string | null;
};

export default function AddExercisePage() {
  const params = useParams();
  const router = useRouter();

  const planId = String(params.id);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");

  const [targetSets, setTargetSets] = useState("3");
  const [targetReps, setTargetReps] = useState("10");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [planResponse, exercisesResponse] =
          await Promise.all([
            fetch(`/api/workout-plans/${planId}`),
            fetch("/api/exercises"),
          ]);

        const planData = await planResponse.json();
        const exercisesData = await exercisesResponse.json();

        if (!planResponse.ok) {
          throw new Error(
            planData.error || "Failed to load workout plan."
          );
        }

        if (!exercisesResponse.ok) {
          throw new Error(
            exercisesData.error || "Failed to load exercises."
          );
        }

        setPlan(planData);
        setExercises(exercisesData);

        if (planData.days.length > 0) {
          setSelectedDay(planData.days[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [planId]);

  const filteredExercises = exercises.filter((exercise) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      exercise.name.toLowerCase().includes(query) ||
      exercise.primaryMuscle
        .toLowerCase()
        .includes(query) ||
      exercise.equipment
        ?.toLowerCase()
        .includes(query)
    );
  });

  async function handleAddExercise() {
    if (!selectedDay || !selectedExercise) {
      setError("Please select a workout day and exercise.");
      return;
    }

    const sets = Number(targetSets);
    const reps = Number(targetReps);

    if (
      !Number.isInteger(sets) ||
      sets < 1 ||
      sets > 100
    ) {
      setError("Sets must be between 1 and 100.");
      return;
    }

    if (
      !Number.isInteger(reps) ||
      reps < 1 ||
      reps > 1000
    ) {
      setError("Reps must be between 1 and 1000.");
      return;
    }

    try {
      setAdding(true);
      setError("");

      const response = await fetch(
        `/api/workout-plans/${planId}/exercises`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workoutDayId: selectedDay,
            exerciseId: selectedExercise,
            targetSets: sets,
            targetReps: reps,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add exercise."
        );
      }

      router.push(`/workouts/plans/${planId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add exercise."
      );
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-6 h-96 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-red-500">
          {error || "Workout plan not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/workouts/plans/${plan.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950 dark:hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to {plan.name}
        </Link>

        <div className="mt-5 flex items-center gap-3">
          <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
            <Dumbbell size={22} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Add Exercise
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Add an exercise to your workout plan.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Day */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Workout Day
          </label>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
          >
            {plan.days.map((day) => (
              <option key={day.id} value={day.id}>
                Day {day.dayNumber} — {day.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Search Exercise
          </label>

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by exercise or muscle..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        {/* Exercises */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Exercise
          </label>

          <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 p-2 dark:border-zinc-700">
            {filteredExercises.length === 0 ? (
              <p className="p-6 text-center text-sm text-zinc-500">
                No exercises found.
              </p>
            ) : (
              filteredExercises.map((exercise) => {
                const isSelected =
                  selectedExercise === exercise.id;

                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() =>
                      setSelectedExercise(exercise.id)
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-zinc-950 bg-zinc-100 dark:border-white dark:bg-zinc-800"
                        : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-zinc-950 dark:text-white">
                          {exercise.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {exercise.primaryMuscle}
                          {exercise.equipment &&
                            ` • ${exercise.equipment}`}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 text-xs text-white dark:bg-white dark:text-zinc-950">
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Sets / Reps */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Target Sets
            </label>

            <input
              type="number"
              min={1}
              max={100}
              value={targetSets}
              onChange={(e) =>
                setTargetSets(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Target Reps
            </label>

            <input
              type="number"
              min={1}
              max={1000}
              value={targetReps}
              onChange={(e) =>
                setTargetReps(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <Link
            href={`/workouts/plans/${plan.id}`}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleAddExercise}
            disabled={adding}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-medium !text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:!text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Plus size={17} />
            {adding ? "Adding..." : "Add Exercise"}
          </button>
        </div>
      </div>
    </div>
  );
}
