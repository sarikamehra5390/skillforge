// Gamification Utility Functions

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
];

export const TREE_STAGES = [
  {
    xp: 0,
    name: "Seed",
    emoji: "🌱",
    stage: 1,
  },
  {
    xp: 100,
    name: "Sprout",
    emoji: "🌿",
    stage: 2,
  },
  {
    xp: 250,
    name: "Young Tree",
    emoji: "🌳",
    stage: 3,
  },
  {
    xp: 500,
    name: "Flourishing Tree",
    emoji: "🌲",
    stage: 4,
  },
  {
    xp: 1000,
    name: "Blooming Tree",
    emoji: "🌸",
    stage: 5,
  },
  {
    xp: 2500,
    name: "Ancient Tree",
    emoji: "✨",
    stage: 6,
  },
  {
    xp: 5000,
    name: "World Tree",
    emoji: "🌎",
    stage: 7,
  },
];

export const FRUIT_MILESTONES = [
  {
    level: 5,
    fruit: "🍎",
    name: "Apple",
  },
  {
    level: 10,
    fruit: "🍊",
    name: "Orange",
  },
  {
    level: 15,
    fruit: "🍑",
    name: "Peach",
  },
  {
    level: 20,
    fruit: "✨",
    name: "Golden Fruit",
  },
];

export const ACHIEVEMENTS = [
  {
    id: "first-growth",
    xpRequired: 100,
    title: "First Growth",
    description: "Reach 100 XP",
    icon: "🌱",
    emoji: "🌱",
  },
  {
    id: "growing-strong",
    xpRequired: 500,
    title: "Growing Strong",
    description: "Reach 500 XP",
    icon: "🌿",
    emoji: "🌿",
  },
  {
    id: "dedicated-learner",
    xpRequired: 1000,
    title: "Dedicated Learner",
    description: "Reach 1000 XP",
    icon: "🌳",
    emoji: "🌳",
  },
  {
    id: "forest-keeper",
    xpRequired: 2500,
    title: "Forest Keeper",
    description: "Reach 2500 XP",
    icon: "🌲",
    emoji: "🌲",
  },
  {
    id: "world-tree-guardian",
    xpRequired: 5000,
    title: "World Tree Guardian",
    description: "Reach 5000 XP",
    icon: "🪴",
    emoji: "🪴",
  },
];

export const SEASONS = [
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

// =========================================
// Helpers
// =========================================

const toSafeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const normalizeArray = (value) =>
  Array.isArray(value) ? value : [];

// =========================================
// Level
// =========================================

export const calculateLevel = (xp) => {
  const normalizedXP = Math.max(
    0,
    toSafeNumber(xp)
  );

  for (
    let i = LEVEL_THRESHOLDS.length - 1;
    i >= 0;
    i--
  ) {
    if (
      normalizedXP >=
      LEVEL_THRESHOLDS[i].xp
    ) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }

  return 1;
};

// =========================================
// XP Progress
// =========================================

export const calculateXPProgress = (xp) => {
  const normalizedXP = Math.max(
    0,
    toSafeNumber(xp)
  );

  if (!LEVEL_THRESHOLDS.length) {
    return {
      currentLevel: 1,
      currentXP: normalizedXP,
      xpNeeded: 0,
      progressPercentage: 0,
    };
  }

  let currentIndex = 0;

  for (
    let i = 0;
    i < LEVEL_THRESHOLDS.length;
    i++
  ) {
    if (
      normalizedXP >=
      LEVEL_THRESHOLDS[i].xp
    ) {
      currentIndex = i;
    } else {
      break;
    }
  }

  const currentThreshold =
    LEVEL_THRESHOLDS[currentIndex];

  const nextThreshold =
    LEVEL_THRESHOLDS[currentIndex + 1];

  const currentLevel =
    currentThreshold.level;

  const currentXP = Math.max(
    0,
    normalizedXP - currentThreshold.xp
  );

  // Max level in the currently defined table
  if (!nextThreshold) {
    return {
      currentLevel,
      currentXP,
      xpNeeded: 0,
      progressPercentage: 100,
    };
  }

  const xpNeeded =
    nextThreshold.xp -
    currentThreshold.xp;

  const progressPercentage =
    xpNeeded > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentXP / xpNeeded) * 100
          )
        )
      : 100;

  return {
    currentLevel,
    currentXP,
    xpNeeded,
    progressPercentage,
  };
};

// =========================================
// Tree Stage
// =========================================

export const getTreeStage = (xp) => {
  const normalizedXP = Math.max(
    0,
    toSafeNumber(xp)
  );

  for (
    let i = TREE_STAGES.length - 1;
    i >= 0;
    i--
  ) {
    if (
      normalizedXP >= TREE_STAGES[i].xp
    ) {
      return TREE_STAGES[i];
    }
  }

  return TREE_STAGES[0];
};

// =========================================
// Streak
// =========================================

export const calculateCurrentStreak = (
  sessions
) => {
  const safeSessions =
    normalizeArray(sessions);

  if (safeSessions.length === 0) {
    return 0;
  }

  const validSessions =
    safeSessions.filter(
      (session) => {
        const date = new Date(
          session?.completedAt
        );

        return !Number.isNaN(
          date.getTime()
        );
      }
    );

  if (validSessions.length === 0) {
    return 0;
  }

  const dates = new Set();

  validSessions.forEach((session) => {
    const date = new Date(
      session.completedAt
    );

    dates.add(date.toDateString());
  });

  const sortedDates = Array.from(
    dates
  ).sort(
    (a, b) =>
      new Date(b).getTime() -
      new Date(a).getTime()
  );

  if (sortedDates.length === 0) {
    return 0;
  }

  const today =
    new Date().toDateString();

  const yesterday = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toDateString();

  if (
    sortedDates[0] !== today &&
    sortedDates[0] !== yesterday
  ) {
    return 0;
  }

  let streak = 1;

  let currentDate = new Date(
    sortedDates[0]
  );

  for (
    let i = 1;
    i < sortedDates.length;
    i++
  ) {
    const previousDate = new Date(
      sortedDates[i]
    );

    const diffTime =
      currentDate.getTime() -
      previousDate.getTime();

    const diffDays = Math.round(
      diffTime /
        (24 * 60 * 60 * 1000)
    );

    if (diffDays !== 1) {
      break;
    }

    streak++;
    currentDate = previousDate;
  }

  return streak;
};

// =========================================
// Fruits
// =========================================

export const getEarnedFruits = (level) => {
  const normalizedLevel = Math.max(
    1,
    toSafeNumber(level, 1)
  );

  return FRUIT_MILESTONES.filter(
    (milestone) =>
      normalizedLevel >= milestone.level
  );
};

// =========================================
// Season
// =========================================

export const getCurrentSeason = () => {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) {
    return SEASONS[0];
  }

  if (month >= 5 && month <= 7) {
    return SEASONS[1];
  }

  if (month >= 8 && month <= 10) {
    return SEASONS[2];
  }

  return SEASONS[3];
};

// =========================================
// Deterministic Position Helper
// =========================================

const getStablePosition = (
  id,
  index,
  count,
  width,
  height
) => {
  /*
   * Generate a deterministic value from the item's ID
   * instead of Math.random(), so positions remain stable
   * across React renders.
   */
  const source = String(
    id ?? index
  );

  let hash = 0;

  for (
    let i = 0;
    i < source.length;
    i++
  ) {
    hash =
      (hash * 31 +
        source.charCodeAt(i)) %
      100000;
  }

  const normalized =
    hash / 100000;

  const spread =
    count > 1
      ? index / (count - 1)
      : 0.5;

  const xBase =
    spread * 2 - 1;

  const xVariation =
    (normalized - 0.5) * 0.35;

  const x =
    (xBase + xVariation) *
    (width / 2);

  const y =
    -(50 + normalized * height);

  return {
    x,
    y,
  };
};

// =========================================
// Tree Data
// =========================================

export const calculateTreeData = (
  skills,
  sessions,
  achievements
) => {
  const safeSkills =
    normalizeArray(skills);

  const safeSessions =
    normalizeArray(sessions);

  const safeAchievements =
    normalizeArray(achievements);

  // =======================================
  // Skill Branches
  // =======================================

  const branches = safeSkills.map(
    (skill, index) => {
      const skillId =
        skill?._id ??
        skill?.id ??
        `skill-${index}`;

      const skillSessions =
        safeSessions.filter(
          (session) =>
            String(
              session?.skillId
            ) === String(skillId)
        );

      const totalMinutes =
        skillSessions.reduce(
          (sum, session) => {
            const duration =
              toSafeNumber(
                session?.duration
              );

            return sum + duration;
          },
          0
        );

      const branchLength =
        Math.min(
          100,
          Math.max(
            0,
            totalMinutes / 10
          )
        );

      const angle =
        safeSkills.length > 0
          ? (index /
              safeSkills.length) *
              180 -
            90
          : 0;

      return {
        id: skillId,
        name:
          skill?.name ||
          "Unnamed Skill",
        totalMinutes,
        totalSessions:
          skillSessions.length,
        branchLength,
        angle,
      };
    }
  );

  // =======================================
  // Leaves
  // =======================================

  const leaves =
    safeSessions.map(
      (session, index) => {
        const id =
          session?._id ??
          session?.id ??
          `session-${index}`;

        const position =
          getStablePosition(
            id,
            index,
            safeSessions.length,
            200,
            100
          );

        return {
          id,
          x: position.x,
          y: position.y,
        };
      }
    );

  // =======================================
  // Flowers
  // =======================================

  const flowers =
    safeAchievements.map(
      (achievement, index) => {
        const id =
          achievement?.id ??
          achievement?._id ??
          `achievement-${index}`;

        const position =
          getStablePosition(
            id,
            index,
            safeAchievements.length,
            160,
            80
          );

        return {
          id,
          x: position.x,
          y: position.y,
        };
      }
    );

  return {
    branches,
    leaves,
    flowers,
  };
};