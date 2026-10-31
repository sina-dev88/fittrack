
"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  Dumbbell,
  History,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Trophy,
  Utensils,
} from "lucide-react";

import FAQ from "@/components/home/FAQ";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useLanguage } from "@/components/language/LanguageProvider";

type HomePageContentProps = {
  isLoggedIn: boolean;
  currentYear: number;
};

const featureItems = [
  {
    id: "workout",
    icon: Dumbbell,
    title: "homeFeatureWorkoutTitle",
    description: "homeFeatureWorkoutDescription",
    href: "/workouts",
    label: "homeFeatureWorkoutAction",
  },
  {
    id: "progress",
    icon: BarChart3,
    title: "homeFeatureProgressTitle",
    description: "homeFeatureProgressDescription",
    href: "/progress",
    label: "homeFeatureProgressAction",
  },
  {
    id: "coach",
    icon: Sparkles,
    title: "homeFeatureCoachTitle",
    description: "homeFeatureCoachDescription",
    href: "/ai-coach",
    label: "homeFeatureCoachAction",
  },
  {
    id: "achievements",
    icon: Trophy,
    title: "homeFeatureAchievementsTitle",
    description: "homeFeatureAchievementsDescription",
    href: "/achievements",
    label: "homeFeatureAchievementsAction",
  },
  {
    id: "sleep",
    icon: Moon,
    title: "homeFeatureSleepTitle",
    description: "homeFeatureSleepDescription",
    href: "/sleep",
    label: "homeFeatureSleepAction",
  },
  {
    id: "nutrition",
    icon: Utensils,
    title: "homeFeatureNutritionTitle",
    description: "homeFeatureNutritionDescription",
    href: "/nutrition",
    label: "homeFeatureNutritionAction",
  },
] as const;

const quickLinkItems = [
  {
    label: "homeQuickWorkoutPlans",
    href: "/workouts",
    icon: Dumbbell,
  },
  {
    label: "homeQuickExerciseLibrary",
    href: "/exercises",
    icon: Sparkles,
  },
  {
    label: "homeQuickCalendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "homeQuickHistory",
    href: "/history",
    icon: History,
  },
] as const;

export default function HomePageContent({
  isLoggedIn,
  currentYear,
}: HomePageContentProps) {
  const { t, isRTL } = useLanguage();

  const primaryHref = isLoggedIn ? "/dashboard" : "/register";
  const arrowDirection = isRTL ? "rotate-180" : "";

  const mobileLinks = [
    { label: t("homeNavDashboard"), href: "/dashboard" },
    { label: t("homeNavWorkouts"), href: "/workouts" },
    { label: t("homeNavWorkoutPlans"), href: "/workouts" },
    { label: t("homeNavExercises"), href: "/exercises" },
    { label: t("homeNavProgress"), href: "/progress" },
    { label: t("homeNavSleep"), href: "/sleep" },
    { label: t("homeNavNutrition"), href: "/nutrition" },
    { label: t("homeNavAchievements"), href: "/achievements" },
    { label: t("homeNavCalendar"), href: "/calendar" },
    { label: t("homeNavHistory"), href: "/history" },
    { label: t("homeNavCoach"), href: "/ai-coach" },
    { label: t("homeNavProfile"), href: "/profile" },
  ];

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white"
    >
      {/* Public navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Dumbbell size={19} />
            </span>
            <span className="text-xl font-bold tracking-tight">
              FitTrack
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              {t("homeNavFeatures")}
            </Link>

            <Link
              href="/workouts"
              className="text-sm text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              {t("homeNavWorkouts")}
            </Link>

            <Link
              href="/exercises"
              className="text-sm text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              {t("homeNavExercises")}
            </Link>

            <Link
              href="/progress"
              className="text-sm text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              {t("homeNavProgress")}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />

            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 sm:inline-flex dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {isLoggedIn
                ? t("homeNavDashboard")
                : t("homeNavLogin")}
            </Link>

            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm font-semibold !text-white transition hover:bg-zinc-700 dark:bg-white dark:!text-zinc-950 dark:hover:bg-zinc-200"
            >
              {isLoggedIn
                ? t("homeNavOpenApp")
                : t("homeNavGetStarted")}

              <ArrowRight
                size={15}
                className={arrowDirection}
              />
            </Link>

            <details className="relative md:hidden">
              <summary
                aria-label={t("homeNavOpenMenu")}
                className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <Menu size={20} />
              </summary>

              <nav className="absolute end-0 top-12 z-50 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                {mobileLinks.map((item, index) => (
                  <Link
                    key={`${item.href}-${index}`}
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </details>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-100/80 to-transparent dark:from-zinc-900/60" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div className="text-start">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <Sparkles size={15} />
              {t("homeHeroBadge")}
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.2] tracking-tight sm:text-6xl lg:text-7xl">
              {t("homeHeroTitle")}
              <span className="mt-2 block text-zinc-500 dark:text-zinc-400">
                {t("homeHeroSubtitle")}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600 sm:text-lg dark:text-zinc-400">
              {t("homeHeroDescription")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 py-3.5 font-semibold !text-white transition hover:bg-zinc-700 dark:bg-white dark:!text-zinc-950 dark:hover:bg-zinc-200"
              >
                {isLoggedIn
                  ? t("homeHeroDashboardAction")
                  : t("homeHeroStartAction")}

                <ArrowRight
                  size={18}
                  className={`transition-transform group-hover:translate-x-1 ${arrowDirection}`}
                />
              </Link>

              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-6 py-3.5 font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                {t("homeHeroFeaturesAction")}
                <ChevronRight
                  size={18}
                  className={arrowDirection}
                />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <Check size={16} />
                {t("homeHeroBenefitTracking")}
              </span>

              <span className="inline-flex items-center gap-2">
                <Check size={16} />
                {t("homeHeroBenefitProgress")}
              </span>

              <span className="inline-flex items-center gap-2">
                <Check size={16} />
                {t("homeHeroBenefitRecords")}
              </span>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2rem] bg-zinc-100 blur-2xl dark:bg-zinc-900" />

            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    FITTRACK
                  </p>
                  <h2 className="mt-1 font-semibold">
                    {t("homePreviewTitle")}
                  </h2>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <BarChart3 size={19} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
                <Link
                  href="/workouts"
                  className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                >
                  <Dumbbell size={19} className="text-zinc-500" />
                  <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {t("homePreviewTraining")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {t("homePreviewWorkoutPlans")}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {t("homePreviewBuildRoutine")}
                  </p>
                </Link>

                <Link
                  href="/progress"
                  className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                >
                  <BarChart3 size={19} className="text-zinc-500" />
                  <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {t("homePreviewAnalytics")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {t("homePreviewTrackProgress")}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {t("homePreviewReviewTrends")}
                  </p>
                </Link>

                <Link
                  href="/sleep"
                  className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                >
                  <Moon size={19} className="text-zinc-500" />
                  <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {t("homePreviewRecovery")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {t("homePreviewSleepHabits")}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {t("homePreviewConsistency")}
                  </p>
                </Link>

                <Link
                  href="/achievements"
                  className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                >
                  <Trophy size={19} className="text-zinc-500" />
                  <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {t("homePreviewMilestones")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {t("homePreviewAchievements")}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {t("homePreviewCelebrate")}
                  </p>
                </Link>
              </div>

              <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl bg-zinc-100 p-4 sm:mx-5 sm:mb-5 dark:bg-zinc-800/70">
                <ShieldCheck
                  size={21}
                  className="shrink-0 text-zinc-600 dark:text-zinc-300"
                />
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {t("homePreviewPersonalSpace")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature links */}
      <section
        id="features"
        className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              {t("homeFeaturesEyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("homeFeaturesTitle")}
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-zinc-600 dark:text-zinc-400">
              {t("homeFeaturesDescription")}
            </p>
          </div>

          <Link
            href={primaryHref}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold hover:underline"
          >
            {isLoggedIn
              ? t("homeFeaturesDashboardAction")
              : t("homeFeaturesAccountAction")}

            <ArrowRight
              size={16}
              className={arrowDirection}
            />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureItems.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.id}
                href={feature.href}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 text-start transition duration-200 hover:-translate-y-1 hover:border-zinc-400 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 transition group-hover:bg-zinc-200 dark:bg-zinc-800 dark:group-hover:bg-zinc-700">
                  <Icon size={21} />
                </div>

                <h3 className="flex items-center justify-between gap-3 text-lg font-semibold">
                  {t(feature.title)}

                  <ArrowRight
                    size={17}
                    className={`shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-950 dark:group-hover:text-white ${arrowDirection}`}
                  />
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {t(feature.description)}
                </p>

                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {t(feature.label)}
                  <ChevronRight
                    size={15}
                    className={arrowDirection}
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick navigation */}
      <section className="border-y border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold">
            {t("homeExploreTitle")}
          </h2>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t("homeExploreDescription")}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinkItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={19} className="text-zinc-500" />
                    <span className="text-sm font-medium">
                      {t(item.label)}
                    </span>
                  </span>

                  <ArrowRight
                    size={16}
                    className={`text-zinc-400 ${arrowDirection}`}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-semibold text-zinc-800 dark:text-zinc-200"
          >
            FitTrack
          </Link>

          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/login"
              className="hover:text-zinc-950 dark:hover:text-white"
            >
              {t("homeFooterLogin")}
            </Link>

            <Link
              href="/register"
              className="hover:text-zinc-950 dark:hover:text-white"
            >
              {t("homeFooterRegister")}
            </Link>

            <Link
              href="/dashboard"
              className="hover:text-zinc-950 dark:hover:text-white"
            >
              {t("homeFooterDashboard")}
            </Link>

            <Link
              href="/profile"
              className="hover:text-zinc-950 dark:hover:text-white"
            >
              {t("homeFooterProfile")}
            </Link>
          </nav>

          <span>© {currentYear} FitTrack</span>
        </div>
      </footer>
    </main>
  );
}
