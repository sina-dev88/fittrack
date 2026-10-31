"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

const themes = [
  { value: "light", labelKey: "themeLight", Icon: Sun },
  { value: "dark", labelKey: "themeDark", Icon: Moon },
  { value: "system", labelKey: "themeSystem", Icon: Monitor },
] as const satisfies {
  value: "light" | "dark" | "system";
  labelKey: TranslationKey;
  Icon: typeof Sun;
}[];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t, isRTL } = useLanguage();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = themes.find(
    (item) => item.value === theme,
  );

  const CurrentIcon = currentTheme?.Icon ?? Monitor;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("changeAppearance")}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t("appearance")}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {mounted ? <CurrentIcon size={18} /> : <Monitor size={18} />}

        <span className="hidden text-sm sm:inline">
          {mounted && currentTheme
            ? t(currentTheme.labelKey)
            : t("appearance")}
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={t("closeAppearanceMenu")}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            role="menu"
            aria-label={t("appearanceOptions")}
            className={`absolute top-12 z-50 min-w-40 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 ${
              isRTL ? "left-0" : "right-0"
            }`}
          >
            {themes.map(({ value, labelKey, Icon }) => (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={mounted && theme === value}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  mounted && theme === value
                    ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon size={17} />

                <span>{t(labelKey)}</span>

                {mounted && theme === value && (
                  <span className="ms-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
