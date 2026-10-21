const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Make sure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Get Authorization header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validate Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify JWT
    // Login and registration issue HS256 tokens. Pin the verification
    // algorithm so a token signed with an unintended algorithm is never
    // accepted through jsonwebtoken's default algorithm selection.
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded?.id || !Number.isFinite(decoded.exp)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach authenticated user and token to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("Authentication error:", { name: error.name });

    // JWT-specific errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // Invalid MongoDB ObjectId / user lookup errors
    if (error.name === "CastError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // Database and infrastructure failures are not authentication failures.
    // Returning 401 here makes clients discard a still-valid token during a
    // transient outage and can cause repeated login redirects.
    return res.status(500).json({
      success: false,
      message: "Authentication could not be verified. Please try again.",
    });
  }
};

module.exports = auth;
