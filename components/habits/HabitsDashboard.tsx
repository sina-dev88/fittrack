
"use client";

import type { AchievementToastData } from "@/components/achievements/AchievementToast";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Flame,
  Loader2,
  MoreVertical,
  Plus,
  Target,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import HabitModal from "@/components/habits/HabitModal";
import { useAchievements } from "@/components/achievements/AchievementProvider";
import { useLanguage } from "@/components/language/LanguageProvider";

export type Habit = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  frequency: "DAILY" | "WEEKLY";
  targetCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  logs: HabitLog[];
};

export type HabitLog = {
  id: string;
  habitId: string;
  userId: string;
  dateKey: string;
  completed: boolean;
  count: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type TodayLog = {
  habitId: string;
  completed: boolean;
  count: number;
  dateKey: string;
};

type HabitsResponse = {
  habits: Habit[];
  today: string;
  todayLogs: TodayLog[];
};
function calculateStreak(habit: Habit) {
  const logs = Array.isArray(habit.logs) ? habit.logs : [];

  const completedDates = new Set(
    logs
      .filter((log) => log.completed)
      .map((log) => log.dateKey),
  );

  let streak = 0;
  const current = new Date();

  while (true) {
    const dateKey = current.toISOString().slice(0, 10);

    if (!completedDates.has(dateKey)) {
      break;
    }

    streak += 1;
    current.setUTCDate(current.getUTCDate() - 1);
  }

  return streak;
}
export default function HabitsDashboard() {
  const { t, isRTL, language } = useLanguage();
  const { showAchievements } = useAchievements();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<TodayLog[]>([]);
  const [today, setToday] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/habits");

      if (!response.ok) {
        throw new Error("load");
      }

      const result: HabitsResponse = await response.json();

      setHabits(result.habits);
      setTodayLogs(result.todayLogs);
      setToday(result.today);
    } catch (error) {
      console.error("Failed to load habits:", error);
      setError(t("habitsLoadError"));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  const completedToday = useMemo(
    () => todayLogs.filter((log) => log.completed).length,
    [todayLogs],
  );

  const progress = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.round((completedToday / habits.length) * 100);
  }, [completedToday, habits.length]);

  function getTodayLog(habitId: string) {
    return todayLogs.find((log) => log.habitId === habitId);
  }

  async function toggleHabit(habit: Habit) {
    const currentLog = getTodayLog(habit.id);
    const nextCompleted = !(currentLog?.completed ?? false);

    try {
      setLoggingId(habit.id);
      setError("");

      const response = await fetch(`/api/habits/${habit.id}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateKey: today,
          completed: nextCompleted,
          count: nextCompleted ? habit.targetCount : 0,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error("update");
      }

      if (
        result.unlockedAchievements &&
        result.unlockedAchievements.length > 0
      ) {
        showAchievements(
          result.unlockedAchievements.map(
            (item: {
              achievement: {
                id: string;
                name: string;
                description: string;
                icon: string;
              };
            }) => ({
              id: item.achievement.id,
              name: item.achievement.name,
              description: item.achievement.description,
              icon: item.achievement.icon,
            }),
          ),
        );
      }

      const updatedLog: HabitLog = result.log;

      setTodayLogs((current) => {
        const exists = current.some((log) => log.habitId === habit.id);

        if (exists) {
          return current.map((log) =>
            log.habitId === habit.id
              ? { ...log, ...updatedLog }
              : log,
          );
        }

        return [...current, updatedLog];
      });

      setHabits((current) =>
        current.map((item) =>
          item.id === habit.id
            ? {
                ...item,
                logs: [
                  updatedLog,
                  ...item.logs.filter(
                    (log) => log.dateKey !== updatedLog.dateKey,
                  ),
                ],
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update habit:", error);
      setError(t("habitsUpdateError"));
    } finally {
      setLoggingId(null);
    }
  }

  function handleCreated(
    habit: Habit,
    unlockedAchievements?: AchievementToastData[],
  ) {
    setHabits((current) => [...current, habit]);

    if (unlockedAchievements?.length) {
      showAchievements(unlockedAchievements);
    }
  }

  function handleUpdated(habit: Habit) {
    setHabits((current) =>
      current.map((item) => (item.id === habit.id ? habit : item)),
    );

    setModalOpen(false);
    setEditingHabit(null);
  }

  async function deleteHabit(habit: Habit) {
    const confirmation = t("habitsDeleteConfirmation").replace(
      "{name}",
      habit.name,
    );

    if (!window.confirm(confirmation)) return;

    try {
      setDeletingId(habit.id);
      setError("");

      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("delete");
      }

      setHabits((current) =>
        current.filter((item) => item.id !== habit.id),
      );

      setTodayLogs((current) =>
        current.filter((log) => log.habitId !== habit.id),
      );
    } catch (error) {
      console.error("Failed to delete habit:", error);
      setError(t("habitsDeleteError"));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="w-full space-y-6">
        <div>
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-40 animate-pulse rounded-2xl bg-muted" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
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
    <div dir={isRTL ? "rtl" : "ltr"} className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("habitsTitle")}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("habitsDescription")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingHabit(null);
            setModalOpen(true);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t("habitsAddButton")}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-900/30"
            aria-label={t("close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Today's Progress */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                {t("habitsTodayProgress")}
              </p>

              <p className="mt-1 text-2xl font-bold">
                {completedToday}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  / {habits.length} {t("habitsCompletedCount")}
                </span>
              </p>
            </div>
          </div>

          <div className="sm:min-w-40">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t("habitsCompletion")}
              </span>

              <span className="font-semibold" dir="ltr">
                {progress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            {t("habitsEmptyTitle")}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("habitsEmptyDescription")}
          </p>

          <button
            type="button"
            onClick={() => {
              setEditingHabit(null);
              setModalOpen(true);
            }}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            {t("habitsCreateFirst")}
          </button>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {habits.map((habit) => {
            const todayLog = getTodayLog(habit.id);
            const completed = todayLog?.completed ?? false;
            const streak = calculateStreak(habit);
            const logging = loggingId === habit.id;
            const deleting = deletingId === habit.id;

            return (
              <div
                key={habit.id}
                className={`group relative flex min-w-0 flex-col rounded-2xl border bg-card p-5 shadow-sm transition ${
                  completed ? "border-primary/30" : "border-border"
                }`}
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                      {habit.icon || "✓"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{habit.name}</h3>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {habit.frequency === "DAILY"
                          ? t("habitDaily")
                          : t("habitWeekly")}{" "}
                        · {t("habitsTarget")} {habit.targetCount}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingHabit(habit);
                      setModalOpen(true);
                    }}
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={t("habitsEditAria").replace(
                      "{name}",
                      habit.name,
                    )}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Description */}
                <div className="mt-4 min-h-10">
                  {habit.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {habit.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t("habitsNoDescription")}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4" />

                      <span className="text-xs text-muted-foreground">
                        {t("habitsStreak")}
                      </span>
                    </div>

                    <p className="mt-1 text-lg font-bold">
                      {streak}
                      <span className="ms-1 text-xs font-normal text-muted-foreground">
                        {t("habitsDays")}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />

                      <span className="text-xs text-muted-foreground">
                        {t("habitsTarget")}
                      </span>
                    </div>

                    <p className="mt-1 text-lg font-bold">
                      {habit.targetCount}
                    </p>
                  </div>
                </div>

                {/* Today Button */}
                <button
                  type="button"
                  disabled={logging || deleting}
                  onClick={() => toggleHabit(habit)}
                  className={`mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition ${
                    completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {logging ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : completed ? (
                    <Check className="h-4 w-4" />
                  ) : null}

                  {logging
                    ? t("saving")
                    : completed
                      ? t("habitsCompletedToday")
                      : t("habitsMarkComplete")}
                </button>

                {/* Delete */}
                <button
                  type="button"
                  disabled={deleting || logging}
                  onClick={() => deleteHabit(habit)}
                  className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  {t("habitsDeleteButton")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <HabitModal
        open={modalOpen}
        habit={editingHabit}
        onClose={() => {
          setModalOpen(false);
          setEditingHabit(null);
        }}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />
    </div>
  );
}

