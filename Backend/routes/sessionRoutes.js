const express = require("express");
const Session = require("../models/Session");
const Skill = require("../models/Skill");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const { calculateLevel, calculateCurrentStreak, ACHIEVEMENTS } = require("../utils/gamification");
const router = express.Router();

// Get all sessions for current user
router.get("/", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ completedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add new session
router.post("/", auth, async (req, res) => {
  try {
    const { skillId, duration, notes } = req.body;
    
    const skill = await Skill.findOne({ _id: skillId, userId: req.user._id });
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    // XP formula: 1 XP per 1 minute
    const xpGained = duration;
    
    const session = new Session({
      userId: req.user._id,
      skillId,
      skillName: skill.name,
      duration,
      notes,
      xpGained
    });

    const newSession = await session.save();

    // Update Skill progress and total sessions
    skill.totalSessions += 1;
    skill.lastPracticed = new Date();
    // Simple progress logic: +2% per session, max 100
    skill.progress = Math.min(100, skill.progress + 2);
    await skill.save();

    // Update User
    const user = req.user;
    user.xp += xpGained;
    const oldLevel = user.level;
    
    // Calculate new level
    const newLevel = calculateLevel(user.xp);
    user.level = newLevel;

    // Get all user sessions to calculate streak
    const allSessions = await Session.find({ userId: user._id });
    const newStreak = calculateCurrentStreak(allSessions);
    user.streak = newStreak;
    user.lastPracticeDate = new Date();

    // Update longest streak
    if (user.streak > (user.longestStreak || 0)) {
      user.longestStreak = user.streak;
    }

    // Check for new achievements to unlock
    const newUnlockedAchievements = [];
    ACHIEVEMENTS.forEach(achievement => {
      if (user.xp >= achievement.xpRequired && !user.unlockedAchievements.includes(achievement.id)) {
        user.unlockedAchievements.push(achievement.id);
        newUnlockedAchievements.push(achievement);
      }
    });

    await user.save();

    // Create notifications
    if (newLevel > oldLevel) {
      await Notification.create({
        userId: user._id,
        title: "Level Up!",
        message: `You reached Level ${newLevel}!`,
        type: "levelup"
      });
      // Create activity for level up
      await Activity.create({
        userId: user._id,
        type: "level",
        description: `${user.username} reached Level ${newLevel}!`,
        metadata: { level: newLevel },
      });
    }

    for (const achievement of newUnlockedAchievements) {
      await Notification.create({
        userId: user._id,
        title: "Achievement Unlocked!",
        message: achievement.title,
        type: "achievement"
      });
      // Create activity for achievement
      await Activity.create({
        userId: user._id,
        type: "achievement",
        description: `${user.username} unlocked ${achievement.title}!`,
        metadata: { achievement },
      });
    }

    // Create activity for session
    await Activity.create({
      userId: user._id,
      type: "session",
      description: `${user.username} practiced ${skill.name} for ${duration} minutes!`,
      metadata: { skillId, skillName: skill.name, duration },
    });

    // If it's a streak milestone
    if (newStreak > 0 && newStreak % 7 === 0) {
      await Activity.create({
        userId: user._id,
        type: "streak",
        description: `${user.username} reached a ${newStreak} day streak!`,
        metadata: { streak: newStreak },
      });
    }

    res.status(201).json({
      session: newSession,
      xpGained,
      levelUp: newLevel > oldLevel,
      newLevel: user.level,
      newStreak: user.streak,
      newUnlockedAchievements
    });
  } catch (error) {
    console.error("POST SESSION ERROR:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
