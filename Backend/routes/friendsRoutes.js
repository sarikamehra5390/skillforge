const express = require("express");
const Friend = require("../models/Friend");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Send friend request
router.post("/request", auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }

    if (friendId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot add yourself as a friend" });
    }

    // Check if request already exists
    const existingRequest = await Friend.findOne({
      $or: [
        { userId: req.user._id, friendId },
        { userId: friendId, friendId: req.user._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const friendRequest = new Friend({
      userId: req.user._id,
      friendId,
      status: "pending",
    });

    await friendRequest.save();
    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Accept friend request
router.post("/accept", auth, async (req, res) => {
  try {
    const { friendId } = req.body;

    const friendRequest = await Friend.findOne({
      userId: friendId,
      friendId: req.user._id,
      status: "pending",
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    res.json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Reject friend request
router.post("/reject", auth, async (req, res) => {
  try {
    const { friendId } = req.body;

    await Friend.findOneAndDelete({
      userId: friendId,
      friendId: req.user._id,
      status: "pending",
    });

    res.json({ message: "Friend request rejected successfully" });
  } catch (error) {
    console.error("Reject friend request error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Remove friend
router.delete("/remove", auth, async (req, res) => {
  try {
    const { friendId } = req.body;

    await Friend.findOneAndDelete({
      $or: [
        { userId: req.user._id, friendId, status: "accepted" },
        { userId: friendId, friendId: req.user._id, status: "accepted" },
      ],
    });

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Remove friend error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get friends list
router.get("/", auth, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { userId: req.user._id, status: "accepted" },
        { friendId: req.user._id, status: "accepted" },
      ],
    }).populate("userId friendId");

    // Format friends list
    const formattedFriends = friends.map((f) => {
      const friend =
        f.userId._id.toString() === req.user._id.toString()
          ? f.friendId
          : f.userId;
      return friend;
    });

    res.json(formattedFriends);
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get pending friend requests
router.get("/pending", auth, async (req, res) => {
  try {
    const pendingRequests = await Friend.find({
      friendId: req.user._id,
      status: "pending",
    }).populate("userId");

    res.json(pendingRequests.map((r) => r.userId));
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
