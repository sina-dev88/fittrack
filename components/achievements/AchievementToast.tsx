"use client";

import { Trophy, X } from "lucide-react";

export type AchievementToastData = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

type AchievementToastProps = {
  achievement: AchievementToastData;
  onClose: () => void;
};

export default function AchievementToast({
  achievement,
  onClose,
}: AchievementToastProps) {
  return (
    <div className="fixed right-4 top-4 z-[100] w-[calc(100%-32px)] max-w-sm">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xl dark:bg-zinc-800">
            {achievement.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Trophy
                size={15}
                className="shrink-0"
              />

              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Achievement Unlocked
              </p>
            </div>

            <h3 className="mt-1 font-semibold text-zinc-950 dark:text-white">
              {achievement.name}
            </h3>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {achievement.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Close achievement notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
