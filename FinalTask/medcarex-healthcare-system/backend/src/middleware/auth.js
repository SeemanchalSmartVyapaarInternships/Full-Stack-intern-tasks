const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const { User } = require("../models");

async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new ApiError(401, "Authentication token is required.");

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ["passwordHash"] },
    });
    if (!user || user.status !== "active") {
      throw new ApiError(401, "User is not active or no longer exists.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, "Invalid or expired token."));
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, "Authentication required."));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action."));
    }
    return next();
  };
}

module.exports = { protect, authorize };
