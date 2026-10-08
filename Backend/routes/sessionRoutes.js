const express = require("express");
const mongoose = require("mongoose");
const Session = require("../models/Session");
const Skill = require("../models/Skill");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const { calculateLevel, calculateCurrentStreak, ACHIEVEMENTS } = require("../utils/gamification");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ completedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { skillId, duration, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({ message: "Invalid skillId" });
    }

    if (!Number.isInteger(duration) || duration < 1 || duration > 480) {
      return res.status(400).json({ message: "Duration must be an integer between 1 and 480 minutes" });
    }

    const skill = await Skill.findOne({ _id: skillId, userId: req.user._id });
    if (!skill) return res.status(404).json({ message: "Skill not found" });

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

    skill.totalSessions += 1;
    skill.lastPracticed = new Date();
    skill.progress = Math.min(100, skill.progress + 2);
    const skillSessions = await Session.find({ skillId: skill._id, userId: req.user._id });
    const totalSkillMinutes = skillSessions.reduce((a, s) => a + (s.duration || 0), 0);
    skill.totalMinutes = totalSkillMinutes;
    await skill.save();

    const user = req.user;
    user.xp += xpGained;
    const oldLevel = user.level;
    
    const newLevel = calculateLevel(user.xp);
    user.level = newLevel;

    const allSessions = await Session.find({ userId: user._id });
    const newStreak = calculateCurrentStreak(allSessions);
    user.streak = newStreak;
    user.lastPracticeDate = new Date();

    if (user.streak > (user.longestStreak || 0)) {
      user.longestStreak = user.streak;
    }

    const newUnlockedAchievements = [];
    ACHIEVEMENTS.forEach(achievement => {
      if (user.xp >= achievement.xpRequired && !user.unlockedAchievements.includes(achievement.id)) {
        user.unlockedAchievements.push(achievement.id);
        newUnlockedAchievements.push(achievement);
      }
    });

    await user.save();

    if (newLevel > oldLevel) {
      await Notification.create({
        userId: user._id,
        title: "Level Up!",
        message: `You reached Level ${newLevel}!`,
        type: "levelup"
      });
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
      await Activity.create({
        userId: user._id,
        type: "achievement",
        description: `${user.username} unlocked ${achievement.title}!`,
        metadata: { achievement },
      });
    }

    await Activity.create({
      userId: user._id,
      type: "session",
      description: `${user.username} practiced ${skill.name} for ${duration} minutes!`,
      metadata: { skillId, skillName: skill.name, duration },
    });

    if (newStreak > 0 && newStreak % 7 === 0) {
      await Notification.create({
        userId: user._id,
        title: "Streak Milestone!",
        message: `You reached a ${newStreak} day streak!`,
        type: "streak"
      });
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

router.put("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const { duration, notes } = req.body;
    const oldDuration = session.duration || 0;

    let newDuration = oldDuration;
    if (duration !== undefined) {
      if (!Number.isInteger(duration) || duration < 1 || duration > 480) {
        return res.status(400).json({ message: "Duration must be an integer between 1 and 480 minutes" });
      }
      newDuration = duration;
    }
    const durationDelta = newDuration - oldDuration;

    if (durationDelta !== 0) {
      const user = req.user;
      user.xp = Math.max(0, user.xp + durationDelta);
      user.level = calculateLevel(user.xp);
      const allSessions = await Session.find({ userId: user._id });
      const newStreak = calculateCurrentStreak(allSessions);
      user.streak = Math.max(user.streak, newStreak);
      await user.save();

      if (session.skillId) {
        const skill = await Skill.findOne({ _id: session.skillId, userId: req.user._id });
        if (skill) {
          const skillSessions = await Session.find({ skillId: skill._id, userId: req.user._id, _id: { $ne: session._id } });
          const totalSkillMinutes = skillSessions.reduce((a, s) => a + (s.duration || 0), 0) + newDuration;
          skill.totalMinutes = totalSkillMinutes;
          await skill.save();
        }
      }
    }

    session.duration = newDuration;
    session.xpGained = newDuration;
    if (notes !== undefined) session.notes = notes;
    session.completedAt = session.completedAt || new Date();

    const updated = await session.save();
    res.json(updated);
  } catch (error) {
    console.error("PUT SESSION ERROR:", error);
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const duration = session.duration || 0;

    if (session.skillId) {
      const skill = await Skill.findOne({ _id: session.skillId, userId: req.user._id });
      if (skill) {
        const remainingSessions = await Session.countDocuments({ skillId: skill._id, userId: req.user._id, _id: { $ne: session._id } });
        skill.totalSessions = Math.max(0, remainingSessions);
        skill.totalMinutes = Math.max(0, (skill.totalMinutes || 0) - duration);
        skill.progress = Math.max(0, skill.progress - 2);
        await skill.save();
      }
    }

    await session.deleteOne();

    const user = req.user;
    user.xp = Math.max(0, user.xp - duration);
    user.level = calculateLevel(user.xp);
    const allSessions = await Session.find({ userId: user._id });
    user.streak = calculateCurrentStreak(allSessions);
    await user.save();

    res.json({ message: "Session deleted" });
  } catch (error) {
    console.error("DELETE SESSION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
