const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastPracticeDate: {
      type: Date,
    },
    lastCheckIn: {
      type: Date
    },
    avatar: {
      type: String,
    },
    unlockedAchievements: [{
      type: String,
      default: []
    }],
    gardenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityGarden",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
