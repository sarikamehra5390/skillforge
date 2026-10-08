const express = require("express");
const mongoose = require("mongoose");
const Mood = require("../models/Mood");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

const { isValidObjectId } = mongoose.Types;

const VALID_MOODS = ['motivated', 'calm', 'tired', 'focused'];

const startOfDay = (d = new Date()) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

router.get("/check", auth, async (req, res) => {
  try {
    const today = startOfDay();
    
    const existingMood = await Mood.findOne({
      userId: req.user._id,
      date: today
    });

    const lastCheckIn = req.user.lastCheckIn;
    let hasCheckedInToday = false;
    if (lastCheckIn) {
      const lastCheckInDate = startOfDay(lastCheckIn);
      hasCheckedInToday = lastCheckInDate.getTime() === today.getTime();
    }

    res.json({ hasCheckedInToday, mood: existingMood });
  } catch (error) {
    console.error("Check mood error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { mood } = req.body;

    if (!VALID_MOODS.includes(mood)) {
      return res.status(400).json({ message: `Invalid mood value. Must be one of: ${VALID_MOODS.join(", ")}` });
    }

    const today = startOfDay();

    let moodDoc = await Mood.findOne({ userId: req.user._id, date: today });
    if (moodDoc) {
      moodDoc.mood = mood;
    } else {
      moodDoc = new Mood({
        userId: req.user._id,
        mood,
        date: today
      });
    }
    const savedMood = await moodDoc.save();

    await User.findByIdAndUpdate(
      req.user._id,
      { lastCheckIn: new Date() },
      { new: true }
    );

    res.status(201).json(savedMood);
  } catch (error) {
    console.error("Save mood error:", error);
    res.status(400).json({ message: error.message });
  }
});

router.get("/history", auth, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(moods);
  } catch (error) {
    console.error("Get mood history error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
