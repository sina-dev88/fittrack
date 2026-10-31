"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useLanguage } from "@/components/language/LanguageProvider";
import type { Habit } from "@/components/habits/HabitsDashboard";
import type { AchievementToastData } from "@/components/achievements/AchievementToast";

type HabitModalProps = {
  open: boolean;
  habit: Habit | null;
  onClose: () => void;
  onCreated?: (
    habit: Habit,
    unlockedAchievements?: AchievementToastData[],
  ) => void;
  onUpdated?: (habit: Habit) => void;
};

const iconOptions = [
  "💧",
  "🏋️",
  "😴",
  "🍎",
  "🥗",
  "📚",
  "🚶",
  "🏃",
  "🧘",
  "💊",
  "🔥",
  "🎯",
];

export default function HabitModal({
  open,
  habit,
  onClose,
  onCreated,
  onUpdated,
}: HabitModalProps) {
  const { t, isRTL } = useLanguage();
  const editing = Boolean(habit);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💧");
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [targetCount, setTargetCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(habit?.name ?? "");
    setDescription(habit?.description ?? "");
    setIcon(habit?.icon ?? "💧");
    setFrequency(habit?.frequency ?? "DAILY");
    setTargetCount(habit?.targetCount ?? 1);
    setError("");

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open, habit]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError(t("habitNameRequired"));
      return;
    }

    if (
      !Number.isInteger(targetCount) ||
      targetCount < 1 ||
      targetCount > 100
    ) {
      setError(t("habitTargetRangeError"));
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        editing ? `/api/habits/${habit!.id}` : "/api/habits",
        {
          method: editing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
            icon,
            frequency,
            targetCount,
          }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Habit API error:", {
          status: response.status,
          result,
        });

        throw new Error(
          typeof result.error === "string"
            ? result.error
            : `Habit request failed with status ${response.status}`,
        );
      }

      if (!result.habit) {
        console.error("Unexpected response from Habits API:", result);
        throw new Error("The server did not return the saved habit.");
      }

      if (editing) {
        onUpdated?.(result.habit);
      } else {
        onCreated?.(result.habit, result.unlockedAchievements);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save habit:", error);
      setError(t("habitSaveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:max-h-[calc(100dvh-48px)]">
        {/* Header */}
        <div className="shrink-0 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                {editing ? t("habitEditTitle") : t("habitCreateTitle")}
              </h2>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {editing
                  ? t("habitUpdateDescription")
                  : t("habitCreateDescription")}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label={t("close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <form
            id="habit-form"
            onSubmit={handleSubmit}
            className="space-y-5 p-5 sm:p-6"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="habit-name"
                className="mb-2 block text-sm font-medium"
              >
                {t("habitName")}
              </label>

              <input
                id="habit-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("habitNamePlaceholder")}
                maxLength={100}
                disabled={saving}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white dark:focus:ring-white/10"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="habit-description"
                className="mb-2 block text-sm font-medium"
              >
                {t("habitDescription")}
              </label>

              <textarea
                id="habit-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("habitDescriptionPlaceholder")}
                maxLength={500}
                rows={3}
                disabled={saving}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white dark:focus:ring-white/10"
              />
            </div>

            {/* Icon */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium">
                  {t("habitIcon")}
                </label>

                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("habitChooseIcon")}
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {iconOptions.map((option) => {
                  const selected = icon === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setIcon(option)}
                      disabled={saving}
                      aria-pressed={selected}
                      aria-label={`${t("habitSelectIcon")} ${option}`}
                      className={`flex h-12 items-center justify-center rounded-xl border text-xl transition ${
                        selected
                          ? "border-2 border-zinc-950 bg-zinc-100 shadow-sm dark:border-white dark:bg-zinc-800"
                          : "border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-zinc-950 dark:border-white">
                  {icon}
                </span>

                <span>{t("habitSelectedIcon")}</span>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                {t("habitFrequency")}
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(["DAILY", "WEEKLY"] as const).map((option) => {
                  const selected = frequency === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFrequency(option)}
                      disabled={saving}
                      aria-pressed={selected}
                      className={`h-11 rounded-xl border text-sm font-medium transition ${
                        selected
                          ? "border-2 border-zinc-950 bg-zinc-100 text-zinc-950 dark:border-white dark:bg-zinc-800 dark:text-white"
                          : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {option === "DAILY" ? t("habitDaily") : t("habitWeekly")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target */}
            <div>
              <label
                htmlFor="habit-target"
                className="mb-2 block text-sm font-medium"
              >
                {t("habitTargetCount")}
              </label>

              <input
                id="habit-target"
                type="number"
                min={1}
                max={100}
                step={1}
                value={targetCount}
                onChange={(event) => setTargetCount(Number(event.target.value))}
                disabled={saving}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white dark:focus:ring-white/10"
              />

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {t("habitTargetHelp")}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
              >
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 rounded-xl border border-zinc-200 px-5 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              form="habit-form"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}

              {saving
                ? t("saving")
                : editing
                  ? t("habitSaveChanges")
                  : t("habitCreateTitle")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
