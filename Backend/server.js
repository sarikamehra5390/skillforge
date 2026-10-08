require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const moodRoutes = require("./routes/moodRoutes");
const sanctuaryRoutes = require("./routes/sanctuaryRoutes");
const friendsRoutes = require("./routes/friendsRoutes");
const reactionsRoutes = require("./routes/reactionsRoutes");
const activityRoutes = require("./routes/activityRoutes");
const achievementsRoutes = require("./routes/achievementsRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

// ─────────────────────────────────────────────
// Environment validation
// ─────────────────────────────────────────────

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

if (NODE_ENV === "production") {
  if (!process.env.FRONTEND_URL) {
    console.error("❌ FRONTEND_URL must be configured in production.");
    process.exit(1);
  }

  if (
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET === "replace-this-with-a-long-random-secret-string"
  ) {
    console.error("❌ Configure a private JWT_SECRET of at least 32 characters in production.");
    process.exit(1);
  }
}

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────

const corsOrigins = NODE_ENV === "production"
  ? [FRONTEND_URL]
  : [FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests such as Postman/server-to-server requests
      // that don't include an Origin header.
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = corsOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === "string") {
          return allowedOrigin === origin;
        }

        return allowedOrigin.test(origin);
      });

      if (isAllowed) {
        return callback(null, true);
      }

      // During development, allow the request but log it.
      if (NODE_ENV !== "production") {
        console.warn(`⚠️ CORS origin not explicitly allowed: ${origin}`);
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`),
        false
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─────────────────────────────────────────────
// Body parsing
// ─────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));

// ─────────────────────────────────────────────
// Basic routes
// ─────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SkillForge API Running",
  });
});

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;

  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const database = states[dbState] || "unknown";
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "unhealthy",
    uptime: process.uptime(),
    database,
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────

app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/sanctuary", sanctuaryRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/reactions", reactionsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/achievements", achievementsRoutes);

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      err.message || "Internal server error",

    ...(NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
});

// ─────────────────────────────────────────────
// Database + Server Startup
// ─────────────────────────────────────────────

let httpServer;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    httpServer = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 SkillForge server running on 0.0.0.0:${PORT}`);
      console.log(`🌐 Allowed frontend: ${FRONTEND_URL}`);
      console.log(`📦 Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();

// ─────────────────────────────────────────────
// Process-level error handling
// ─────────────────────────────────────────────

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);

  // Give the process a chance to exit cleanly.
  process.exit(1);
});

// ─────────────────────────────────────────────
// Graceful shutdown
// ─────────────────────────────────────────────

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
