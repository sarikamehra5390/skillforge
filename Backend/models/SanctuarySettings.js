const mongoose = require("mongoose");

const soundLayerSchema = new mongoose.Schema({
  soundId: { type: String, enum: ["rain", "wind", "birds", "nature", "ocean", "fireplace", "white-noise", "pink-noise", "brown-noise"], required: true },
  volume: { type: Number, min: 0, max: 1, default: 0.25 },
  muted: { type: Boolean, default: false },
}, { _id: false });

const savedSoundscapeSchema = new mongoose.Schema({
  id: { type: String, required: true, maxlength: 80 },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  layers: { type: [soundLayerSchema], default: [], validate: { validator: (layers) => layers.length <= 8 && new Set(layers.map((layer) => layer.soundId)).size === layers.length, message: "Saved mix layers must be unique and contain at most 8 sounds" } },
}, { _id: false });

const sanctuarySettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    theme: {
      type: String,
      enum: [
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
      ],
      default: "classic",
    },

    treeType: {
      type: String,
      enum: [
        "sprout",
        "classic",
        "sakura",
        "autumn",
        "winter",
        "cosmic",
        "golden",
      ],
      default: "sprout",
    },

    companion: {
      type: String,
      enum: [
        "blue-bird",
        "fox",
        "cat",
        "bunny",
        "deer",
        "owl",
        "baby-dragon",
        "fire-spirit",
      ],
      default: null,
    },

    music: {
      type: [String],
      enum: [
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
      ],
      default: ["fireflies"],
    },

    decorations: {
      type: [String],
      enum: [
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
      ],
      default: [],
    },

    treeAura: {
      type: String,
      enum: ["none", "soft-glow", "magical-glow", "celestial-glow"],
      default: "none",
    },

    ambientEffects: {
      type: Boolean,
      default: false,
    },

    reducedMotion: {
      type: Boolean,
      default: false,
    },

    particleIntensity: { type: String, enum: ["off", "low", "medium", "high"], default: "medium" },
    glowIntensity: { type: String, enum: ["subtle", "balanced", "magical"], default: "balanced" },
    backgroundAtmosphere: { type: String, enum: ["clear", "misty", "starry", "rainy"], default: "clear" },
    cardSpacing: { type: String, enum: ["compact", "comfortable"], default: "comfortable" },
    audioTrack: { type: String, enum: ["none", "rain", "wind", "birds", "nature", "ocean", "fireplace", "white-noise", "pink-noise", "brown-noise"], default: "none" },
    audioVolume: { type: Number, min: 0, max: 1, default: 0.3 },
    audioMuted: { type: Boolean, default: false },
    audioLayers: { type: [soundLayerSchema], default: [], validate: { validator: (layers) => layers.length <= 8 && new Set(layers.map((layer) => layer.soundId)).size === layers.length, message: "Audio layers must be unique and contain at most 8 sounds" } },
    masterVolume: { type: Number, min: 0, max: 1, default: undefined },
    soundFavorites: { type: [{ type: String, enum: ["rain", "wind", "birds", "nature", "ocean", "fireplace", "white-noise", "pink-noise", "brown-noise"] }], default: [], validate: { validator: (items) => items.length <= 32 && new Set(items).size === items.length, message: "Favorites must be unique and contain at most 32 sounds" } },
    soundRecents: { type: [{ type: String, enum: ["rain", "wind", "birds", "nature", "ocean", "fireplace", "white-noise", "pink-noise", "brown-noise"] }], default: [], validate: { validator: (items) => items.length <= 12 && new Set(items).size === items.length, message: "Recent sounds must be unique and contain at most 12 sounds" } },
    savedSoundscapes: { type: [savedSoundscapeSchema], default: [], validate: { validator: (mixes) => mixes.length <= 20 && new Set(mixes.map((mix) => mix.id)).size === mixes.length, message: "Saved soundscapes must have unique IDs and contain at most 20 mixes" } },
    seasonalWorld: { type: String, enum: ["spring", "summer", "autumn", "winter", ""], default: "" },
    seasonalAuto: { type: Boolean, default: false },
    seasonalHemisphere: { type: String, enum: ["north", "south"], default: "north" },
    ambienceIntensity: { type: String, enum: ["minimal", "balanced", "immersive"], default: "balanced" },

    displayName: {
      type: String,
      default: "",
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    favoriteSkill: {
      type: String,
      default: "",
      trim: true,
    },

    profileFrame: {
      type: String,
      enum: ["none", "gold", "silver", "bronze"],
      default: "none",
    },

    avatarColor: {
      type: String,
      default: "from-primary-400 to-secondary-400",
      trim: true,
    },

    title: {
      type: String,
      enum: [
        "beginner",
        "streak-master",
        "tree-keeper",
        "forest-guardian",
        "ancient-sage",
        "world-tree-guardian",
      ],
      default: "beginner",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SanctuarySettings",
  sanctuarySettingsSchema
);
