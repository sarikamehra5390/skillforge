const mongoose = require("mongoose");

// Mongoose exposes the validator on ObjectId, not mongoose.Types itself.
const isValidObjectId = (value) =>
  typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

module.exports = isValidObjectId;
