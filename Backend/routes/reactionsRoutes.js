const express = require("express");
const mongoose = require("mongoose");
const Reaction = require("../models/Reaction");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

const VALID_REACTION_TYPES = ["flower", "star", "fire"];

router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reactions = await Reaction.find({
      toUserId: userId,
      createdAt: { $gte: today },
    });

    const counts = reactions.reduce((acc, r) => {
      if (acc[r.type] !== undefined) {
        acc[r.type]++;
      }
      return acc;
    }, {
      flower: 0,
      star: 0,
      fire: 0,
    });

    res.json(counts);
  } catch (error) {
    console.error("Get reactions error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { toUserId, type } = req.body;

    if (!toUserId) {
      return res.status(400).json({ message: "toUserId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ message: "Invalid toUserId" });
    }

    if (req.user._id.toString() === toUserId.toString()) {
      return res.status(400).json({ message: "Cannot react to your own profile" });
    }

    if (!VALID_REACTION_TYPES.includes(type)) {
      return res.status(400).json({ message: `Invalid reaction type. Must be one of: ${VALID_REACTION_TYPES.join(", ")}` });
    }

    const targetUser = await User.findById(toUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

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
