"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Dumbbell,
  Home,
  Menu,
  CalendarDays,
  Moon,
  BookOpen,
  History,
  Apple,
  User,
  Sparkles,
  Settings,
  Trophy,
  X,
  CheckCircle2,
  Accessibility,
} from "lucide-react";

const mainNavigation = [
  { name: "home", href: "/dashboard", icon: Home },
  { name: "workout", href: "/workouts", icon: Dumbbell },
  { name: "sleep", href: "/sleep", icon: Moon },
  { name: "progress", href: "/progress", icon: BarChart3 },
] as const;

const moreNavigation = [
  { name: "calendar", href: "/calendar", icon: CalendarDays },
  { name: "exercises", href: "/exercises", icon: BookOpen },
  { name: "anatomy", href: "/anatomy", icon: Accessibility },
  { name: "history", href: "/history", icon: History },
  { name: "nutrition", href: "/nutrition", icon: Apple },
  { name: "habits", href: "/habits", icon: CheckCircle2 },
  { name: "achievements", href: "/achievements", icon: Trophy },
  { name: "profile", href: "/profile", icon: User },
  { name: "settings", href: "/settings", icon: Settings },
  { name: "aiCoach", href: "/ai-coach", icon: Sparkles },
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }

    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreOpen]);

  const isMoreActive = moreNavigation.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <>
      {/* More Menu */}
      {moreOpen && (
        <div
          ref={moreRef}
          className="fixed bottom-[72px] left-3 right-3 z-50 mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <div>
              <h3 className="text-sm font-semibold">{t("more")}</h3>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("moreFeatures")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {moreNavigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={t(item.name)}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                    isActive
                      ? "border-zinc-300 bg-zinc-100 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      : "border-zinc-100 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <span className="truncate text-sm font-medium">
                    {t(item.name)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur lg:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
          {mainNavigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={t(item.name)}
                href={item.href}
                className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${
                  isActive ? "text-zinc-950 dark:text-white" : "text-zinc-400"
                }`}
              >
                <Icon size={20} className="shrink-0" />

                <span className="truncate">{t(item.name)}</span>
              </Link>
            );
          })}

          {/* More */}
          <button
            type="button"
            onClick={() => setMoreOpen((value) => !value)}
            className={`flex h-full min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${
              moreOpen || isMoreActive
                ? "text-zinc-950 dark:text-white"
                : "text-zinc-400 dark:text-zinc-400"
            }`}
          >
            {moreOpen ? (
              <X size={20} className="shrink-0" />
            ) : (
              <Menu size={20} className="shrink-0" />
            )}
            <span className="truncate">{t("more")}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
