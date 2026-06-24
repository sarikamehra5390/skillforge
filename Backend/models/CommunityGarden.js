const mongoose = require("mongoose");

const communityGardenSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    weeklyGoal: {
      type: Number,
      default: 600, // 10 hours in minutes
    },
    weeklyProgress: {
      type: Number,
      default: 0,
    },
    weekStartDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CommunityGarden", communityGardenSchema);
