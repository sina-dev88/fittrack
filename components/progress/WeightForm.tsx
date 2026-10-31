"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";

export default function WeightForm() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  const [isPending, startTransition] = useTransition();
  const [weight, setWeight] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const parsedWeight = Number(weight);

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      window.alert(t("invalidWeight"));
      return;
    }

    try {
      const response = await fetch("/api/progress/weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: parsedWeight,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.error || t("failedSaveWeight"));
        return;
      }

      setWeight("");

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      window.alert(t("somethingWentWrong"));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      dir={isRTL ? "rtl" : "ltr"}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <input
        type="number"
        step="0.1"
        min="1"
        value={weight}
        onChange={(event) => setWeight(event.target.value)}
        placeholder={t("enterWeight")}
        aria-label={t("enterWeight")}
        disabled={isPending}
        className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-zinc-400 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
      />

      <button
        type="submit"
        disabled={isPending || !weight}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <Plus size={17} />

        {isPending ? t("updating") : t("addWeight")}
      </button>
    </form>
  );
}