const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const isValidObjectId = require("../utils/isValidObjectId");

const router = express.Router();

// Get all notifications for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(notifications);
  } catch (error) {
    console.error("GET notifications error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch notifications",
    });
  }
});

// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id,
      },
      {
        $set: { read: true },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.json(notification);
  } catch (error) {
    console.error("Update notification error:", error);

    return res.status(400).json({
      message: error.message || "Failed to update notification",
    });
  }
});

// Mark all notifications as read
router.put("/mark-all-read", auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        userId: req.user._id,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    return res.json({
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all read error:", error);

    return res.status(400).json({
      message: error.message || "Failed to mark notifications as read",
    });
  }
});

// Delete notification
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete notification",
    });
  }
});

module.exports = router;
