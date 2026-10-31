"use client";

import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  planId: string;
  workoutExerciseId: string;
  currentSets: number | null;
  currentReps: number | null;
};

export default function EditExerciseButton({
  planId,
  workoutExerciseId,
  currentSets,
  currentReps,
}: Props) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [sets, setSets] = useState(String(currentSets ?? 3));
  const [reps, setReps] = useState(String(currentReps ?? 10));
  const [loading, setLoading] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  async function handleSave() {
    const parsedSets = Number(sets);
    const parsedReps = Number(reps);

    if (!Number.isInteger(parsedSets) || parsedSets < 1) {
      alert("Sets must be at least 1.");
      return;
    }

    if (!Number.isInteger(parsedReps) || parsedReps < 1) {
      alert("Reps must be at least 1.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/workout-plans/${planId}/exercises/${workoutExerciseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetSets: parsedSets,
            targetReps: parsedReps,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update exercise.");
        return;
      }

      setIsEditing(false);

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        title="Edit exercise"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white"
      >
        <Pencil size={17} />
      </button>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <input
        type="number"
        min="1"
        value={sets}
        onChange={(event) => setSets(event.target.value)}
        className="h-9 w-16 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-center text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
        aria-label="Sets"
      />

      <span className="text-sm text-zinc-400">×</span>

      <input
        type="number"
        min="1"
        value={reps}
        onChange={(event) => setReps(event.target.value)}
        className="h-9 w-16 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-center text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
        aria-label="Reps"
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={loading || isRefreshing}
        className="h-9 rounded-lg bg-zinc-900 px-3 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading || isRefreshing ? "..." : "Save"}
      </button>

      <button
        type="button"
        onClick={() => setIsEditing(false)}
        disabled={loading}
        title="Cancel"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white"
      >
        <X size={17} />
      </button>
    </div>
  );
}
