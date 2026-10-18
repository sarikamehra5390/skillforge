const express = require("express");
const mongoose = require("mongoose");
const Friend = require("../models/Friend");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { getFreshStreakValue } = require("../utils/gamification");
const isValidObjectId = require("../utils/isValidObjectId");

const router = express.Router();

const FRIEND_USER_FIELDS =
  "username displayName avatar xp level streak longestStreak lastPracticeDate";

const publicFriendStats = (person) => {
  if (!person) return person;
  const { lastPracticeDate, ...publicFields } = person;
  return {
    ...publicFields,
    streak: getFreshStreakValue(person.streak, lastPracticeDate),
  };
};

router.post("/request", auth, async (req, res) => {
  try {
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        message: "Friend ID is required",
      });
    }

    if (!isValidObjectId(friendId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const currentUserId = req.user._id.toString();

    if (friendId.toString() === currentUserId) {
      return res.status(400).json({
        message: "Cannot add yourself as a friend",
      });
    }

    const targetUser = await User.findById(friendId).select("_id username");

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingRequest = await Friend.findOne({
      $or: [
        {
          userId: req.user._id,
          friendId,
        },
        {
          userId: friendId,
          friendId: req.user._id,
        },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Friend request already exists",
      });
    }

    const friendRequest = new Friend({
      userId: req.user._id,
      friendId,
      status: "pending",
    });

    await friendRequest.save();

    try {
      await Notification.create({
        userId: friendId,
        title: "New Friend Request",
        message: `${req.user.username} sent you a friend request!`,
        type: "friend",
      });
    } catch (notificationError) {
      // The persisted friend request is authoritative; notification delivery is secondary.
      console.error("Friend request notification error:", notificationError);
    }

    return res.status(201).json({
      message: "Friend request sent successfully",
    });
  } catch (error) {
    console.error("Send friend request error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Friend request already exists",
      });
    }

    return res.status(500).json({
      message: error.message || "Failed to send friend request",
    });
  }
});

router.post("/accept", auth, async (req, res) => {
  try {
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        message: "Friend ID is required",
      });
    }

    if (!isValidObjectId(friendId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const friendRequest = await Friend.findOne({
      userId: friendId,
      friendId: req.user._id,
      status: "pending",
    });

    if (!friendRequest) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    try {
      await Notification.create({
        userId: friendId,
        title: "Friend Request Accepted",
        message: `${req.user.username} accepted your friend request!`,
        type: "friend",
      });
    } catch (notificationError) {
      console.error("Friend acceptance notification error:", notificationError);
    }

    return res.json({
      message: "Friend request accepted successfully",
    });
  } catch (error) {
    console.error("Accept friend request error:", error);

    return res.status(500).json({
      message: error.message || "Failed to accept friend request",
    });
  }
});

router.post("/reject", auth, async (req, res) => {
  try {
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        message: "Friend ID is required",
      });
    }

    if (!isValidObjectId(friendId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const deleted = await Friend.findOneAndDelete({
      userId: friendId,
      friendId: req.user._id,
      status: "pending",
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    return res.json({
      message: "Friend request rejected successfully",
    });
  } catch (error) {
    console.error("Reject friend request error:", error);

    return res.status(500).json({
      message: error.message || "Failed to reject friend request",
    });
  }
});

router.delete("/remove", auth, async (req, res) => {
  try {
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        message: "Friend ID is required",
      });
    }

    if (!isValidObjectId(friendId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const deleted = await Friend.findOneAndDelete({
      $or: [
        {
          userId: req.user._id,
          friendId,
          status: "accepted",
        },
        {
          userId: friendId,
          friendId: req.user._id,
          status: "accepted",
        },
      ],
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Friendship not found",
      });
    }

    return res.json({
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("Remove friend error:", error);

    return res.status(500).json({
      message: error.message || "Failed to remove friend",
    });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        {
          userId: req.user._id,
          status: "accepted",
        },
        {
          friendId: req.user._id,
          status: "accepted",
        },
      ],
    })
      .populate("userId", FRIEND_USER_FIELDS)
      .populate("friendId", FRIEND_USER_FIELDS)
      .lean();

    const currentUserId = req.user._id.toString();

    const formattedFriends = friends
      .map((friendship) => {
        const friend =
          friendship.userId._id.toString() === currentUserId
            ? friendship.friendId
            : friendship.userId;

        return publicFriendStats(friend);
      })
      .filter(Boolean);

    return res.json(formattedFriends);
  } catch (error) {
    console.error("Get friends error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch friends",
    });
  }
});

router.get("/pending", auth, async (req, res) => {
  try {
    const [incomingRequests, outgoingRequests] = await Promise.all([
      Friend.find({
        friendId: req.user._id,
        status: "pending",
      })
        .populate("userId", FRIEND_USER_FIELDS)
        .lean(),

      Friend.find({
        userId: req.user._id,
        status: "pending",
      })
        .populate("friendId", FRIEND_USER_FIELDS)
        .lean(),
    ]);

    return res.json({
      incoming: incomingRequests.map((request) => publicFriendStats(request.userId)).filter(Boolean),
      outgoing: outgoingRequests.map((request) => publicFriendStats(request.friendId)).filter(Boolean),
    });
  } catch (error) {
    console.error("Get pending requests error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch pending requests",
    });
  }
});

router.delete("/cancel", auth, async (req, res) => {
  try {
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        message: "Friend ID is required",
      });
    }

    if (!isValidObjectId(friendId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const deleted = await Friend.findOneAndDelete({
      userId: req.user._id,
      friendId,
      status: "pending",
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    return res.json({
      message: "Friend request cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel friend request error:", error);

    return res.status(500).json({
      message: error.message || "Failed to cancel friend request",
    });
  }
});

module.exports = router;
