const express = require("express");
const mongoose = require("mongoose");
const Friend = require("../models/Friend");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const router = express.Router();

const { isValidObjectId } = mongoose.Types;

router.post("/request", auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }
    if (!isValidObjectId(friendId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    if (friendId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot add yourself as a friend" });
    }

    const targetUser = await User.findById(friendId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

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
    
    await Notification.create({
      userId: friendId,
      title: "New Friend Request",
      message: `${req.user.username} sent you a friend request!`,
      type: "friend"
    });
    
    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/accept", auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }
    if (!isValidObjectId(friendId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

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

    await Notification.create({
      userId: friendId,
      title: "Friend Request Accepted",
      message: `${req.user.username} accepted your friend request!`,
      type: "friend"
    });

    res.json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/reject", auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }
    if (!isValidObjectId(friendId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const deleted = await Friend.findOneAndDelete({
      userId: friendId,
      friendId: req.user._id,
      status: "pending",
    });

    if (!deleted) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    res.json({ message: "Friend request rejected successfully" });
  } catch (error) {
    console.error("Reject friend request error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/remove", auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }
    if (!isValidObjectId(friendId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const deleted = await Friend.findOneAndDelete({
      $or: [
        { userId: req.user._id, friendId, status: "accepted" },
        { userId: friendId, friendId: req.user._id, status: "accepted" },
      ],
    });

    if (!deleted) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Remove friend error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { userId: req.user._id, status: "accepted" },
        { friendId: req.user._id, status: "accepted" },
      ],
    }).populate("userId friendId");

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

router.get("/pending", auth, async (req, res) => {
  try {
    const incomingRequests = await Friend.find({
      friendId: req.user._id,
      status: "pending",
    }).populate("userId");

    const outgoingRequests = await Friend.find({
      userId: req.user._id,
      status: "pending",
    }).populate("friendId");

    res.json({
      incoming: incomingRequests.map((r) => r.userId),
      outgoing: outgoingRequests.map((r) => r.friendId),
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/cancel", auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }
    if (!isValidObjectId(friendId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const deleted = await Friend.findOneAndDelete({
      userId: req.user._id,
      friendId,
      status: "pending",
    });

    if (!deleted) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    res.json({ message: "Friend request cancelled successfully" });
  } catch (error) {
    console.error("Cancel friend request error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
