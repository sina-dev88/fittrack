
"use client";

import { useLanguage } from "@/components/language/LanguageProvider";

export default function ProfileHeader() {
  const { t, isRTL } = useLanguage();

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("profileTitle")}
      </h1>

      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {t("profileDescription")}
      </p>
    </div>
  );
}
