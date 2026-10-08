const express = require("express");
const auth = require("../middleware/auth");
const Session = require("../models/Session");
const Skill = require("../models/Skill");
const { ACHIEVEMENTS, calculateCurrentStreak, calculateLevel } = require("../utils/gamification");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const [sessions, skills] = await Promise.all([
      Session.find({ userId: req.user._id }),
      Skill.find({ userId: req.user._id }),
    ]);

    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const maxDuration = sessions.length ? Math.max(...sessions.map((s) => s.duration || 0)) : 0;
    const streak = calculateCurrentStreak(sessions);
    const level = calculateLevel(req.user.xp);

    const totalXP = req.user.xp || 0;

    const derivedAchievements = [
      { id: "first-step", title: "First Step", description: "Complete your first practice session", rarity: "Common", xp: 50, unlocked: sessions.length >= 1 },
      { id: "habit-builder", title: "Habit Builder", description: "Maintain a 3-day practice streak", rarity: "Common", xp: 100, unlocked: streak >= 3 },
      { id: "deep-focus", title: "Deep Focus", description: "Complete a session longer than 60 minutes", rarity: "Uncommon", xp: 200, unlocked: maxDuration >= 60 },
      { id: "skill-collector", title: "Skill Collector", description: "Add 5 different skills to your forge", rarity: "Uncommon", xp: 250, unlocked: skills.length >= 5 },
      { id: "mastery-initiate", title: "Mastery Initiate", description: "Reach Level 5", rarity: "Rare", xp: 500, unlocked: level >= 5 },
      { id: "unstoppable", title: "Unstoppable", description: "Maintain a 7-day practice streak", rarity: "Epic", xp: 1000, unlocked: streak >= 7 },
    ];

    const xpAchievements = ACHIEVEMENTS.map((a, idx) => {
      const rarities = ["Common", "Common", "Rare", "Epic", "Legendary"];
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        rarity: rarities[idx] || "Rare",
        xp: a.xpRequired,
        unlocked: totalXP >= a.xpRequired,
      };
    });

    const allAchievements = [...derivedAchievements, ...xpAchievements];
    const unlockedCount = allAchievements.filter((a) => a.unlocked).length;
    const totalAchievements = allAchievements.length;

    res.json({
      stats: {
        totalXP,
        totalAchievements,
        unlockedCount,
        totalSessions: sessions.length,
        totalSkills: skills.length,
        totalDuration,
        maxDuration,
        streak,
        level,
        longestStreak: req.user.longestStreak || streak,
      },
      achievements: allAchievements,
    });
  } catch (error) {
    console.error("GET achievements error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
