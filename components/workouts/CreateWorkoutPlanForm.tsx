"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Dumbbell } from "lucide-react";
import Link from "next/link";

export default function CreateWorkoutPlanForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Workout plan name is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/workout-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to create workout plan."
        );
        return;
      }

      router.push(`/workouts/plans/${data.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
          <Dumbbell size={22} />
        </div>

        <div>
          <h2 className="font-semibold">
            New Training Plan
          </h2>

          <p className="text-sm text-zinc-500">
            You can add workout days and exercises next.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium"
        >
          Plan Name
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="e.g. Push Pull Legs"
          maxLength={100}
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium"
        >
          Description
          <span className="ml-1 text-zinc-400">
            (optional)
          </span>
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Describe your training plan..."
          maxLength={500}
          rows={4}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          href="/workouts"
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ArrowLeft size={17} />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl bg-zinc-950 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {loading ? "Creating..." : "Create Plan"}
        </button>
      </div>
    </form>
  );
}
