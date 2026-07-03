const mongoose = require("mongoose");

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
    enum: ["classic", "sunset-garden", "moonlit-forest", "sakura-valley", "ghibli-sky", "rainy-evening", "starry-meadow"],
    default: "classic",
    },
    treeType: {
      type: String,
      enum: ["sprout", "classic", "sakura", "autumn", "winter", "cosmic", "golden"],
      default: "sprout",
    },
    companion: {
    type: String,
    enum: ["blue-bird", "fox", "cat", "bunny", "deer", "owl", "baby-dragon", "fire-spirit"],
    default: null, // None
    },
    music: {
      type: [String],
      enum: ["fireflies", "rain", "snow", "leaves", "wind", "fog", "stars", "birds", "night-mode", "nature-sounds", "rain-sounds", "bird-sounds", "wind-sounds"],
      default: ["fireflies"],
    },
    decorations: {
      type: [String],
      enum: ["lanterns", "flowers", "butterflies", "bridge", "campfire", "bench", "crystals", "wind-chimes", "waterfall", "stone-path"],
      default: [],
    },
    displayName: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    favoriteSkill: {
      type: String,
      default: "",
    },
    profileFrame: {
      type: String,
      enum: ["none", "gold", "silver", "bronze"],
      default: "none",
    },
    avatarColor: {
      type: String,
      default: "from-primary-400 to-secondary-400",
    },
    title: {
      type: String,
      enum: ["beginner", "streak-master", "tree-keeper", "forest-guardian", "ancient-sage", "world-tree-guardian"],
      default: "beginner",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SanctuarySettings", sanctuarySettingsSchema);