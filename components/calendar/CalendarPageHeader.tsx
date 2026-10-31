"use client";

import { useLanguage } from "@/components/language/LanguageProvider";

export default function CalendarPageHeader() {
  const { t, isRTL } = useLanguage();

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {t("historyTrainingLabel")}
      </p>

      <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
        {t("calendar")}
      </h1>

      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {t("calendarPageDescription")}
      </p>
    </div>
  );
}