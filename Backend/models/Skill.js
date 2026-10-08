const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    totalMinutes: {
      type: Number,
      default: 0
    },
    lastPracticed: {
      type: Date
    }
  },
  {
    timestamps: true,
  }
);

skillSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Skill", skillSchema);
