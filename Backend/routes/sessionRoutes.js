const express = require("express");
const Session = require("../models/Session");
const Skill = require("../models/Skill");
const User = require("../models/User");
const auth = require("../middleware/auth");
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

    // Calculate XP: 1 XP per minute + bonus for longer sessions
    const xpGained = Math.floor(duration * 1.5);
    
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

    // Update User XP and Level
    const user = req.user;
    user.xp += xpGained;
    
    // Level up logic: every 500 XP = 1 level
    const newLevel = Math.floor(user.xp / 500) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    // Streak logic
    const today = new Date().setHours(0, 0, 0, 0);
    const lastDate = user.lastPracticeDate ? new Date(user.lastPracticeDate).setHours(0, 0, 0, 0) : null;
    
    if (!lastDate) {
      user.streak = 1;
    } else if (today === lastDate) {
      // Already practiced today, streak remains same
    } else if (today - lastDate === 86400000) {
      // Practiced yesterday, increment streak
      user.streak += 1;
    } else {
      // Streak broken
      user.streak = 1;
    }
    
    user.lastPracticeDate = new Date();
    await user.save();

    res.status(201).json({
      session: newSession,
      xpGained,
      levelUp: newLevel > user.level - 1,
      newLevel: user.level,
      newStreak: user.streak
    });
  } catch (error) {
    console.error("POST SESSION ERROR:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
