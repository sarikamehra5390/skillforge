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
      enum: ["sunset-garden", "moonlit-forest", "sakura-valley", "ghibli-sky", "rainy-evening", "starry-meadow"],
      default: "moonlit-forest",
    },
    treeType: {
      type: String,
      enum: ["sprout", "classic", "sakura", "autumn", "winter", "cosmic", "golden"],
      default: "sprout",
    },
    companion: {
      type: String,
      enum: ["blue-bird", "fox", "cat", "rabbit", "owl"],
      default: "blue-bird",
    },
    music: {
      type: String,
      enum: ["rain", "forest", "piano", "lofi", "night", "silent"],
      default: "silent",
    },
    decorations: {
      type: [String],
      enum: ["lanterns", "flowers", "stars", "crystals", "butterflies", "trophy-plaques"],
      default: [],
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