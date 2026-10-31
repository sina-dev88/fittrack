"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type Exercise = {
  id: string;
  name: string;
  primaryMuscle: string;
};

type Props = {
  planId: string;
  dayId: string;
  exercises: Exercise[];
};

export default function AddExerciseForm({
  planId,
  dayId,
  exercises,
}: Props) {
  const router = useRouter();

  const [exerciseId, setExerciseId] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!exerciseId) {
      alert("Please select an exercise.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/workout-plans/${planId}/exercises`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workoutDayId: dayId,
            exerciseId,
            targetSets: sets,
            targetReps: reps,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to add exercise.");
        return;
      }

      setExerciseId("");
      setSets("3");
      setReps("10");

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="grid gap-3 md:grid-cols-[1fr_100px_100px_auto]">
        <select
          value={exerciseId}
          onChange={(event) =>
            setExerciseId(event.target.value)
          }
          className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
        >
          <option value="">Select exercise</option>

          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name} — {exercise.primaryMuscle}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={sets}
          onChange={(event) => setSets(event.target.value)}
          placeholder="Sets"
          className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
        />

        <input
          type="number"
          min="1"
          value={reps}
          onChange={(event) => setReps(event.target.value)}
          placeholder="Reps"
          className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
        />

        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          <Plus size={17} />
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}