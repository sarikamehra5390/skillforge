const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { performance } = require("node:perf_hooks");

const User = require("../models/User");
const Session = require("../models/Session");
const SanctuarySettings = require("../models/SanctuarySettings");
const auth = require("../middleware/auth");
const { calculateStreakState, getFreshStreakValue } = require("../utils/gamification");
const isValidObjectId = require("../utils/isValidObjectId");
const { validateNewPassword } = require("../utils/passwordPolicy");

const router = express.Router();

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

    const passwordError = validateNewPassword(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const existingEmail = await User.findOne({
        email: normalizedEmail,
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "An account with those details already exists. Try signing in or choose different details.",
        });
      }

      const existingUsername = await User.findOne({
        username: normalizedUsername,
      });

      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "An account with those details already exists. Try signing in or choose different details.",
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
        return res.status(409).json({
          success: false,
          message: "An account with those details already exists. Try signing in or choose different details.",
        });
      }

      throw innerError;
    }
  } catch (error) {
    console.error("REGISTER ERROR:", { name: error.name, code: error.code });

    return res.status(500).json({
      success: false,
      message: "Unable to register right now. Please try again.",
    });
  }
});

/* =========================================================
   LOGIN
========================================================= */

router.post("/login", async (req, res) => {
  const loginStartedAt = performance.now();
  const timings = {};
  let outcome = "invalid_request";

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

    const userLookupStartedAt = performance.now();
    const user = await User.findOne({
      email: normalizedEmail,
    });
    timings.userLookupMs = Math.round(performance.now() - userLookupStartedAt);

    const passwordVerificationStartedAt = performance.now();
    const passwordMatches = user
      ? await bcrypt.compare(password, user.password)
      : false;
    timings.passwordVerificationMs = Math.round(performance.now() - passwordVerificationStartedAt);

    if (!passwordMatches) {
      outcome = "invalid_credentials";
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Login hydrates the frontend directly, so refresh streak data here too;
    // ProtectedRoute will not request /profile once this user is in auth state.
    const dataLoadStartedAt = performance.now();
    const now = new Date();
    const sessionQueryStartedAt = performance.now();
    const sessionsPromise = Session.find({
      userId: user._id,
      duration: { $gt: 0 },
      completedAt: { $lte: now },
    })
      .select("completedAt duration -_id")
      .lean()
      .then((sessions) => {
        timings.sessionQueryMs = Math.round(performance.now() - sessionQueryStartedAt);
        return sessions;
      });
    const settingsQueryStartedAt = performance.now();
    const settingsPromise = getSanctuarySettings(user._id).then((settings) => {
      timings.sanctuaryQueryMs = Math.round(performance.now() - settingsQueryStartedAt);
      return settings;
    });
    const [sessions, sanctuarySettings] = await Promise.all([
      sessionsPromise,
      settingsPromise,
    ]);
    timings.parallelDataLoadMs = Math.round(performance.now() - dataLoadStartedAt);

    const streakCalculationStartedAt = performance.now();
    const streakState = calculateStreakState(sessions);
    const longestStreak = Math.max(user.longestStreak || 0, streakState.longestStreak);
    timings.streakCalculationMs = Math.round(performance.now() - streakCalculationStartedAt);
    const streakUpdate = {
      $set: {
        streak: streakState.streak,
        ...(streakState.lastPracticeDate
          ? { lastPracticeDate: streakState.lastPracticeDate }
          : {}),
      },
      $max: { longestStreak },
    };
    if (!streakState.lastPracticeDate) {
      streakUpdate.$unset = { lastPracticeDate: 1 };
    }
    const lastPracticeDate = streakState.lastPracticeDate;
    const streakChanged = user.streak !== streakState.streak ||
      user.longestStreak !== longestStreak ||
      String(user.lastPracticeDate || "") !== String(lastPracticeDate || "");
    if (streakChanged) {
      const userUpdateStartedAt = performance.now();
      await User.updateOne({ _id: user._id }, streakUpdate);
      timings.userUpdateMs = Math.round(performance.now() - userUpdateStartedAt);
    }
    user.streak = streakState.streak;
    user.longestStreak = longestStreak;
    user.lastPracticeDate = lastPracticeDate;

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured on server");
    }

    const tokenStartedAt = performance.now();
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    timings.tokenGenerationMs = Math.round(performance.now() - tokenStartedAt);
    outcome = "success";

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
        longestStreak: user.longestStreak,
        lastPracticeDate: user.lastPracticeDate,
        sanctuarySettings,
      },
    });
  } catch (error) {
    outcome = "server_error";
    if (process.env.NODE_ENV === "production") {
      console.error("LOGIN ERROR:", { name: error.name, code: error.code });
    } else {
      console.error("LOGIN ERROR:", { name: error.name, code: error.code });
    }

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  } finally {
    console.info("LOGIN TIMING:", {
      outcome,
      ...timings,
      totalMs: Math.round(performance.now() - loginStartedAt),
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

    const now = new Date();
    const [allSessions, sanctuarySettings] = await Promise.all([
      Session.find({
        userId: user._id,
        duration: { $gt: 0 },
        completedAt: { $lte: now },
      })
        .select("completedAt duration -_id")
        .lean(),
      getSanctuarySettings(user._id),
    ]);

    const streakState = calculateStreakState(allSessions);
    const longestStreak = Math.max(user.longestStreak || 0, streakState.longestStreak);
    if (user.streak !== streakState.streak || user.longestStreak !== longestStreak || String(user.lastPracticeDate || '') !== String(streakState.lastPracticeDate || '')) {
      user.streak = streakState.streak;
      user.longestStreak = longestStreak;
      user.lastPracticeDate = streakState.lastPracticeDate;
      await user.save();
    }

    const userWithSettings = {
      ...user.toObject(),
      sanctuarySettings,
    };

    return res.json(userWithSettings);
  } catch (error) {
    console.error("GET PROFILE ERROR:", { name: error.name, code: error.code });

    return res.status(500).json({
      message: "Unable to load your profile right now. Please try again.",
    });
  }
});

/* =========================================================
   SEARCH USERS
========================================================= */

router.get("/search", auth, async (req, res) => {
  try {
    const searchTerm = req.query.q || req.query.query;

    if (searchTerm === undefined) {
      return res.status(200).json([]);
    }

    if (typeof searchTerm !== "string") {
      return res.status(400).json({ message: "Search query must be a string" });
    }

    const normalizedSearchTerm = searchTerm.trim();

    if (!normalizedSearchTerm) {
      return res.status(200).json([]);
    }

    if (normalizedSearchTerm.length > 80) {
      return res.status(400).json({ message: "Search query must be 80 characters or fewer" });
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
        "username displayName avatar xp level streak longestStreak lastPracticeDate"
      )
      .limit(25)
      .lean();

    return res.json(users.map((user) => {
      const { lastPracticeDate, ...publicFields } = user;
      return {
        ...publicFields,
        streak: getFreshStreakValue(user.streak, lastPracticeDate),
      };
    }));
  } catch (error) {
    console.error("SEARCH USERS ERROR:", { name: error.name, code: error.code });

    return res.status(500).json({
      message: "Unable to search users right now",
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
        "username displayName avatar bio level xp streak lastPracticeDate unlockedAchievements createdAt"
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
      streak: getFreshStreakValue(user.streak, user.lastPracticeDate),
      unlockedAchievements:
        user.unlockedAchievements,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("GET PUBLIC PROFILE ERROR:", { name: error.name, code: error.code });

    return res.status(500).json({
      message: "Unable to load this profile right now. Please try again.",
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
      const passwordError = validateNewPassword(password);
      if (passwordError) {
        return res.status(400).json({
          message: passwordError,
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
