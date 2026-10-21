const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Session = require("../models/Session");
const SanctuarySettings = require("../models/SanctuarySettings");

process.env.JWT_SECRET = "test-only-secret-with-at-least-32-characters";
process.env.NODE_ENV = "test";
const userRoutes = require("../routes/userRoutes");

const withLoginServer = async (callback) => {
  const app = express();
  app.use(express.json());
  app.use("/api/users", userRoutes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const address = server.address();
    return await callback(`http://127.0.0.1:${address.port}/api/users/login`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

test("login returns the existing contract and loads streak/settings data concurrently with a narrow indexed session query", async (t) => {
  assert.ok(Session.schema.indexes().some(([fields]) => (
    fields.userId === 1 && fields.completedAt === 1
  )));

  const originalFindOne = User.findOne;
  const originalUpdateOne = User.updateOne;
  const originalSessionFind = Session.find;
  const originalSettingsFindOne = SanctuarySettings.findOne;
  const originalInfo = console.info;
  const events = [];
  const user = {
    _id: "507f1f77bcf86cd799439011",
    username: "learner",
    email: "learner@example.com",
    password: await bcrypt.hash("secret123", 4),
    xp: 250,
    level: 3,
    streak: 0,
    longestStreak: 0,
    lastPracticeDate: undefined,
  };

  User.findOne = async (filter) => {
    assert.deepEqual(filter, { email: "learner@example.com" });
    return user;
  };
  User.updateOne = async () => ({ acknowledged: true });
  Session.find = (filter) => {
    events.push("sessions-started");
    assert.equal(filter.userId, user._id);
    assert.deepEqual(filter.duration, { $gt: 0 });
    assert.ok(filter.completedAt.$lte instanceof Date);
    return {
      select(projection) {
        assert.equal(projection, "completedAt duration -_id");
        return this;
      },
      lean: async () => [],
    };
  };
  SanctuarySettings.findOne = async () => {
    events.push("settings-started");
    return { theme: "classic", treeType: "sprout" };
  };
  console.info = (message, details) => {
    if (message === "LOGIN TIMING:") events.push(details);
  };

  t.after(() => {
    User.findOne = originalFindOne;
    User.updateOne = originalUpdateOne;
    Session.find = originalSessionFind;
    SanctuarySettings.findOne = originalSettingsFindOne;
    console.info = originalInfo;
  });

  await withLoginServer(async (url) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: " Learner@example.com ", password: "secret123" }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(body.token);
    assert.deepEqual(body.user.sanctuarySettings, { theme: "classic", treeType: "sprout" });
    assert.equal(body.user.streak, 0);
    assert.ok(events.indexOf("sessions-started") >= 0);
    assert.ok(events.indexOf("settings-started") >= 0);
    const timing = events.find((event) => typeof event === "object");
    assert.equal(timing.outcome, "success");
    assert.equal(typeof timing.totalMs, "number");
    assert.equal(JSON.stringify(timing).includes("learner@example.com"), false);
    assert.equal(JSON.stringify(timing).includes("secret123"), false);
  });
});

test("invalid credentials do not start session or sanctuary work", async (t) => {
  const originalFindOne = User.findOne;
  const originalSessionFind = Session.find;
  const originalSettingsFindOne = SanctuarySettings.findOne;
  const user = {
    _id: "507f1f77bcf86cd799439011",
    password: await bcrypt.hash("secret123", 4),
  };
  User.findOne = async () => user;
  Session.find = () => assert.fail("Session lookup should not run for invalid credentials");
  SanctuarySettings.findOne = () => assert.fail("Sanctuary lookup should not run for invalid credentials");
  t.after(() => {
    User.findOne = originalFindOne;
    Session.find = originalSessionFind;
    SanctuarySettings.findOne = originalSettingsFindOne;
  });

  await withLoginServer(async (url) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "learner@example.com", password: "wrongpass" }),
    });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).message, "Invalid credentials");
  });
});
