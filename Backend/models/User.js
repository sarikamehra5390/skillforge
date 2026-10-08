const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    displayName: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    streak: {
      type: Number,
      default: 0,
      min: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastPracticeDate: {
      type: Date,
    },

    lastCheckIn: {
      type: Date,
    },

    avatar: {
      type: String,
      trim: true,
    },

    unlockedAchievements: [
      {
        type: String,
      },
    ],

    gardenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityGarden",
    },

    notificationSettings: {
      dailyReminders: {
        type: Boolean,
        default: true,
      },

      friendNotifications: {
        type: Boolean,
        default: true,
      },

      achievementNotifications: {
        type: Boolean,
        default: true,
      },

      gardenNotifications: {
        type: Boolean,
        default: true,
      },

      emailNotifications: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);