const express = require("express");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const router = express.Router();

// Get friend activity feed
router.get("/feed", auth, async (req, res) => {
  try {
    const Friend = require("../models/Friend");
    // Get all accepted friends
    const friends = await Friend.find({
      $or: [
        { userId: req.user._id, status: "accepted" },
        { friendId: req.user._id, status: "accepted" },
      ],
    });

    const friendIds = friends.map((f) =>
      f.userId.toString() === req.user._id.toString() ? f.friendId : f.userId
    );

    // Include current user's activities too
    const userIds = [...friendIds, req.user._id];

    const activities = await Activity.find({
      userId: { $in: userIds },
    })
      .populate("userId")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    console.error("Get activity feed error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
