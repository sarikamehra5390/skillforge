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

const calculateCurrentStreak = (sessions) => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return 0;
  }

  const validSessions = sessions.filter((session) => {
    if (!session?.completedAt) {
      return false;
    }

    const date = new Date(session.completedAt);

    return !Number.isNaN(date.getTime());
  });

  if (validSessions.length === 0) {
    return 0;
  }

  const dates = new Set();

  validSessions.forEach((session) => {
    const date = new Date(session.completedAt);

    dates.add(date.toDateString());
  });

  const sortedDates = Array.from(dates).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (sortedDates.length === 0) {
    return 0;
  }

  const today = new Date().toDateString();

  const yesterday = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toDateString();

  /*
   * A streak is active only when the user practiced
   * today or yesterday.
   */
  if (
    sortedDates[0] !== today &&
    sortedDates[0] !== yesterday
  ) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const previousDate = new Date(sortedDates[i]);

    const diffTime =
      currentDate.getTime() -
      previousDate.getTime();

    const diffDays = Math.floor(
      diffTime / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
      currentDate = previousDate;
    } else {
      break;
    }
  }

  return streak;
};

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
  getEarnedFruits,
  getCurrentSeason,
};