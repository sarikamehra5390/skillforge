const express = require("express");
const SanctuarySettings = require("../models/SanctuarySettings");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Get sanctuary settings for user
router.get("/", auth, async (req, res) => {
  try {
    let settings = await SanctuarySettings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = new SanctuarySettings({ userId: req.user._id });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error("GET sanctuary settings error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get public sanctuary settings for a user
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    let settings = await SanctuarySettings.findOne({ userId });
    if (!settings) {
      // Return default settings if none exist
      settings = new SanctuarySettings({ userId });
    }
    res.json(settings);
  } catch (error) {
    console.error("GET public sanctuary settings error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update sanctuary settings
router.put("/", auth, async (req, res) => {
  try {
    const { theme, treeType, companion, music, decorations, avatarColor, title } = req.body;
    const user = await User.findById(req.user._id);
    const userLevel = user.level;

    // Validate tree unlock
    const treeUnlockLevels = {
      sprout: 0,
      classic: 2,
      sakura: 5,
      autumn: 8,
      winter: 10,
      cosmic: 15,
      golden: 20,
    };
    if (treeType && userLevel < treeUnlockLevels[treeType]) {
      return res.status(403).json({ message: "Tree type not unlocked yet" });
    }

    // Validate title unlock
    const titleUnlockXPs = {
      beginner: 0,
      "streak-master": 500,
      "tree-keeper": 1000,
      "forest-guardian": 2500,
      "ancient-sage": 5000,
      "world-tree-guardian": 10000,
    };
    if (title && user.xp < titleUnlockXPs[title]) {
      return res.status(403).json({ message: "Title not unlocked yet" });
    }

    let settings = await SanctuarySettings.findOneAndUpdate(
      { userId: req.user._id },
      { theme, treeType, companion, music, decorations, avatarColor, title },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    console.error("UPDATE sanctuary settings error:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;