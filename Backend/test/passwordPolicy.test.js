const assert = require("node:assert/strict");
const test = require("node:test");

const {
  MAX_BCRYPT_PASSWORD_BYTES,
  MIN_PASSWORD_CHARACTERS,
  validateNewPassword,
} = require("../utils/passwordPolicy");

test("new passwords use a 15-character minimum and bcrypt-safe UTF-8 maximum", () => {
  assert.equal(MIN_PASSWORD_CHARACTERS, 15);
  assert.equal(MAX_BCRYPT_PASSWORD_BYTES, 72);
  assert.match(validateNewPassword("short-password"), /at least 15/);
  assert.equal(validateNewPassword("long phrase with spaces"), null);
  assert.equal(validateNewPassword("🌱".repeat(18)), null);
  assert.match(validateNewPassword("🌱".repeat(19)), /72 UTF-8 bytes or fewer/);
  assert.equal(validateNewPassword("a".repeat(72)), null);
  assert.match(validateNewPassword("a".repeat(73)), /72 UTF-8 bytes or fewer/);
  assert.match(validateNewPassword(null), /must be a string/);
});
