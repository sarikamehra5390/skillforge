// Backend Gamification Utility Functions

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
  { level: 6, xp: 1500 },
  { level: 7, xp: 2250 },
  { level: 8, xp: 3250 },
  { level: 9, xp: 4500 },
  { level: 10, xp: 6000 },
  { level: 11, xp: 8000 },
  { level: 12, xp: 10500 },
  { level: 13, xp: 13500 },
  { level: 14, xp: 17000 },
  { level: 15, xp: 21000 },
  { level: 16, xp: 26000 },
  { level: 17, xp: 32000 },
  { level: 18, xp: 39000 },
  { level: 19, xp: 47000 },
  { level: 20, xp: 56000 },
];

const TREE_STAGES = [
  { xp: 0, name: "Seed", emoji: "🌱", stage: 1 },
  { xp: 100, name: "Sprout", emoji: "🌿", stage: 2 },
  { xp: 250, name: "Young Tree", emoji: "🌳", stage: 3 },
  { xp: 500, name: "Flourishing Tree", emoji: "🌲", stage: 4 },
  { xp: 1000, name: "Blooming Tree", emoji: "🌸", stage: 5 },
  { xp: 2500, name: "Ancient Tree", emoji: "✨", stage: 6 },
  { xp: 5000, name: "World Tree", emoji: "🌎", stage: 7 },
];

const FRUIT_MILESTONES = [
  { level: 5, fruit: "🍎", name: "Apple" },
  { level: 10, fruit: "🍊", name: "Orange" },
  { level: 15, fruit: "🍑", name: "Peach" },
  { level: 20, fruit: "✨", name: "Golden Fruit" },
];

const ACHIEVEMENTS = [
  {
    id: "first-growth",
    xpRequired: 100,
    title: "First Growth",
    description: "Reach 100 XP",
  },
  {
    id: "growing-strong",
    xpRequired: 500,
    title: "Growing Strong",
    description: "Reach 500 XP",
  },
  {
    id: "dedicated-learner",
    xpRequired: 1000,
    title: "Dedicated Learner",
    description: "Reach 1000 XP",
  },
  {
    id: "forest-keeper",
    xpRequired: 2500,
    title: "Forest Keeper",
    description: "Reach 2500 XP",
  },
  {
    id: "world-tree-guardian",
    xpRequired: 5000,
    title: "World Tree Guardian",
    description: "Reach 5000 XP",
  },
];

const SEASONS = [
  {
    id: "spring",
    name: "Spring",
    color: "text-pink-400",
    leafColor: "#f9a8d4",
  },
  {
    id: "summer",
    name: "Summer",
    color: "text-green-400",
    leafColor: "#4ade80",
  },
  {
    id: "autumn",
    name: "Autumn",
    color: "text-orange-400",
    leafColor: "#fb923c",
  },
  {
    id: "winter",
    name: "Winter",
    color: "text-blue-200",
    leafColor: "#bfdbfe",
  },
];

/* =========================================================
   LEVEL
========================================================= */

const calculateLevel = (xp) => {
  const safeXP = Number.isFinite(Number(xp))
    ? Math.max(0, Number(xp))
    : 0;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXP >= LEVEL_THRESHOLDS[i].xp) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }

  return 1;
};

/* =========================================================
   XP PROGRESS
========================================================= */

const calculateXPProgress = (xp) => {
  const safeXP = Number.isFinite(Number(xp))
    ? Math.max(0, Number(xp))
    : 0;

  let currentLevel = 1;
  let currentXP = 0;
  let xpNeeded = LEVEL_THRESHOLDS[1].xp;
  let progressPercentage = 0;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (safeXP >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i].level;

      currentXP =
        safeXP - LEVEL_THRESHOLDS[i].xp;

      if (i < LEVEL_THRESHOLDS.length - 1) {
        xpNeeded =
          LEVEL_THRESHOLDS[i + 1].xp -
          LEVEL_THRESHOLDS[i].xp;

        progressPercentage = Math.min(
          100,
          Math.max(
            0,
            (currentXP / xpNeeded) * 100
          )
        );
      } else {
        // Level 20 is currently the maximum level.
        xpNeeded = 0;
        progressPercentage = 100;
      }
    }
  }

  return {
    currentLevel,
    currentXP,
    xpNeeded,
    progressPercentage,
  };
};

/* =========================================================
   TREE STAGE
========================================================= */

const getTreeStage = (xp) => {
  const safeXP = Number.isFinite(Number(xp))
    ? Math.max(0, Number(xp))
    : 0;

  for (let i = TREE_STAGES.length - 1; i >= 0; i--) {
    if (safeXP >= TREE_STAGES[i].xp) {
      return TREE_STAGES[i];
    }
  }

  return TREE_STAGES[0];
};

/* =========================================================
   CURRENT STREAK
========================================================= */

// SkillForge currently has no per-user timezone setting. UTC is the shared
// calendar-day boundary for streaks on the server and in client summaries.
const getPracticeDay = (session) => {
  if (!session?.completedAt) return null;
  const date = new Date(session.completedAt);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ) / 86400000);
};

const getPracticeRecords = (sessions, now = new Date()) => {
  const today = getPracticeDay({ completedAt: now });
  if (today === null) return [];
  return (Array.isArray(sessions) ? sessions : [])
    .map((session) => ({ session, day: getPracticeDay(session) }))
    .filter(({ session, day }) => (
      day !== null && day <= today &&
      Number.isFinite(Number(session?.duration)) && Number(session.duration) > 0
    ));
};

const calculateStreakState = (sessions, now = new Date()) => {
  const records = getPracticeRecords(sessions, now);
  const byDay = new Map();
  for (const { session, day } of records) {
    const completedAt = new Date(session.completedAt);
    const existing = byDay.get(day);
    if (!existing || completedAt > existing) byDay.set(day, completedAt);
  }

  const days = [...byDay.keys()].sort((a, b) => b - a);
  let current = 0;
  if (days.length && days[0] >= getPracticeDay({ completedAt: now }) - 1) {
    current = 1;
    for (let index = 1; index < days.length && days[index - 1] - days[index] === 1; index++) current++;
  }

  const chronologicalDays = [...days].reverse();
  let longest = 0;
  let run = 0;
  let previous = null;
  for (const day of chronologicalDays) {
    run = previous !== null && day === previous + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }

  const lastPracticeDate = days.length ? byDay.get(days[0]) : undefined;
  return { streak: current, longestStreak: longest, lastPracticeDate };
};

const calculateCurrentStreak = (sessions, now = new Date()) =>
  calculateStreakState(sessions, now).streak;

const getFreshStreakValue = (streak, lastPracticeDate, now = new Date()) => {
  const lastPracticeDay = getPracticeDay({ completedAt: lastPracticeDate });
  const currentDay = getPracticeDay({ completedAt: now });
  if (lastPracticeDay === null || currentDay === null || lastPracticeDay < currentDay - 1 || lastPracticeDay > currentDay) return 0;
  const value = Number(streak);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
};

const calculateLongestStreak = (sessions, now = new Date()) =>
  calculateStreakState(sessions, now).longestStreak;

/* =========================================================
   EARNED FRUITS
========================================================= */

const getEarnedFruits = (level) => {
  const safeLevel = Number.isFinite(Number(level))
    ? Math.max(0, Number(level))
    : 0;

  return FRUIT_MILESTONES.filter(
    (milestone) =>
      safeLevel >= milestone.level
  );
};

/* =========================================================
   CURRENT SEASON
========================================================= */

const getCurrentSeason = () => {
  const month = new Date().getMonth();

  // March - May
  if (month >= 2 && month <= 4) {
    return SEASONS[0];
  }

  // June - August
  if (month >= 5 && month <= 7) {
    return SEASONS[1];
  }

  // September - November
  if (month >= 8 && month <= 10) {
    return SEASONS[2];
  }

  // December - February
  return SEASONS[3];
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  LEVEL_THRESHOLDS,
  TREE_STAGES,
  FRUIT_MILESTONES,
  ACHIEVEMENTS,
  SEASONS,
  calculateLevel,
  calculateXPProgress,
  getTreeStage,
  calculateCurrentStreak,
  calculateStreakState,
  getFreshStreakValue,
  calculateLongestStreak,
  getEarnedFruits,
  getCurrentSeason,
};
