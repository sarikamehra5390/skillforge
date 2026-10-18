const test = require("node:test");
const assert = require("node:assert/strict");
const isValidObjectId = require("../utils/isValidObjectId");

test("ObjectId validation accepts valid identifiers", () => {
  assert.equal(isValidObjectId("507f1f77bcf86cd799439011"), true);
});

test("ObjectId validation rejects malformed, empty and non-string identifiers", () => {
  for (const value of ["", "not-an-id", null, undefined, 42, { id: "507f1f77bcf86cd799439011" }]) {
    assert.equal(isValidObjectId(value), false);
  }
});
