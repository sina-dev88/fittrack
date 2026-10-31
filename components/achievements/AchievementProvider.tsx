"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import AchievementToast, {
  type AchievementToastData,
} from "./AchievementToast";

type AchievementContextValue = {
  showAchievements: (
    achievements: AchievementToastData[],
  ) => void;
};

const AchievementContext =
  createContext<AchievementContextValue | null>(null);

export default function AchievementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queue, setQueue] = useState<
    AchievementToastData[]
  >([]);

  const showAchievements = useCallback(
    (achievements: AchievementToastData[]) => {
      if (achievements.length === 0) {
        return;
      }

      setQueue((current) => [
        ...current,
        ...achievements,
      ]);
    },
    [],
  );

  const closeCurrent = useCallback(() => {
    setQueue((current) => current.slice(1));
  }, []);

  const currentAchievement = queue[0] ?? null;

  const value = useMemo(
    () => ({
      showAchievements,
    }),
    [showAchievements],
  );

  return (
    <AchievementContext.Provider value={value}>
      {children}

      {currentAchievement && (
        <AchievementToast
          achievement={currentAchievement}
          onClose={closeCurrent}
        />
      )}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);

  if (!context) {
    throw new Error(
      "useAchievements must be used inside AchievementProvider.",
    );
  }

  return context;
}
