const express = require("express");
const Reaction = require("../models/Reaction");
const auth = require("../middleware/auth");
const router = express.Router();

// Get reactions for a user
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reactions = await Reaction.find({
      toUserId: userId,
      createdAt: { $gte: today },
    });

    // Count reactions by type
    const counts = {
      flower: 0,
      star: 0,
      fire: 0,
    };

    reactions.forEach((r) => {
      counts[r.type]++;
    });

    res.json(counts);
  } catch (error) {
    console.error("Get reactions error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Leave a reaction
router.post("/", auth, async (req, res) => {
  try {
    const { toUserId, type } = req.body;

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayReactions = await Reaction.countDocuments({
      fromUserId: req.user._id,
      toUserId,
      type,
      createdAt: { $gte: today },
    });

    if (todayReactions >= 3) {
      return res.status(400).json({ message: "Daily limit reached for this reaction type" });
    }

    const reaction = new Reaction({
      fromUserId: req.user._id,
      toUserId,
      type,
    });

    await reaction.save();
    res.status(201).json({ message: "Reaction sent successfully" });
  } catch (error) {
    console.error("Leave reaction error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
