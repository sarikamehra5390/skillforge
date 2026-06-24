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

// Index to efficiently query reactions by date and users
reactionSchema.index({ fromUserId: 1, toUserId: 1, date: 1 });

module.exports = mongoose.model("Reaction", reactionSchema);
