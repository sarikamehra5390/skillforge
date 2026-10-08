const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mood: {
      type: String,
      enum: ['motivated', 'calm', 'tired', 'focused'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

moodSchema.pre('save', function (next) {
  if (this.date) {
    const d = new Date(this.date);
    d.setHours(0, 0, 0, 0);
    this.date = d;
  }
  next();
});

moodSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Mood", moodSchema);
