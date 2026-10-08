const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Session = require("../models/Session");
const SanctuarySettings = require("../models/SanctuarySettings");
const auth = require("../middleware/auth");
const { calculateCurrentStreak } = require("../utils/gamification");

const router = express.Router();

const { isValidObjectId } = mongoose.Types;

/* =========================================================
   Constants / Helpers
========================================================= */

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_NOTIFICATION_KEYS = [
  "dailyReminders",
  "friendNotifications",
  "achievementNotifications",
  "gardenNotifications",
  "emailNotifications",
];

const createDefaultSanctuarySettings = async (userId) => {
  return SanctuarySettings.create({
    userId,
    theme: "classic",
    treeType: "sprout",
    companion: null,
    music: ["fireflies"],
    decorations: [],
  });
};

const getSanctuarySettings = async (userId) => {
  let sanctuarySettings = await SanctuarySettings.findOne({ userId });

  if (!sanctuarySettings) {
    sanctuarySettings = await createDefaultSanctuarySettings(userId);
  }

  return sanctuarySettings;
};

/* =========================================================
   TEST ROUTE
========================================================= */

router.get("/test", (req, res) => {
  res.json({ message: "User Route Working" });
});

/* =========================================================
   REGISTER
========================================================= */

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields",
      });
    }

    if (
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Username must be a non-empty string",
      });
    }

    if (
      typeof email !== "string" ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const existingEmail = await User.findOne({
        email: normalizedEmail,
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered. Please sign in.",
        });
      }

      const existingUsername = await User.findOne({
        username: normalizedUsername,
      });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken. Please choose another.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        xp: 0,
        level: 1,
        streak: 0,
      });

      const sanctuarySettings =
        await createDefaultSanctuarySettings(user._id);

      console.log(`New user created: ${normalizedEmail}`);

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured on server");
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          sanctuarySettings,
        },
      });
    } catch (innerError) {
      if (innerError.code === 11000) {
        const field =
          Object.keys(innerError.keyPattern || {})[0];

        const fieldName = field
          ? field.charAt(0).toUpperCase() + field.slice(1)
          : "Value";

        return res.status(400).json({
          success: false,
          message: `${fieldName} is already in use.`,
        });
      }

      throw innerError;
    }
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================================================
   LOGIN
========================================================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    if (
      typeof email !== "string" ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const sanctuarySettings =
      await getSanctuarySettings(user._id);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured on server");
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        sanctuarySettings,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================================================
   GET CURRENT USER PROFILE
========================================================= */

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const allSessions = await Session.find({
      userId: user._id,
    });

    const currentStreak =
      calculateCurrentStreak(allSessions);

    if (user.streak !== currentStreak) {
      user.streak = currentStreak;

      if (
        currentStreak >
        (user.longestStreak || 0)
      ) {
        user.longestStreak = currentStreak;
      }

      await user.save();
    }

    const sanctuarySettings =
      await getSanctuarySettings(user._id);

    const userWithSettings = {
      ...user.toObject(),
      sanctuarySettings,
    };

    return res.json(userWithSettings);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================================================
   SEARCH USERS
========================================================= */

router.get("/search", auth, async (req, res) => {
  try {
    const searchTerm = req.query.q || req.query.query;

    if (!searchTerm) {
      return res.status(200).json([]);
    }

    const normalizedSearchTerm = String(searchTerm).trim();

    if (!normalizedSearchTerm) {
      return res.status(200).json([]);
    }

    const escapedTerm =
      escapeRegex(normalizedSearchTerm);

    const users = await User.find({
      $and: [
        {
          _id: {
            $ne: req.user._id,
          },
        },
        {
          $or: [
            {
              username: {
                $regex: escapedTerm,
                $options: "i",
              },
            },
            {
              displayName: {
                $regex: escapedTerm,
                $options: "i",
              },
            },
          ],
        },
      ],
    })
      .select(
        "username displayName avatar xp level streak longestStreak lastPracticeDate gardenId"
      )
      .lean();

    return res.json(users);
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================================================
   GET PUBLIC USER PROFILE
========================================================= */

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const user = await User.findById(userId)
      .select(
        "username displayName avatar bio level xp streak unlockedAchievements createdAt"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      unlockedAchievements:
        user.unlockedAchievements,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("GET PUBLIC PROFILE ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

/* =========================================================
   UPDATE CURRENT USER PROFILE
========================================================= */

router.put("/profile", auth, async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      avatar,
      displayName,
      notificationSettings,
    } = req.body;

    const updateData = {};

    /* ---------- Username ---------- */

    if (username !== undefined) {
      if (
        typeof username !== "string" ||
        username.trim().length === 0
      ) {
        return res.status(400).json({
          message:
            "Username must be a non-empty string",
        });
      }

      const normalizedUsername = username.trim();

      const existingUsername =
        await User.findOne({
          username: normalizedUsername,
          _id: {
            $ne: req.user._id,
          },
        });

      if (existingUsername) {
        return res.status(400).json({
          message: "Username already taken",
        });
      }

      updateData.username = normalizedUsername;
    }

    /* ---------- Email ---------- */

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !EMAIL_REGEX.test(email.trim())
      ) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const existingEmail =
        await User.findOne({
          email: normalizedEmail,
          _id: {
            $ne: req.user._id,
          },
        });

      if (existingEmail) {
        return res.status(400).json({
          message: "Email already taken",
        });
      }

      updateData.email = normalizedEmail;
    }

    /* ---------- Password ---------- */

    if (password !== undefined) {
      if (
        typeof password !== "string" ||
        password.length < 6
      ) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }

      updateData.password =
        await bcrypt.hash(password, 10);
    }

    /* ---------- Avatar ---------- */

    if (avatar !== undefined) {
      if (typeof avatar !== "string") {
        return res.status(400).json({
          message: "Avatar must be a string",
        });
      }

      updateData.avatar = avatar.trim();
    }

    /* ---------- Display Name ---------- */

    if (displayName !== undefined) {
      if (
        typeof displayName !== "string"
      ) {
        return res.status(400).json({
          message: "Display name must be a string",
        });
      }

      updateData.displayName =
        displayName.trim();
    }

    /* ---------- Notification Settings ---------- */

    if (notificationSettings !== undefined) {
      if (
        typeof notificationSettings !== "object" ||
        notificationSettings === null ||
        Array.isArray(notificationSettings)
      ) {
        return res.status(400).json({
          message:
            "notificationSettings must be an object",
        });
      }

      const validatedSettings = {};

      for (const key of ALLOWED_NOTIFICATION_KEYS) {
        if (
          notificationSettings[key] !== undefined
        ) {
          if (
            typeof notificationSettings[key] !==
            "boolean"
          ) {
            return res.status(400).json({
              message: `notificationSettings.${key} must be a boolean`,
            });
          }

          validatedSettings[key] =
            notificationSettings[key];
        }
      }

      for (const [key, value] of Object.entries(
        validatedSettings
      )) {
        updateData[
          `notificationSettings.${key}`
        ] = value;
      }
    }

    /* ---------- Update User ---------- */

    let user;

    try {
      user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");
    } catch (error) {
      if (error.code === 11000) {
        const field =
          Object.keys(error.keyPattern || {})[0];

        const fieldName = field
          ? field.charAt(0).toUpperCase() +
            field.slice(1)
          : "Value";

        return res.status(400).json({
          message: `${fieldName} is already in use.`,
        });
      }

      throw error;
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;