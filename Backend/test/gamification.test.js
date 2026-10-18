const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateStreakState,
  getFreshStreakValue,
} = require("../utils/gamification");

const practice = (completedAt, duration = 20) => ({ completedAt, duration });
const now = new Date("2026-10-18T12:00:00.000Z");

test("first practice starts a streak of one", () => {
  assert.equal(calculateCurrentStreak([practice("2026-10-18T08:00:00Z")], now), 1);
});

test("multiple practices on the same day count once", () => {
  assert.equal(calculateCurrentStreak([
    practice("2026-10-18T08:00:00Z"),
    practice("2026-10-18T21:00:00Z"),
  ], now), 1);
});

test("consecutive calendar days increment the streak", () => {
  assert.equal(calculateCurrentStreak([
    practice("2026-10-18T08:00:00Z"),
    practice("2026-10-17T23:59:00Z"),
    practice("2026-10-16T12:00:00Z"),
  ], now), 3);
});

test("a missed calendar day resets current streak to latest run", () => {
  assert.equal(calculateCurrentStreak([
    practice("2026-10-18T08:00:00Z"),
    practice("2026-10-16T08:00:00Z"),
    practice("2026-10-15T08:00:00Z"),
  ], now), 1);
});

test("longest streak records the maximum historical run", () => {
  assert.equal(calculateLongestStreak([
    practice("2026-10-18T08:00:00Z"),
    practice("2026-10-17T08:00:00Z"),
    practice("2026-10-16T08:00:00Z"),
    practice("2026-10-14T08:00:00Z"),
  ]), 3);
});

test("editing duration or duplicate sessions does not double-count a day", () => {
  assert.equal(calculateCurrentStreak([
    practice("2026-10-18T08:00:00Z", 45),
    practice("2026-10-18T08:00:00Z", 20),
    practice("2026-10-17T08:00:00Z"),
  ], now), 2);
});

test("deleting one of several sessions preserves the practice day", () => {
  assert.equal(calculateCurrentStreak([
    practice("2026-10-18T21:00:00Z"),
    practice("2026-10-17T08:00:00Z"),
  ], now), 2);
});

test("deleting the only session for a day recalculates remaining history", () => {
  assert.equal(calculateCurrentStreak([
    practice("2026-10-18T08:00:00Z"),
    practice("2026-10-16T08:00:00Z"),
  ], now), 1);
});

test("invalid and unsuccessful sessions are ignored", () => {
  assert.equal(calculateCurrentStreak([
    practice("not-a-date"),
    { completedAt: null, duration: 10 },
    practice("2026-10-18T08:00:00Z", 0),
  ], now), 0);
});

test("recalculation after refresh is deterministic", () => {
  const sessions = [practice("2026-10-18T08:00:00Z"), practice("2026-10-17T08:00:00Z")];
  assert.equal(calculateCurrentStreak(sessions, now), calculateCurrentStreak(sessions, now));
});

test("UTC midnight boundaries use calendar days, not elapsed 24-hour windows", () => {
  assert.equal(calculateCurrentStreak([
    practice("2026-10-18T00:01:00Z"),
    practice("2026-10-17T23:59:00Z"),
  ], now), 2);
});

test("UTC month-end and year-end transitions remain consecutive calendar days", () => {
  assert.equal(calculateCurrentStreak([
    practice("2026-01-01T00:01:00Z"),
    practice("2025-12-31T23:59:00Z"),
    practice("2025-12-30T12:00:00Z"),
  ], new Date("2026-01-01T12:00:00Z")), 3);
});

test("future-dated sessions do not start or extend a streak", () => {
  assert.equal(calculateCurrentStreak([
    practice("2026-10-19T09:00:00Z"),
  ], now), 0);
});

test("shared streak state returns first-day progress and keeps historical best", () => {
  const state = calculateStreakState([
    practice("2026-10-18T08:00:00Z"),
  ], now);
  assert.equal(state.streak, 1);
  assert.equal(state.longestStreak, 1);
  assert.equal(state.lastPracticeDate.toISOString(), "2026-10-18T08:00:00.000Z");
});

test("repeated concurrent session records remain one streak day", () => {
  const duplicateWrites = Array.from({ length: 20 }, () => practice("2026-10-18T09:00:00Z"));
  assert.equal(calculateCurrentStreak(duplicateWrites, now), 1);
});

test("persisted streak expires after a full missed calendar day", () => {
  assert.equal(getFreshStreakValue(4, "2026-10-16T22:00:00Z", now), 0);
  assert.equal(getFreshStreakValue(4, "2026-10-17T23:59:00Z", now), 4);
});
