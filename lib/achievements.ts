export type AchievementCategory =
  | "WORKOUT"
  | "STRENGTH"
  | "HABIT"
  | "CONSISTENCY"
  | "PROGRESS";

export type AchievementRarity =
  | "COMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY";

export type AchievementDefinition = {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  xp: number;
  rarity: AchievementRarity;
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // =========================
  // WORKOUT
  // =========================

  {
    key: "first-workout",
    name: "First Workout",
    description: "Complete your first workout.",
    icon: "🏋️",
    category: "WORKOUT",
    requirement: 1,
    xp: 100,
    rarity: "COMMON",
  },
  {
    key: "five-workouts",
    name: "Getting Started",
    description: "Complete 5 workouts.",
    icon: "🔥",
    category: "WORKOUT",
    requirement: 5,
    xp: 150,
    rarity: "COMMON",
  },
  {
    key: "ten-workouts",
    name: "Committed",
    description: "Complete 10 workouts.",
    icon: "💪",
    category: "WORKOUT",
    requirement: 10,
    xp: 250,
    rarity: "RARE",
  },
  {
    key: "twenty-five-workouts",
    name: "Dedicated",
    description: "Complete 25 workouts.",
    icon: "⚡",
    category: "WORKOUT",
    requirement: 25,
    xp: 400,
    rarity: "RARE",
  },
  {
    key: "fifty-workouts",
    name: "Unstoppable",
    description: "Complete 50 workouts.",
    icon: "🏆",
    category: "WORKOUT",
    requirement: 50,
    xp: 750,
    rarity: "EPIC",
  },
  {
    key: "hundred-workouts",
    name: "Iron Will",
    description: "Complete 100 workouts.",
    icon: "👑",
    category: "WORKOUT",
    requirement: 100,
    xp: 1500,
    rarity: "LEGENDARY",
  },

  // =========================
  // STRENGTH
  // =========================

  {
    key: "first-pr",
    name: "First PR",
    description: "Set your first personal record.",
    icon: "🥇",
    category: "STRENGTH",
    requirement: 1,
    xp: 150,
    rarity: "COMMON",
  },
  {
    key: "five-prs",
    name: "Record Breaker",
    description: "Set 5 personal records.",
    icon: "🏅",
    category: "STRENGTH",
    requirement: 5,
    xp: 250,
    rarity: "RARE",
  },
  {
    key: "ten-prs",
    name: "Strength Rising",
    description: "Set 10 personal records.",
    icon: "💥",
    category: "STRENGTH",
    requirement: 10,
    xp: 400,
    rarity: "RARE",
  },
  {
    key: "twenty-five-prs",
    name: "Powerhouse",
    description: "Set 25 personal records.",
    icon: "⚔️",
    category: "STRENGTH",
    requirement: 25,
    xp: 750,
    rarity: "EPIC",
  },

  // =========================
  // HABITS
  // =========================

  {
    key: "first-habit",
    name: "Habit Builder",
    description: "Create your first habit.",
    icon: "🎯",
    category: "HABIT",
    requirement: 1,
    xp: 100,
    rarity: "COMMON",
  },
  {
    key: "three-habits",
    name: "Routine Builder",
    description: "Create 3 habits.",
    icon: "🧩",
    category: "HABIT",
    requirement: 3,
    xp: 200,
    rarity: "RARE",
  },
  {
    key: "seven-day-habit",
    name: "7 Day Streak",
    description: "Maintain a habit for 7 consecutive days.",
    icon: "🔥",
    category: "HABIT",
    requirement: 7,
    xp: 250,
    rarity: "RARE",
  },
  {
    key: "thirty-day-habit",
    name: "30 Day Streak",
    description: "Maintain a habit for 30 consecutive days.",
    icon: "🚀",
    category: "HABIT",
    requirement: 30,
    xp: 600,
    rarity: "EPIC",
  },
  {
    key: "sixty-day-habit",
    name: "Habit Master",
    description: "Maintain a habit for 60 consecutive days.",
    icon: "👑",
    category: "HABIT",
    requirement: 60,
    xp: 1200,
    rarity: "LEGENDARY",
  },

  // =========================
  // CONSISTENCY
  // =========================

  {
    key: "seven-workout-days",
    name: "Consistent",
    description: "Complete workouts on 7 different days.",
    icon: "📅",
    category: "CONSISTENCY",
    requirement: 7,
    xp: 200,
    rarity: "COMMON",
  },
  {
    key: "fourteen-workout-days",
    name: "Building Momentum",
    description: "Complete workouts on 14 different days.",
    icon: "📈",
    category: "CONSISTENCY",
    requirement: 14,
    xp: 350,
    rarity: "RARE",
  },
  {
    key: "thirty-workout-days",
    name: "True Discipline",
    description: "Complete workouts on 30 different days.",
    icon: "🧠",
    category: "CONSISTENCY",
    requirement: 30,
    xp: 750,
    rarity: "EPIC",
  },
];