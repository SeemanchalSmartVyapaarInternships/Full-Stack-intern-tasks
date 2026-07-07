// ============================================================
// JWT Authentication Middleware
// ============================================================
// Extracts and verifies the Bearer token from the Authorization
// header, then attaches the decoded payload to req.user.
// ============================================================

const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/helpers');

function authenticate(req, res, next) {
  try {
    // 1. Extract header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    // 2. Isolate token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 401, 'Access denied. Token is malformed.');
    }

    // 3. Verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token has expired. Please login again.');
    }
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token. Authentication failed.');
    }
    return errorResponse(res, 500, 'Internal server error during authentication.');
  }
}

module.exports = authenticate;
