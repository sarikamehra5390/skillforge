const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "User Route Working" });
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    // Use try-catch specifically for the creation to handle unique constraint errors
    try {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email is already registered. Please sign in." });
      }

      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ success: false, message: "Username is already taken. Please choose another." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        xp: 0,
        level: 1,
        streak: 0
      });

      console.log(`New user created: ${email}`);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          xp: user.xp,
          level: user.level,
          streak: user.streak
        }
      });
    } catch (innerError) {
      if (innerError.code === 11000) {
        const field = Object.keys(innerError.keyPattern)[0];
        return res.status(400).json({ 
          success: false, 
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use.` 
        });
      }
      throw innerError; // Re-throw for outer catch
    }
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Profile
router.get("/profile", auth, async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    xp: req.user.xp,
    level: req.user.level,
    streak: req.user.streak
  });
});

// Search users
router.get("/search", auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { displayName: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get public user profile
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
