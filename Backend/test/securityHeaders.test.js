const assert = require("node:assert/strict");
const { once } = require("node:events");
const express = require("express");
const helmet = require("helmet");
const test = require("node:test");

test("Helmet adds baseline browser security headers", async (t) => {
  const app = express();
  app.use(helmet());
  app.get("/", (_req, res) => res.json({ success: true }));
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(async () => {
    server.close();
    await once(server, "close");
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
});
