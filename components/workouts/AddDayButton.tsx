"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  planId: string;
};

export default function AddDayButton({ planId }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!name.trim()) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/workout-plans/${planId}/days`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add day.");
      }

      setName("");
      setOpen(false);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add day.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        <Plus size={17} />
        Add Day
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAdd();
          }

          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Day name"
        className="h-10 w-40 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
      />

      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-medium !text-white disabled:opacity-50 dark:bg-white dark:!text-zinc-950"
      >
        {loading ? "Adding..." : "Add"}
      </button>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="h-10 rounded-xl px-3 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        Cancel
      </button>
    </div>
  );
}
