"use client";

import { Sparkles, Bot } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";

export default function AICoachPage() {
  const { t, isRTL } = useLanguage();

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center"
    >
      <div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
          <Bot size={38} />
        </div>

        <div className="mt-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
            <Sparkles size={14} />
            {t("aiCoachComingSoon")}
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {t("aiCoachTitle")}
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            {t("aiCoachDescription")}
          </p>

          <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
            <Sparkles size={16} className="shrink-0" />
            {t("aiCoachMessage")}
          </div>
        </div>
      </div>
    </main>
  );
}