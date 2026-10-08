const express = require("express");
const Activity = require("../models/Activity");
const Friend = require("../models/Friend");
const auth = require("../middleware/auth");

const router = express.Router();

// Get friend activity feed
router.get("/feed", auth, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get all accepted friendships involving the current user
    const friends = await Friend.find({
      $or: [
        {
          userId: currentUserId,
          status: "accepted",
        },
        {
          friendId: currentUserId,
          status: "accepted",
        },
      ],
    }).lean();

    // Get the other user's ID from each friendship
    const friendIds = friends.map((friend) =>
      friend.userId.toString() === currentUserId.toString()
        ? friend.friendId
        : friend.userId
    );

    // Include the current user's own activities
    const userIds = [currentUserId, ...friendIds];

    const activities = await Activity.find({
      userId: { $in: userIds },
    })
      .populate("userId", "username displayName avatar")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json(activities);
  } catch (error) {
    console.error("Get activity feed error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch activity feed",
    });
  }
});

module.exports = router;