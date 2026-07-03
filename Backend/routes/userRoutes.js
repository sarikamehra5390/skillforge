const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Session = require("../models/Session");
const SanctuarySettings = require("../models/SanctuarySettings");
const auth = require("../middleware/auth");
const { calculateCurrentStreak } = require("../utils/gamification");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "User Route Working" });
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    // Use try-catch specifically for the creation to handle unique constraint errors
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

      // Create default sanctuary settings for new user
      const sanctuarySettings = await SanctuarySettings.create({
        userId: user._id,
        theme: "classic",
        treeType: "sprout",
        companion: null, // None
        music: ["fireflies"],
        decorations: []
      });

      console.log(`New user created: ${email}`);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

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
      throw innerError; // Re-throw for outer catch
    }
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Get or create sanctuary settings
    let sanctuarySettings = await SanctuarySettings.findOne({ userId: user._id });
    if (!sanctuarySettings) {
      sanctuarySettings = await SanctuarySettings.create({
        userId: user._id,
        theme: "classic",
        treeType: "sprout",
        companion: null, // None
        music: ["fireflies"],
        decorations: []
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

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

// Get Profile
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

    // Get or create sanctuary settings
    let sanctuarySettings = await SanctuarySettings.findOne({ userId: user._id });
    if (!sanctuarySettings) {
      sanctuarySettings = await SanctuarySettings.create({
        userId: user._id,
        theme: "classic",
        treeType: "sprout",
        companion: null, // None
        music: ["fireflies"],
        decorations: []
      });
    }
    
    // Combine user with sanctuary settings
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

// Search users
router.get("/search", auth, async (req, res) => {
  try {
    const searchTerm = req.query.q || req.query.query;
    if (!searchTerm) {
      return res.status(200).json([]); // Return empty if no query
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { username: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
            { displayName: { $regex: searchTerm, $options: "i" } },
          ],
        },
      ],
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get public user profile
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { username, email, password, avatar, displayName, notificationSettings } = req.body;
    const updateData = {};

    if (username) {
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
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    if (avatar) updateData.avatar = avatar;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (notificationSettings) updateData.notificationSettings = notificationSettings;

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
