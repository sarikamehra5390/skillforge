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

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const corsOrigins = [FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"];
if (process.env.NODE_ENV === "production") {
  corsOrigins.push(/\.onrender\.com$/);
}

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const matched = corsOrigins.some(
        (o) => typeof o === "string" ? o === origin : o.test(origin)
      );
      if (matched) return cb(null, true);
      if (process.env.NODE_ENV === "production") {
        return cb(new Error(`CORS blocked origin: ${origin}`), false);
      }
      return cb(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ message: "SkillForge API Running" });
});

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    database: states[dbState] || "unknown",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

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

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
  console.log(`Allowed frontend: ${FRONTEND_URL}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection:", err);
});
