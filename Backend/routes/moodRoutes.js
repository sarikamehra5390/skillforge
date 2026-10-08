const express = require("express");
const Mood = require("../models/Mood");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const VALID_MOODS = [
  "motivated",
  "calm",
  "tired",
  "focused",
];

const startOfDay = (date = new Date()) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Check today's mood/check-in status
router.get("/check", auth, async (req, res) => {
  try {
    const today = startOfDay();

    const existingMood = await Mood.findOne({
      userId: req.user._id,
      date: today,
    });

    const lastCheckIn = req.user.lastCheckIn;

    let hasCheckedInToday = false;

    if (lastCheckIn) {
      const lastCheckInDate = startOfDay(lastCheckIn);

      hasCheckedInToday =
        lastCheckInDate.getTime() === today.getTime();
    }

    return res.json({
      hasCheckedInToday,
      mood: existingMood,
    });
  } catch (error) {
    console.error("Check mood error:", error);

    return res.status(500).json({
      message: error.message || "Failed to check today's mood",
    });
  }
});

// Create/update today's mood
router.post("/", auth, async (req, res) => {
  try {
    const { mood } = req.body;

    if (!VALID_MOODS.includes(mood)) {
      return res.status(400).json({
        message: `Invalid mood value. Must be one of: ${VALID_MOODS.join(", ")}`,
      });
    }

    const today = startOfDay();

    let moodDoc = await Mood.findOne({
      userId: req.user._id,
      date: today,
    });

    if (moodDoc) {
      moodDoc.mood = mood;
    } else {
      moodDoc = new Mood({
        userId: req.user._id,
        mood,
        date: today,
      });
    }

    const savedMood = await moodDoc.save();

    await User.findByIdAndUpdate(
      req.user._id,
      {
        lastCheckIn: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

    return res.status(201).json(savedMood);
  } catch (error) {
    console.error("Save mood error:", error);

    return res.status(400).json({
      message: error.message || "Failed to save mood",
    });
  }
});

// Get mood history
router.get("/history", auth, async (req, res) => {
  try {
    const moods = await Mood.find({
      userId: req.user._id,
    }).sort({
      date: -1,
    });

    return res.json(moods);
  } catch (error) {
    console.error("Get mood history error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch mood history",
    });
  }
});

module.exports = router;
