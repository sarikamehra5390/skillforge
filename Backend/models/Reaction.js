const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["flower", "star", "fire"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

reactionSchema.index({ fromUserId: 1, toUserId: 1, type: 1, date: 1 });

module.exports = mongoose.model("Reaction", reactionSchema);
