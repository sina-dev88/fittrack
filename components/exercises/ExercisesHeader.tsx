"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";

export default function ExercisesHeader() {
  const { t, isRTL } = useLanguage();

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
    >
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {t("exerciseLibraryTitle")}
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {t("exercises")}
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {t("exercisesDescription")}
        </p>
      </div>

      <Link
        href="/exercises/favorites"
        className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
      >
        <Heart size={17} />
        <span>{t("favoritesLabel")}</span>
      </Link>
    </div>
  );
}