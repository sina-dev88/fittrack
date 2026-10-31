"use client";
import { useLanguage } from "@/components/language/LanguageProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Home,
  Moon,
  History,
  Settings,
  Sparkles,
  Trophy,
  Utensils,
  User,
  Accessibility,
} from "lucide-react";

const navigation = [
  { name: "dashboard", href: "/dashboard", icon: Home },
  { name: "profile", href: "/profile", icon: User },
  { name: "workouts", href: "/workouts", icon: Dumbbell },
  { name: "exercises", href: "/exercises", icon: BarChart3 },
  { name: "anatomy", href: "/anatomy", icon: Accessibility },
  { name: "progress", href: "/progress", icon: BarChart3 },
  { name: "history", href: "/history", icon: History },
  { name: "calendar", href: "/calendar", icon: CalendarDays },
  { name: "nutrition", href: "/nutrition", icon: Utensils },
  { name: "sleep", href: "/sleep", icon: Moon },
  { name: "habits", href: "/habits", icon: CheckCircle2 },
  { name: "achievements", href: "/achievements", icon: Trophy },
  { name: "aiCoach", href: "/ai-coach", icon: Sparkles },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { t, isRTL } = useLanguage();

  return (
    <aside
      className={`sticky top-0 hidden h-screen w-64 shrink-0 self-start bg-white lg:flex lg:flex-col dark:bg-zinc-950 ${
        isRTL
          ? "border-l border-zinc-200 dark:border-zinc-800"
          : "border-r border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {/* Logo */}
      <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-zinc-200 px-5 dark:border-zinc-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
          <Dumbbell size={19} />
        </div>

        <span className="text-xl font-bold tracking-tight">FitTrack</span>
      </div>

      {/* Scrollable Navigation */}
      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#a1a1aa transparent",
        }}
      >
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                }`}
              >
                <Icon size={19} className="shrink-0" />

                <span className="truncate">{t(item.name)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="shrink-0 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <Link
          href="/settings"
          prefetch={true}
          className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            pathname === "/settings" || pathname.startsWith("/settings/")
              ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
          }`}
        >
          <Settings size={19} className="shrink-0" />

          <span>{t("settings")}</span>
        </Link>
      </div>
    </aside>
  );
}
