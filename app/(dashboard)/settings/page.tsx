"use client";

import { Languages, Palette, Check } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    {
      value: "en" as const,
      label: t("english"),
      description: t("languageEnglishDescription"),
      badge: "EN",
    },
    {
      value: "fa" as const,
      label: t("persian"),
      description: t("languagePersianDescription"),
      badge: "FA",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          FitTrack
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {t("settingsTitle")}
        </h1>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t("settingsDescription")}
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            {t("general")}
          </h2>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Languages size={21} />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="font-semibold text-zinc-950 dark:text-white">
                {t("language")}
              </h3>

              <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {t("languageDescription")}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {languages.map((item) => {
              const selected = language === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLanguage(item.value)}
                  aria-pressed={selected}
                  className={`flex min-h-24 items-center gap-3 rounded-xl border p-4 text-start transition ${
                    selected
                      ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900 dark:border-zinc-100 dark:bg-zinc-800/70 dark:ring-zinc-100"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
                    {item.badge}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-zinc-950 dark:text-white">
                      {item.label}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      {item.description}
                    </span>
                  </span>

                  {selected && (
                    <Check
                      size={18}
                      className="shrink-0 text-zinc-950 dark:text-white"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            {t("languageUpdated")}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
          {t("appearance")}
        </h2>

        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Palette size={21} />
            </div>

            <div>
              <h3 className="font-semibold text-zinc-950 dark:text-white">
                {t("appearance")}
              </h3>

              <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {t("appearanceDescription")}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </section>

      <p className="pb-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        {t("aboutDescription")}
      </p>
    </div>
  );
}