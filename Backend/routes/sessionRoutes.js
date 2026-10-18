const express = require("express");
const mongoose = require("mongoose");
const Session = require("../models/Session");
const Skill = require("../models/Skill");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const { calculateLevel, calculateStreakState, ACHIEVEMENTS } = require("../utils/gamification");
const router = express.Router();

const createOptionalRecord = async (Model, record, label) => {
  try {
    await Model.create(record);
  } catch (error) {
    // Session, XP and streak persistence are primary; feed/notification writes
    // must not turn a committed practice session into an apparent API failure.
    console.error(`${label} write failed:`, error);
  }
};

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

    const oldLevel = req.user.level;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { xp: xpGained } },
      { new: true }
    );
    const newLevel = calculateLevel(user.xp);
    user.level = newLevel;

    const allSessions = await Session.find({ userId: user._id });
    const streakState = calculateStreakState(allSessions);
    const newStreak = streakState.streak;
    user.streak = newStreak;
    user.lastPracticeDate = streakState.lastPracticeDate;
    user.longestStreak = Math.max(user.longestStreak || 0, streakState.longestStreak, newStreak);

    const newUnlockedAchievements = [];
    for (const achievement of ACHIEVEMENTS) {
      if (user.xp < achievement.xpRequired) continue;
      const claimed = await User.updateOne(
        {
          _id: user._id,
          xp: { $gte: achievement.xpRequired },
          unlockedAchievements: { $ne: achievement.id },
        },
        { $addToSet: { unlockedAchievements: achievement.id } }
      );
      if (claimed.modifiedCount === 1) newUnlockedAchievements.push(achievement);
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { level: newLevel } }
    );

    await User.updateOne(
      {
        _id: user._id,
        $or: [
          { lastPracticeDate: { $exists: false } },
          { lastPracticeDate: null },
          { lastPracticeDate: { $lte: streakState.lastPracticeDate } },
        ],
      },
      {
        $set: { streak: newStreak, lastPracticeDate: streakState.lastPracticeDate },
        $max: { longestStreak: user.longestStreak },
      }
    );

    // If two session requests finish out of order, don't return or retain the
    // older snapshot over a newer practice day written by the other request.
    const persistedUser = await User.findById(user._id).select("xp level streak longestStreak");

    if (newLevel > oldLevel) {
      await createOptionalRecord(Notification, {
        userId: user._id,
        title: "Level Up!",
        message: `You reached Level ${newLevel}!`,
        type: "levelup"
      }, "Level-up notification");
      await createOptionalRecord(Activity, {
        userId: user._id,
        type: "level",
        description: `${user.username} reached Level ${newLevel}!`,
        metadata: { level: newLevel },
      }, "Level-up activity");
    }

    for (const achievement of newUnlockedAchievements) {
      await createOptionalRecord(Notification, {
        userId: user._id,
        title: "Achievement Unlocked!",
        message: achievement.title,
        type: "achievement"
      }, "Achievement notification");
      await createOptionalRecord(Activity, {
        userId: user._id,
        type: "achievement",
        description: `${user.username} unlocked ${achievement.title}!`,
        metadata: { achievement },
      }, "Achievement activity");
    }

    await createOptionalRecord(Activity, {
      userId: user._id,
      type: "session",
      description: `${user.username} practiced ${skill.name} for ${duration} minutes!`,
      metadata: { skillId, skillName: skill.name, duration },
    }, "Practice activity");

    if (newStreak > 0 && newStreak % 7 === 0) {
      await createOptionalRecord(Notification, {
        userId: user._id,
        title: "Streak Milestone!",
        message: `You reached a ${newStreak} day streak!`,
        type: "streak"
      }, "Streak notification");
      await createOptionalRecord(Activity, {
        userId: user._id,
        type: "streak",
        description: `${user.username} reached a ${newStreak} day streak!`,
        metadata: { streak: newStreak },
      }, "Streak activity");
    }

    res.status(201).json({
      session: newSession,
      xpGained,
      levelUp: newLevel > oldLevel,
      newLevel: persistedUser?.level ?? user.level,
      newStreak: persistedUser?.streak ?? user.streak,
      xp: persistedUser?.xp ?? user.xp,
      longestStreak: persistedUser?.longestStreak ?? user.longestStreak,
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
    const oldXPGained = Number.isFinite(Number(session.xpGained))
      ? Number(session.xpGained)
      : oldDuration;

    let newDuration = oldDuration;
    if (duration !== undefined) {
      if (!Number.isInteger(duration) || duration < 1 || duration > 480) {
        return res.status(400).json({ message: "Duration must be an integer between 1 and 480 minutes" });
      }
      newDuration = duration;
    }
    const durationDelta = newDuration - oldDuration;
    const xpDelta = newDuration - oldXPGained;

    if (durationDelta !== 0) {
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
    const user = xpDelta !== 0
      ? await User.findByIdAndUpdate(req.user._id, [{ $set: { xp: { $max: [0, { $add: [{ $ifNull: ["$xp", 0] }, xpDelta] }] } } }], { new: true })
      : await User.findById(req.user._id);
    const allSessions = await Session.find({ userId: req.user._id });
    user.xp = Math.max(0, user.xp || 0);
    user.level = calculateLevel(user.xp);
    const streakState = calculateStreakState(allSessions);
    user.streak = streakState.streak;
    user.longestStreak = Math.max(user.longestStreak || 0, streakState.longestStreak);
    user.lastPracticeDate = streakState.lastPracticeDate;
    await User.updateOne(
      { _id: user._id },
      {
        $set: { level: user.level, streak: user.streak, lastPracticeDate: streakState.lastPracticeDate },
        $max: { longestStreak: user.longestStreak },
      }
    );
    res.json({ ...updated.toObject(), xp: user.xp, level: user.level, streak: user.streak, longestStreak: user.longestStreak });
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
    const xpToReverse = Number.isFinite(Number(session.xpGained))
      ? Number(session.xpGained)
      : duration;

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

    const user = await User.findByIdAndUpdate(req.user._id, [{ $set: { xp: { $max: [0, { $subtract: [{ $ifNull: ["$xp", 0] }, xpToReverse] }] } } }], { new: true });
    user.level = calculateLevel(user.xp);
    const allSessions = await Session.find({ userId: user._id });
    const streakState = calculateStreakState(allSessions);
    user.streak = streakState.streak;
    user.longestStreak = Math.max(user.longestStreak || 0, streakState.longestStreak);
    user.lastPracticeDate = streakState.lastPracticeDate;
    await User.updateOne(
      { _id: user._id },
      {
        $set: { level: user.level, streak: user.streak, lastPracticeDate: streakState.lastPracticeDate },
        $max: { longestStreak: user.longestStreak },
      }
    );

    res.json({ message: "Session deleted", xp: user.xp, level: user.level, streak: user.streak, longestStreak: user.longestStreak });
  } catch (error) {
    console.error("DELETE SESSION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
