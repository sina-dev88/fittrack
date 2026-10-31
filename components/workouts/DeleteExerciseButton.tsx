"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  planId: string;
  workoutExerciseId: string;
};

export default function DeleteExerciseButton({
  planId,
  workoutExerciseId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Remove this exercise from the workout?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/workout-plans/${planId}/exercises/${workoutExerciseId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to remove exercise."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to remove exercise."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-950/30"
      title="Remove exercise"
    >
      <Trash2 size={16} />
    </button>
  );
}