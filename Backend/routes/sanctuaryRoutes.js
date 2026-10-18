const express = require("express");
const mongoose = require("mongoose");
const SanctuarySettings = require("../models/SanctuarySettings");
const User = require("../models/User");
const auth = require("../middleware/auth");
const isValidObjectId = require("../utils/isValidObjectId");

const router = express.Router();

const VALID_THEMES = [
  "classic",
  "sunset-garden",
  "moonlit-forest",
  "sakura-valley",
  "ghibli-sky",
  "rainy-evening",
  "starry-meadow",
  "night-sanctuary",
  "evening-sanctuary",
  "aurora-sanctuary",
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

const VALID_TREE_AURAS = [
  "none",
  "soft-glow",
  "magical-glow",
  "celestial-glow",
];

const VALID_PARTICLE_INTENSITIES = ["off", "low", "medium", "high"];
const VALID_GLOW_INTENSITIES = ["subtle", "balanced", "magical"];
const VALID_ATMOSPHERES = ["clear", "misty", "starry", "rainy"];
const VALID_CARD_SPACINGS = ["compact", "comfortable"];
const VALID_SOUND_IDS = ["rain", "wind", "birds", "nature", "ocean", "fireplace", "white-noise", "pink-noise", "brown-noise"];

const PUBLIC_SANCTUARY_FIELDS = [
  "theme",
  "treeType",
  "treeAura",
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

    if (req.body.treeAura !== undefined) {
      if (!VALID_TREE_AURAS.includes(req.body.treeAura)) {
        return res.status(400).json({
          message: "Invalid treeAura value",
        });
      }
      updateData.treeAura = req.body.treeAura;
    }

    for (const field of ["ambientEffects", "reducedMotion"]) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "boolean") {
          return res.status(400).json({
            message: `${field} must be a boolean`,
          });
        }
        updateData[field] = req.body[field];
      }
    }

    const enumFields = [
      ["particleIntensity", VALID_PARTICLE_INTENSITIES],
      ["glowIntensity", VALID_GLOW_INTENSITIES],
      ["backgroundAtmosphere", VALID_ATMOSPHERES],
      ["cardSpacing", VALID_CARD_SPACINGS],
    ];
    for (const [field, allowed] of enumFields) {
      if (req.body[field] !== undefined) {
        if (!allowed.includes(req.body[field])) {
          return res.status(400).json({ message: `Invalid ${field} value` });
        }
        updateData[field] = req.body[field];
      }
    }

    if (req.body.audioVolume !== undefined) {
      if (typeof req.body.audioVolume !== "number" || !Number.isFinite(req.body.audioVolume) || req.body.audioVolume < 0 || req.body.audioVolume > 1) {
        return res.status(400).json({ message: "audioVolume must be a number between 0 and 1" });
      }
      updateData.audioVolume = req.body.audioVolume;
    }

    if (req.body.audioMuted !== undefined) {
      if (typeof req.body.audioMuted !== "boolean") {
        return res.status(400).json({ message: "audioMuted must be a boolean" });
      }
      updateData.audioMuted = req.body.audioMuted;
    }

    if (req.body.seasonalWorld !== undefined) {
      if (!["", "spring", "summer", "autumn", "winter"].includes(req.body.seasonalWorld)) {
        return res.status(400).json({ message: "Invalid seasonalWorld value" });
      }
      updateData.seasonalWorld = req.body.seasonalWorld;
    }

    if (req.body.seasonalAuto !== undefined) {
      if (typeof req.body.seasonalAuto !== "boolean") return res.status(400).json({ message: "seasonalAuto must be a boolean" });
      updateData.seasonalAuto = req.body.seasonalAuto;
    }

    if (req.body.seasonalHemisphere !== undefined) {
      if (!["north", "south"].includes(req.body.seasonalHemisphere)) return res.status(400).json({ message: "seasonalHemisphere must be north or south" });
      updateData.seasonalHemisphere = req.body.seasonalHemisphere;
    }

    if (req.body.ambienceIntensity !== undefined) {
      if (!["minimal", "balanced", "immersive"].includes(req.body.ambienceIntensity)) {
        return res.status(400).json({ message: "Invalid ambienceIntensity value" });
      }
      updateData.ambienceIntensity = req.body.ambienceIntensity;
    }

    if (req.body.audioLayers !== undefined) {
      if (!Array.isArray(req.body.audioLayers) || req.body.audioLayers.length > 8) {
        return res.status(400).json({ message: "audioLayers must be an array with at most 8 entries" });
      }
      const seen = new Set();
      const layers = [];
      for (const layer of req.body.audioLayers) {
        if (!layer || typeof layer !== "object" || !VALID_SOUND_IDS.includes(layer.soundId) || seen.has(layer.soundId)) {
          return res.status(400).json({ message: "audioLayers contains an invalid or duplicate sound" });
        }
        if (typeof layer.volume !== "number" || !Number.isFinite(layer.volume) || layer.volume < 0 || layer.volume > 1 || (layer.muted !== undefined && typeof layer.muted !== "boolean")) {
          return res.status(400).json({ message: "Each audio layer needs a volume from 0 to 1 and an optional muted flag" });
        }
        seen.add(layer.soundId);
        layers.push({ soundId: layer.soundId, volume: layer.volume, muted: layer.muted === true });
      }
      updateData.audioLayers = layers;
      updateData.audioTrack = layers[0]?.soundId || "none";
    } else if (req.body.audioTrack !== undefined) {
      if (req.body.audioTrack !== "none" && !VALID_SOUND_IDS.includes(req.body.audioTrack)) {
        return res.status(400).json({ message: "Invalid audioTrack value" });
      }
      updateData.audioTrack = req.body.audioTrack;
      updateData.audioLayers = req.body.audioTrack === "none" ? [] : [{ soundId: req.body.audioTrack, volume: 1, muted: false }];
    }

    const masterVolume = req.body.masterVolume !== undefined ? req.body.masterVolume : req.body.audioVolume;
    if (masterVolume !== undefined) {
      if (typeof masterVolume !== "number" || !Number.isFinite(masterVolume) || masterVolume < 0 || masterVolume > 1) {
        return res.status(400).json({ message: "masterVolume must be a number between 0 and 1" });
      }
      updateData.masterVolume = masterVolume;
      updateData.audioVolume = masterVolume;
    }

    for (const field of ["soundFavorites", "soundRecents"]) {
      if (req.body[field] !== undefined) {
        const maxItems = field === "soundFavorites" ? 32 : 12;
        if (!Array.isArray(req.body[field]) || req.body[field].length > maxItems || req.body[field].some((id) => !VALID_SOUND_IDS.includes(id)) || new Set(req.body[field]).size !== req.body[field].length) {
          return res.status(400).json({ message: `${field} contains invalid, duplicate, or excessive sound IDs` });
        }
        updateData[field] = req.body[field];
      }
    }

    if (req.body.savedSoundscapes !== undefined) {
      if (!Array.isArray(req.body.savedSoundscapes) || req.body.savedSoundscapes.length > 20) {
        return res.status(400).json({ message: "savedSoundscapes must contain at most 20 mixes" });
      }
      const ids = new Set();
      const mixes = [];
      for (const mix of req.body.savedSoundscapes) {
        if (!mix || typeof mix.id !== "string" || !mix.id.trim() || mix.id.length > 80 || ids.has(mix.id) || typeof mix.name !== "string" || !mix.name.trim() || mix.name.trim().length > 50 || !Array.isArray(mix.layers) || mix.layers.length > 8) {
          return res.status(400).json({ message: "savedSoundscapes contains an invalid mix" });
        }
        const layerIds = new Set();
        const layers = [];
        for (const layer of mix.layers) {
          if (!layer || !VALID_SOUND_IDS.includes(layer.soundId) || layerIds.has(layer.soundId) || typeof layer.volume !== "number" || !Number.isFinite(layer.volume) || layer.volume < 0 || layer.volume > 1 || (layer.muted !== undefined && typeof layer.muted !== "boolean")) {
            return res.status(400).json({ message: "A saved mix contains an invalid or duplicate sound layer" });
          }
          layerIds.add(layer.soundId);
          layers.push({ soundId: layer.soundId, volume: layer.volume, muted: layer.muted === true });
        }
        ids.add(mix.id);
        mixes.push({ id: mix.id, name: mix.name.trim(), layers });
      }
      updateData.savedSoundscapes = mixes;
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
