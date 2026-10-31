
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Check,
  Filter,
  Lock,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";

type AchievementCategory =
  | "WORKOUT"
  | "STRENGTH"
  | "HABIT"
  | "CONSISTENCY"
  | "PROGRESS";

type Achievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  value: number;
  percentage: number;
  unlocked: boolean;
  unlockedAt: string | null;
  xp: number;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
};

type AchievementStats = {
  unlocked: number;
  total: number;
  completion: number;
  xp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  levelPercentage: number;
};

type FilterType = "ALL" | "UNLOCKED" | "LOCKED";

type AchievementsResponse = {
  achievements: Achievement[];
  stats: AchievementStats;
};

const categoryIcons: Record<AchievementCategory, string> = {
  WORKOUT: "🏋️",
  STRENGTH: "💪",
  HABIT: "🎯",
  CONSISTENCY: "📅",
  PROGRESS: "📈",
};

function formatUnlockedDate(
  value: string | null,
  language: "en" | "fa",
) {
  if (!value) return "";

  return new Intl.DateTimeFormat(
    language === "fa" ? "fa-IR-u-ca-persian" : "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(new Date(value));
}

export default function AchievementsDashboard() {
  const { t, isRTL, language } = useLanguage();

  const categoryLabels: Record<AchievementCategory, string> = {
    WORKOUT: t("achievementsWorkouts"),
    STRENGTH: t("achievementsStrength"),
    HABIT: t("achievementsHabits"),
    CONSISTENCY: t("achievementsConsistency"),
    PROGRESS: t("achievementsProgress"),
  };

  const rarityLabels = {
    COMMON: t("achievementsCommon"),
    RARE: t("achievementsRare"),
    EPIC: t("achievementsEpic"),
    LEGENDARY: t("achievementsLegendary"),
  } as const;

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    unlocked: 0,
    total: 0,
    completion: 0,
    xp: 0,
    level: 1,
    currentLevelXp: 0,
    nextLevelXp: 500,
    levelPercentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [category, setCategory] = useState<AchievementCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadAchievements() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/achievements");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof result.error === "string"
              ? result.error
              : t("achievementsLoadError"),
          );
        }

        const data = result as AchievementsResponse;

        setAchievements(data.achievements);

        if (data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to load achievements:", error);

        setError(
          error instanceof Error
            ? error.message
            : t("achievementsLoadError"),
        );
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, [t]);

  const unlockedCount = achievements.filter(
    (item) => item.unlocked,
  ).length;

  const totalCount = achievements.length;

  const completion =
    totalCount === 0
      ? 0
      : Math.round((unlockedCount / totalCount) * 100);

  const recentAchievements = useMemo(() => {
    return achievements
      .filter((item) => item.unlocked && item.unlockedAt)
      .sort(
        (a, b) =>
          new Date(b.unlockedAt!).getTime() -
          new Date(a.unlockedAt!).getTime(),
      )
      .slice(0, 3);
  }, [achievements]);

  const filteredAchievements = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(
      language === "fa" ? "fa-IR" : "en-US",
    );

    return achievements.filter((achievement) => {
      if (filter === "UNLOCKED" && !achievement.unlocked) {
        return false;
      }

      if (filter === "LOCKED" && achievement.unlocked) {
        return false;
      }

      if (category !== "ALL" && achievement.category !== category) {
        return false;
      }

      if (!query) {
        return true;
      }

      const name = achievement.name.toLocaleLowerCase(
        language === "fa" ? "fa-IR" : "en-US",
      );
      const description = achievement.description.toLocaleLowerCase(
        language === "fa" ? "fa-IR" : "en-US",
      );

      return name.includes(query) || description.includes(query);
    });
  }, [achievements, filter, category, search, language]);

  const groupedAchievements = useMemo(() => {
    const groups = new Map<AchievementCategory, Achievement[]>();

    for (const achievement of filteredAchievements) {
      const current = groups.get(achievement.category) ?? [];
      current.push(achievement);
      groups.set(achievement.category, current);
    }

    return Array.from(groups.entries());
  }, [filteredAchievements]);

  const numberLocale = language === "fa" ? "fa-IR" : "en-US";

  const formatNumber = (value: number) =>
    value.toLocaleString(numberLocale);

  if (loading) {
    return (
      <div className="w-full space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className="h-44 animate-pulse rounded-3xl bg-muted" />

        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <div
          className={`absolute -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl ${
            isRTL ? "-left-20" : "-right-20"
          }`}
        />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl shadow-lg">
                🏆
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  {t("achievementsJourney")}
                </div>

                <h1 className="mt-1 text-3xl font-bold tracking-tight">
                  {t("achievementsTitle")}
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("achievementsDescription")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {t("achievementsLevel")}
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {formatNumber(stats.level)}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {t("achievementsTotalXp")}
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {formatNumber(stats.xp)}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {t("achievementsUnlocked")}
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {formatNumber(stats.unlocked)}
                  <span className="mx-1 text-sm font-normal text-muted-foreground">
                    / {formatNumber(stats.total)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("achievementsLevel")} {formatNumber(stats.level)}
                </p>

                <p className="mt-1 text-lg font-bold">
                  {formatNumber(stats.currentLevelXp)}
                  <span className="mx-1 text-sm font-normal text-muted-foreground">
                    / {formatNumber(stats.nextLevelXp)} XP
                  </span>
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                {formatNumber(stats.level)}
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{
                  width: `${stats.levelPercentage}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {formatNumber(stats.nextLevelXp - stats.currentLevelXp)} XP{" "}
              {t("achievementsUntilLevel")} {formatNumber(stats.level + 1)}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("achievementsUnlocked")}
              </p>
              <p className="text-2xl font-bold">
                {formatNumber(unlockedCount)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("achievementsRemaining")}
              </p>
              <p className="text-2xl font-bold">
                {formatNumber(totalCount - unlockedCount)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("achievementsCompletion")}
              </p>
              <p className="text-2xl font-bold">
                {formatNumber(completion)}%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent */}
      {recentAchievements.length > 0 && (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">
                {t("achievementsRecentlyUnlocked")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("achievementsLatestMilestones")}
              </p>
            </div>
            <Trophy className="h-5 w-5" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background text-xl">
                  {achievement.icon}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {achievement.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatUnlockedDate(achievement.unlockedAt, language)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["ALL", t("achievementsAll")],
                ["UNLOCKED", t("achievementsUnlocked")],
                ["LOCKED", t("achievementsLocked")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  filter === value
                    ? "bg-primary text-primary-foreground"
                    : "border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search
              className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${
                isRTL ? "right-3" : "left-3"
              }`}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("achievementsSearch")}
              className={`h-10 w-full rounded-xl border bg-card text-sm outline-none transition focus:border-foreground ${
                isRTL
                  ? "pr-9 pl-3 text-right"
                  : "pl-9 pr-3 text-left"
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />

          <button
            type="button"
            onClick={() => setCategory("ALL")}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              category === "ALL"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t("achievementsAllCategories")}
          </button>

          {(Object.keys(categoryLabels) as AchievementCategory[]).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  category === item
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {categoryIcons[item]} {categoryLabels[item]}
              </button>
            ),
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Achievement groups */}
      {groupedAchievements.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
          <Search className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">
            {t("achievementsNoResults")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("achievementsChangeFilters")}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedAchievements.map(([group, items]) => (
            <section key={group}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg">
                  {categoryIcons[group]}
                </div>

                <div>
                  <h2 className="font-semibold">
                    {categoryLabels[group]}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(
                      items.filter((item) => item.unlocked).length,
                    )}{" "}
                    {t("achievementsOf")} {formatNumber(items.length)}{" "}
                    {t("achievementsUnlocked").toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((achievement) => (
                  <article
                    key={achievement.id}
                    className={`group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      achievement.unlocked ? "border-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition ${
                          achievement.unlocked
                            ? "bg-primary/10"
                            : "bg-muted grayscale opacity-60"
                        }`}
                      >
                        {achievement.icon}
                      </div>

                      <div>
                        {achievement.unlocked ? (
                          <div className="flex h-7 items-center gap-1 rounded-full bg-primary/10 px-2.5 text-xs font-medium">
                            <Check className="h-3.5 w-3.5" />
                            {t("achievementsUnlocked")}
                          </div>
                        ) : (
                          <div className="flex h-7 items-center gap-1 rounded-full bg-muted px-2.5 text-xs text-muted-foreground">
                            <Lock className="h-3.5 w-3.5" />
                            {t("achievementsLocked")}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="font-semibold">
                        {achievement.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {rarityLabels[achievement.rarity]}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          +{formatNumber(achievement.xp)} XP
                        </span>
                      </div>

                      <p className="mt-1 min-h-10 text-sm leading-5 text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>

                    {!achievement.unlocked && (
                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {t("achievementsProgressLabel")}
                          </span>
                          <span className="font-semibold">
                            {formatNumber(
                              Math.min(
                                achievement.value,
                                achievement.requirement,
                              ),
                            )}{" "}
                            / {formatNumber(achievement.requirement)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{
                              width: `${achievement.percentage}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {formatNumber(achievement.percentage)}%{" "}
                            {t("achievementsComplete")}
                          </span>
                          <span>+{formatNumber(achievement.xp)} XP</span>
                        </div>
                      </div>
                    )}

                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                        <span>{t("achievementsUnlocked")}</span>
                        <span>
                          {formatUnlockedDate(
                            achievement.unlockedAt,
                            language,
                          )}
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

