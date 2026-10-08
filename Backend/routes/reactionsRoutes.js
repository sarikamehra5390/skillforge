const express = require("express");
const mongoose = require("mongoose");
const Reaction = require("../models/Reaction");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const VALID_REACTION_TYPES = ["flower", "star", "fire"];

const startOfDay = (date = new Date()) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get today's reaction counts for a user
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const today = startOfDay();

    const reactions = await Reaction.find({
      toUserId: userId,
      createdAt: {
        $gte: today,
      },
    }).lean();

    const counts = reactions.reduce(
      (acc, reaction) => {
        if (Object.prototype.hasOwnProperty.call(acc, reaction.type)) {
          acc[reaction.type] += 1;
        }

        return acc;
      },
      {
        flower: 0,
        star: 0,
        fire: 0,
      }
    );

    return res.json(counts);
  } catch (error) {
    console.error("Get reactions error:", error);

    return res.status(500).json({
      message: error.message || "Failed to get reactions",
    });
  }
});

// Send a reaction
router.post("/", auth, async (req, res) => {
  try {
    const { toUserId, type } = req.body;

    if (!toUserId) {
      return res.status(400).json({
        message: "toUserId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({
        message: "Invalid toUserId",
      });
    }

    if (req.user._id.toString() === toUserId.toString()) {
      return res.status(400).json({
        message: "Cannot react to your own profile",
      });
    }

    if (!VALID_REACTION_TYPES.includes(type)) {
      return res.status(400).json({
        message: `Invalid reaction type. Must be one of: ${VALID_REACTION_TYPES.join(
          ", "
        )}`,
      });
    }

    const targetUser = await User.exists({
      _id: toUserId,
    });

    if (!targetUser) {
      return res.status(404).json({
        message: "Target user not found",
      });
    }

    const today = startOfDay();

    const todayReactions = await Reaction.countDocuments({
      fromUserId: req.user._id,
      toUserId,
      type,
      createdAt: {
        $gte: today,
      },
    });

    if (todayReactions >= 3) {
      return res.status(400).json({
        message: "Daily limit reached for this reaction type",
      });
    }

    const reaction = new Reaction({
      fromUserId: req.user._id,
      toUserId,
      type,
    });

    await reaction.save();

    return res.status(201).json({
      message: "Reaction sent successfully",
    });
  } catch (error) {
    console.error("Leave reaction error:", error);

    return res.status(500).json({
      message: error.message || "Failed to send reaction",
    });
  }
});

module.exports = router;