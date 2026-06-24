// Gamification Utility Functions

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 }
];

export const TREE_STAGES = [
  { xp: 0, name: "Seed", emoji: "🌱", stage: 1 },
  { xp: 100, name: "Sprout", emoji: "🌿", stage: 2 },
  { xp: 250, name: "Young Tree", emoji: "🌳", stage: 3 },
  { xp: 500, name: "Flourishing Tree", emoji: "🌲", stage: 4 },
  { xp: 1000, name: "Blooming Tree", emoji: "🌸", stage: 5 },
  { xp: 2500, name: "Ancient Tree", emoji: "✨", stage: 6 },
  { xp: 5000, name: "World Tree", emoji: "🌎", stage: 7 }
];

export const FRUIT_MILESTONES = [
  { level: 5, fruit: "🍎", name: "Apple" },
  { level: 10, fruit: "🍊", name: "Orange" },
  { level: 15, fruit: "🍑", name: "Peach" },
  { level: 20, fruit: "✨", name: "Golden Fruit" }
];

export const ACHIEVEMENTS = [
  { id: "first-growth", xpRequired: 100, title: "First Growth", description: "Reach 100 XP", icon: "🌱", emoji: "🌱" },
  { id: "growing-strong", xpRequired: 500, title: "Growing Strong", description: "Reach 500 XP", icon: "🌿", emoji: "🌿" },
  { id: "dedicated-learner", xpRequired: 1000, title: "Dedicated Learner", description: "Reach 1000 XP", icon: "🌳", emoji: "🌳" },
  { id: "forest-keeper", xpRequired: 2500, title: "Forest Keeper", description: "Reach 2500 XP", icon: "🌲", emoji: "🌲" },
  { id: "world-tree-guardian", xpRequired: 5000, title: "World Tree Guardian", description: "Reach 5000 XP", icon: "🪴", emoji: "🪴" }
];

export const SEASONS = [
  { id: "spring", name: "Spring", color: "text-pink-400", leafColor: "#f9a8d4" },
  { id: "summer", name: "Summer", color: "text-green-400", leafColor: "#4ade80" },
  { id: "autumn", name: "Autumn", color: "text-orange-400", leafColor: "#fb923c" },
  { id: "winter", name: "Winter", color: "text-blue-200", leafColor: "#bfdbfe" }
];

export const calculateLevel = (xp) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
};

export const calculateXPProgress = (xp) => {
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

export const getTreeStage = (xp) => {
  for (let i = TREE_STAGES.length - 1; i >= 0; i--) {
    if (xp >= TREE_STAGES[i].xp) {
      return TREE_STAGES[i];
    }
  }
  return TREE_STAGES[0];
};

export const calculateCurrentStreak = (sessions) => {
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

export const getEarnedFruits = (level) => {
  return FRUIT_MILESTONES.filter(milestone => level >= milestone.level);
};

export const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return SEASONS[0]; // Spring
  if (month >= 5 && month <= 7) return SEASONS[1]; // Summer
  if (month >= 8 && month <= 10) return SEASONS[2]; // Autumn
  return SEASONS[3]; // Winter
};

export const calculateTreeData = (skills, sessions, achievements) => {
  // Calculate skill branches (one per skill)
  const branches = skills.map((skill, index) => {
    const skillSessions = sessions.filter(s => s.skillId === skill._id);
    const totalMinutes = skillSessions.reduce((sum, s) => sum + s.duration, 0);
    const branchLength = Math.min(100, totalMinutes / 10); // Cap at 100 units
    
    return {
      id: skill._id,
      name: skill.name,
      totalMinutes,
      totalSessions: skillSessions.length,
      branchLength,
      angle: (index / skills.length) * 180 - 90 // Spread branches left-right
    };
  });

  // Calculate leaves (one per session)
  const leaves = sessions.map((session, index) => ({
    id: session._id,
    x: Math.random() * 200 - 100,
    y: Math.random() * -100 - 50
  }));

  // Calculate flowers (one per achievement)
  const flowers = achievements.map((achievement, index) => ({
    id: achievement.id,
    x: Math.random() * 160 - 80,
    y: Math.random() * -80 - 40
  }));

  return { branches, leaves, flowers };
};
