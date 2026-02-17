/**
 * Authentication middleware
 * Supports:
 * 1. Gateway API Key validation
 * 2. JWT user authentication
 */

const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("../../utils/errors");
const config = require("../../utils/config");
const logger = require("../../utils/logger");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AuthenticationError("Missing authorization header"));
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  // 🔐 1️⃣ Check if it's gateway API key
  if (token === config.gatewayApiKey) {
    req.gateway = true;
    return next();
  }

  // 🔐 2️⃣ Otherwise treat as JWT
  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    return next();
  } catch (err) {
    logger.warn("Authentication failed", {
      ip: req.ip,
      path: req.path,
    });

    return next(new AuthenticationError("Invalid token"));
  }
}

module.exports = authenticate;
