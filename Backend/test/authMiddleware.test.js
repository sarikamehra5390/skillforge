const assert = require("node:assert/strict");
const { once } = require("node:events");
const express = require("express");
const jwt = require("jsonwebtoken");
const test = require("node:test");

const User = require("../models/User");
const auth = require("../middleware/auth");

const SECRET = "auth-middleware-test-secret-at-least-32-characters";
const USER_ID = "507f1f77bcf86cd799439011";

test("auth middleware validates JWTs and distinguishes auth from database failures", async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  const previousFindById = User.findById;
  process.env.JWT_SECRET = SECRET;

  const app = express();
  app.get("/protected", auth, (req, res) => {
    res.json({ id: String(req.user._id) });
  });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/protected`;

  t.after(async () => {
    User.findById = previousFindById;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
    server.close();
    await once(server, "close");
  });

  User.findById = async (id) => (String(id) === USER_ID ? { _id: id } : null);
  const signedToken = jwt.sign({ id: USER_ID }, SECRET, { expiresIn: "1m" });

  const valid = await fetch(url, { headers: { Authorization: `Bearer ${signedToken}` } });
  assert.equal(valid.status, 200);
  assert.deepEqual(await valid.json(), { id: USER_ID });

  const missing = await fetch(url);
  assert.equal(missing.status, 401);

  const malformed = await fetch(url, { headers: { Authorization: "Bearer not-a-jwt" } });
  assert.equal(malformed.status, 401);

  const badSignature = jwt.sign({ id: USER_ID }, "a-different-test-secret-with-32-characters", { expiresIn: "1m" });
  const invalid = await fetch(url, { headers: { Authorization: `Bearer ${badSignature}` } });
  assert.equal(invalid.status, 401);

  const wrongAlgorithm = jwt.sign({ id: USER_ID }, SECRET, { algorithm: "HS384", expiresIn: "1m" });
  const wrongAlgorithmResponse = await fetch(url, { headers: { Authorization: `Bearer ${wrongAlgorithm}` } });
  assert.equal(wrongAlgorithmResponse.status, 401);

  const expiredToken = jwt.sign({ id: USER_ID }, SECRET, { expiresIn: -1 });
  const expired = await fetch(url, { headers: { Authorization: `Bearer ${expiredToken}` } });
  assert.equal(expired.status, 401);

  const noExpiration = jwt.sign({ id: USER_ID }, SECRET);
  const noExpiry = await fetch(url, { headers: { Authorization: `Bearer ${noExpiration}` } });
  assert.equal(noExpiry.status, 401);

  User.findById = async () => null;
  const deletedUser = await fetch(url, { headers: { Authorization: `Bearer ${signedToken}` } });
  assert.equal(deletedUser.status, 401);

  User.findById = async () => { throw new Error("database credentials must not leak"); };
  const databaseFailure = await fetch(url, { headers: { Authorization: `Bearer ${signedToken}` } });
  assert.equal(databaseFailure.status, 500);
  assert.deepEqual(await databaseFailure.json(), {
    success: false,
    message: "Authentication could not be verified. Please try again.",
  });
});
