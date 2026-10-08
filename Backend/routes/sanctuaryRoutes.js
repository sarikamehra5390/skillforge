const express = require("express");
const mongoose = require("mongoose");
const SanctuarySettings = require("../models/SanctuarySettings");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const { isValidObjectId } = mongoose.Types;

const VALID_THEMES = [
  "classic",
  "sunset-garden",
  "moonlit-forest",
  "sakura-valley",
  "ghibli-sky",
  "rainy-evening",
  "starry-meadow",
];

const VALID_TREE_TYPES = [
  "sprout",
  "classic",
  "sakura",
  "autumn",
  "winter",
  "cosmic",
  "golden",
];

const VALID_COMPANIONS = [
  null,
  "blue-bird",
  "fox",
  "cat",
  "bunny",
  "deer",
  "owl",
  "baby-dragon",
  "fire-spirit",
];

const VALID_PROFILE_FRAMES = [
  "none",
  "gold",
  "silver",
  "bronze",
];

const VALID_TITLES = [
  "beginner",
  "streak-master",
  "tree-keeper",
  "forest-guardian",
  "ancient-sage",
  "world-tree-guardian",
];

const VALID_MUSIC = [
  "fireflies",
  "rain",
  "snow",
  "leaves",
  "wind",
  "fog",
  "stars",
  "birds",
  "night-mode",
  "nature-sounds",
  "rain-sounds",
  "bird-sounds",
  "wind-sounds",
];

const VALID_DECORATIONS = [
  "lanterns",
  "flowers",
  "butterflies",
  "bridge",
  "campfire",
  "bench",
  "crystals",
  "wind-chimes",
  "waterfall",
  "stone-path",
];

const PUBLIC_SANCTUARY_FIELDS = [
  "theme",
  "treeType",
  "companion",
  "music",
  "decorations",
  "displayName",
  "avatar",
  "bio",
  "favoriteSkill",
  "profileFrame",
  "avatarColor",
  "title",
];

const TEXT_FIELDS = [
  "displayName",
  "avatar",
  "bio",
  "favoriteSkill",
  "avatarColor",
];

const TREE_UNLOCK_LEVELS = {
  sprout: 0,
  classic: 2,
  sakura: 5,
  autumn: 8,
  winter: 10,
  cosmic: 15,
  golden: 20,
};

const TITLE_UNLOCK_XPS = {
  beginner: 0,
  "streak-master": 500,
  "tree-keeper": 1000,
  "forest-guardian": 2500,
  "ancient-sage": 5000,
  "world-tree-guardian": 10000,
};

// Get current user's sanctuary settings
router.get("/", auth, async (req, res) => {
  try {
    let settings = await SanctuarySettings.findOne({
      userId: req.user._id,
    });

    if (!settings) {
      settings = await SanctuarySettings.create({
        userId: req.user._id,
      });
    }

    return res.json(settings);
  } catch (error) {
    console.error("GET sanctuary settings error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch sanctuary settings",
    });
  }
});

// Get another user's public sanctuary settings
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const settings = await SanctuarySettings.findOne({
      userId,
    }).lean();

    if (!settings) {
      return res.status(404).json({
        message: "Sanctuary settings not found",
      });
    }

    const publicSettings = {};

    for (const field of PUBLIC_SANCTUARY_FIELDS) {
      publicSettings[field] = settings[field];
    }

    return res.json(publicSettings);
  } catch (error) {
    console.error("GET public sanctuary settings error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch public sanctuary settings",
    });
  }
});

// Update current user's sanctuary settings
router.put("/", auth, async (req, res) => {
  try {
    const updateData = {};

    // Theme
    if (req.body.theme !== undefined) {
      if (!VALID_THEMES.includes(req.body.theme)) {
        return res.status(400).json({
          message: `Invalid theme value: ${req.body.theme}`,
        });
      }

      updateData.theme = req.body.theme;
    }

    // Tree
    if (req.body.treeType !== undefined) {
      if (!VALID_TREE_TYPES.includes(req.body.treeType)) {
        return res.status(400).json({
          message: `Invalid treeType value: ${req.body.treeType}`,
        });
      }

      updateData.treeType = req.body.treeType;
    }

    // Companion
    if (req.body.companion !== undefined) {
      if (!VALID_COMPANIONS.includes(req.body.companion)) {
        return res.status(400).json({
          message: `Invalid companion value: ${req.body.companion}`,
        });
      }

      updateData.companion = req.body.companion;
    }

    // Profile frame
    if (req.body.profileFrame !== undefined) {
      if (!VALID_PROFILE_FRAMES.includes(req.body.profileFrame)) {
        return res.status(400).json({
          message: `Invalid profileFrame value: ${req.body.profileFrame}`,
        });
      }

      updateData.profileFrame = req.body.profileFrame;
    }

    // Title
    if (req.body.title !== undefined) {
      if (!VALID_TITLES.includes(req.body.title)) {
        return res.status(400).json({
          message: `Invalid title value: ${req.body.title}`,
        });
      }

      updateData.title = req.body.title;
    }

    // Music
    if (req.body.music !== undefined) {
      if (!Array.isArray(req.body.music)) {
        return res.status(400).json({
          message: "music must be an array",
        });
      }

      const invalidMusic = req.body.music.find(
        (item) => !VALID_MUSIC.includes(item)
      );

      if (invalidMusic) {
        return res.status(400).json({
          message: `Invalid music value: ${invalidMusic}`,
        });
      }

      updateData.music = req.body.music;
    }

    // Decorations
    if (req.body.decorations !== undefined) {
      if (!Array.isArray(req.body.decorations)) {
        return res.status(400).json({
          message: "decorations must be an array",
        });
      }

      const invalidDecoration = req.body.decorations.find(
        (item) => !VALID_DECORATIONS.includes(item)
      );

      if (invalidDecoration) {
        return res.status(400).json({
          message: `Invalid decorations value: ${invalidDecoration}`,
        });
      }

      updateData.decorations = req.body.decorations;
    }

    // Text fields
    for (const field of TEXT_FIELDS) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            message: `${field} must be a string`,
          });
        }

        updateData[field] = req.body[field].trim();
      }
    }

    // Get current user
    const user = await User.findById(req.user._id).select(
      "level xp"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Check tree unlock level
    if (updateData.treeType) {
      const requiredLevel =
        TREE_UNLOCK_LEVELS[updateData.treeType];

      if (user.level < requiredLevel) {
        return res.status(403).json({
          message: "Tree type not unlocked yet",
        });
      }
    }

    // Check title unlock XP
    if (updateData.title) {
      const requiredXP = TITLE_UNLOCK_XPS[updateData.title];

      if (user.xp < requiredXP) {
        return res.status(403).json({
          message: "Title not unlocked yet",
        });
      }
    }

    // Find or create settings
    let settings = await SanctuarySettings.findOne({
      userId: req.user._id,
    });

    if (!settings) {
      settings = new SanctuarySettings({
        userId: req.user._id,
        ...updateData,
      });
    } else {
      Object.assign(settings, updateData);
    }

    await settings.save();

    return res.json(settings);
  } catch (error) {
    console.error("UPDATE sanctuary settings error:", error);

    return res.status(400).json({
      message: error.message || "Failed to update sanctuary settings",
    });
  }
});

module.exports = router;