const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate friend requests
friendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

module.exports = mongoose.model("Friend", friendSchema);
