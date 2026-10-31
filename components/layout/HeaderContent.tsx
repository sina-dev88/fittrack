"use client";

import { Search } from "lucide-react";
import NotificationBell from "@/components/layout/NotificationBell";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useLanguage } from "@/components/language/LanguageProvider";

type HeaderContentProps = {
  name: string;
  email: string;
};

export default function HeaderContent({
  name,
  email,
}: HeaderContentProps) {
  const { t, isRTL } = useLanguage();

  const initial = name.charAt(0).toLocaleUpperCase();

  return (
    <header
      className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6"
    >
      {/* Search */}
      <div className="relative hidden w-full max-w-sm md:block">
        <Search
          size={18}
          className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 ${
            isRTL ? "right-3" : "left-3"
          }`}
        />

        <input
          type="search"
          placeholder={t("search")}
          aria-label={t("search")}
          className={`h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-600 ${
            isRTL ? "pl-4 pr-10" : "pl-10 pr-4"
          }`}
        />
      </div>

      {/* Actions and user */}
      <div className="ms-auto flex items-center gap-2 sm:gap-4">
        <ThemeToggle />

        <NotificationBell />

        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`hidden min-w-0 sm:block ${
              isRTL ? "text-start" : "text-end"
            }`}
          >
            <p className="max-w-40 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {name || t("athlete")}
            </p>

            <p className="max-w-40 truncate text-xs text-zinc-500 dark:text-zinc-400">
              {email}
            </p>
          </div>

          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
            aria-label={name || t("athlete")}
            title={name || t("athlete")}
          >
            {initial || t("athlete").charAt(0)}
          </div>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}