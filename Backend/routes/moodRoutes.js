const express = require("express");
const Mood = require("../models/Mood");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Check if user has checked in today
router.get("/check", auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingMood = await Mood.findOne({
      userId: req.user._id,
      date: { $gte: today }
    });

    const lastCheckIn = req.user.lastCheckIn;
    let hasCheckedInToday = false;
    if (lastCheckIn) {
      const lastCheckInDate = new Date(lastCheckIn);
      lastCheckInDate.setHours(0, 0, 0, 0);
      hasCheckedInToday = lastCheckInDate.getTime() === today.getTime();
    }

    res.json({ hasCheckedInToday, mood: existingMood });
  } catch (error) {
    console.error("Check mood error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Save today's mood
router.post("/", auth, async (req, res) => {
  try {
    const { mood } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Remove any existing mood for today
    await Mood.deleteMany({
      userId: req.user._id,
      date: { $gte: today }
    });

    const newMood = new Mood({
      userId: req.user._id,
      mood
    });

    await newMood.save();

    // Update user's lastCheckIn
    await User.findByIdAndUpdate(
      req.user._id,
      { lastCheckIn: new Date() },
      { new: true }
    );

    res.status(201).json(newMood);
  } catch (error) {
    console.error("Save mood error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get mood history
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
