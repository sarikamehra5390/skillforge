// Backend Gamification Utility Functions

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 }
];

const TREE_STAGES = [
  { xp: 0, name: "Seed", emoji: "🌱" },
  { xp: 100, name: "Sprout", emoji: "🌿" },
  { xp: 250, name: "Sapling", emoji: "🌳" },
  { xp: 500, name: "Young Tree", emoji: "🌳" },
  { xp: 1000, name: "Flourishing Tree", emoji: "🌲" },
  { xp: 2500, name: "Ancient Tree", emoji: "🌲" },
  { xp: 5000, name: "World Tree", emoji: "🪴" }
];

const ACHIEVEMENTS = [
  { id: "first-growth", xpRequired: 100, title: "First Growth", description: "Reach 100 XP" },
  { id: "growing-strong", xpRequired: 500, title: "Growing Strong", description: "Reach 500 XP" },
  { id: "dedicated-learner", xpRequired: 1000, title: "Dedicated Learner", description: "Reach 1000 XP" },
  { id: "forest-keeper", xpRequired: 2500, title: "Forest Keeper", description: "Reach 2500 XP" },
  { id: "world-tree-guardian", xpRequired: 5000, title: "World Tree Guardian", description: "Reach 5000 XP" }
];

const calculateLevel = (xp) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
};

const calculateXPProgress = (xp) => {
  let currentLevel = 1;
  let currentXP = 0;
  let xpNeeded = LEVEL_THRESHOLDS[1].xp;
  let progressPercentage = 0;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i].level;
      currentXP = xp - LEVEL_THRESHOLDS[i].xp;
      if (i < LEVEL_THRESHOLDS.length - 1) {
        xpNeeded = LEVEL_THRESHOLDS[i + 1].xp - LEVEL_THRESHOLDS[i].xp;
        progressPercentage = Math.min(100, (currentXP / xpNeeded) * 100);
      } else {
        xpNeeded = 0;
        progressPercentage = 100;
      }
    }
  }

  return { currentLevel, currentXP, xpNeeded, progressPercentage };
};

const getTreeStage = (xp) => {
  for (let i = TREE_STAGES.length - 1; i >= 0; i--) {
    if (xp >= TREE_STAGES[i].xp) {
      return TREE_STAGES[i];
    }
  }
  return TREE_STAGES[0];
};

const calculateCurrentStreak = (sessions) => {
  if (!sessions || sessions.length === 0) return 0;

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
  );

  const dates = new Set();
  sortedSessions.forEach((session) => {
    const date = new Date(session.completedAt).toDateString();
    dates.add(date);
  });

  const sortedDates = Array.from(dates).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const previousDate = new Date(sortedDates[i]);
    const diffTime = currentDate - previousDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      currentDate = previousDate;
    } else {
      break;
    }
  }

  return streak;
};

module.exports = {
  LEVEL_THRESHOLDS,
  TREE_STAGES,
  ACHIEVEMENTS,
  calculateLevel,
  calculateXPProgress,
  getTreeStage,
  calculateCurrentStreak
};
