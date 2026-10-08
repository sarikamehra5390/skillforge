const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Session = require("../models/Session");
const SanctuarySettings = require("../models/SanctuarySettings");
const auth = require("../middleware/auth");
const { calculateCurrentStreak } = require("../utils/gamification");
const router = express.Router();

const { isValidObjectId } = mongoose.Types;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_NOTIFICATION_KEYS = [
  "dailyReminders",
  "friendNotifications",
  "achievementNotifications",
  "gardenNotifications",
  "emailNotifications",
];

router.get("/test", (req, res) => {
  res.json({ message: "User Route Working" });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    if (typeof username !== "string" || username.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Username must be a non-empty string" });
    }

    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    try {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email is already registered. Please sign in." });
      }

      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ success: false, message: "Username is already taken. Please choose another." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        xp: 0,
        level: 1,
        streak: 0
      });

      const sanctuarySettings = await SanctuarySettings.create({
        userId: user._id,
        theme: "classic",
        treeType: "sprout",
        companion: null,
        music: ["fireflies"],
        decorations: []
      });

      console.log(`New user created: ${email}`);

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured on server");
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          sanctuarySettings
        }
      });
    } catch (innerError) {
      if (innerError.code === 11000) {
        const field = Object.keys(innerError.keyPattern)[0];
        return res.status(400).json({ 
          success: false, 
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use.` 
        });
      }
      throw innerError;
    }
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    let sanctuarySettings = await SanctuarySettings.findOne({ userId: user._id });
    if (!sanctuarySettings) {
      sanctuarySettings = await SanctuarySettings.create({
        userId: user._id,
        theme: "classic",
        treeType: "sprout",
        companion: null,
        music: ["fireflies"],
        decorations: []
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured on server");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        sanctuarySettings
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const allSessions = await Session.find({ userId: user._id });
    const currentStreak = calculateCurrentStreak(allSessions);
    
    if (user.streak !== currentStreak) {
      user.streak = currentStreak;
      if (currentStreak > (user.longestStreak || 0)) {
        user.longestStreak = currentStreak;
      }
      await user.save();
    }

    let sanctuarySettings = await SanctuarySettings.findOne({ userId: user._id });
    if (!sanctuarySettings) {
      sanctuarySettings = await SanctuarySettings.create({
        userId: user._id,
        theme: "classic",
        treeType: "sprout",
        companion: null,
        music: ["fireflies"],
        decorations: []
      });
    }
    
    const userWithSettings = {
      ...user.toObject(),
      sanctuarySettings
    };
    
    res.json(userWithSettings);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", auth, async (req, res) => {
  try {
    const searchTerm = req.query.q || req.query.query;
    if (!searchTerm) {
      return res.status(200).json([]);
    }

    const escapedTerm = escapeRegex(String(searchTerm));

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { username: { $regex: escapedTerm, $options: "i" } },
            { displayName: { $regex: escapedTerm, $options: "i" } },
          ],
        },
      ],
    }).select("username displayName avatar xp level streak longestStreak lastPracticeDate gardenId");

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const user = await User.findById(userId).select("-password -email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const plainUser = user.toObject();
    res.json({
      username: plainUser.username,
      displayName: plainUser.displayName,
      avatar: plainUser.avatar,
      bio: plainUser.bio,
      level: plainUser.level,
      xp: plainUser.xp,
      streak: plainUser.streak,
      unlockedAchievements: plainUser.unlockedAchievements,
      createdAt: plainUser.createdAt,
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    const { username, email, password, avatar, displayName, notificationSettings } = req.body;
    const updateData = {};

    if (username) {
      if (typeof username !== "string" || username.trim().length === 0) {
        return res.status(400).json({ message: "Username must be a non-empty string" });
      }
      const existingUsername = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      updateData.username = username;
    }
    if (email) {
      if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const existingEmail = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already taken" });
      }
      updateData.email = email;
    }
    if (password) {
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    if (avatar) updateData.avatar = avatar;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (notificationSettings !== undefined) {
      if (typeof notificationSettings !== "object" || notificationSettings === null || Array.isArray(notificationSettings)) {
        return res.status(400).json({ message: "notificationSettings must be an object" });
      }
      const validatedSettings = {};
      for (const key of ALLOWED_NOTIFICATION_KEYS) {
        if (notificationSettings[key] !== undefined) {
          if (typeof notificationSettings[key] !== "boolean") {
            return res.status(400).json({ message: `notificationSettings.${key} must be a boolean` });
          }
          validatedSettings[key] = notificationSettings[key];
        }
      }
      if (Object.keys(validatedSettings).length > 0) {
        for (const [key, value] of Object.entries(validatedSettings)) {
          updateData[`notificationSettings.${key}`] = value;
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, 
      updateData, 
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
