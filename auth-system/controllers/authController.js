// ============================================================
// Auth Controller — Register, Login, Profile
// ============================================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { successResponse, errorResponse, sanitiseUser } = require('../utils/helpers');

/**
 * Generate a signed JWT for a user.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

// ---- Handlers ----

/**
 * POST /api/auth/register
 * Register a new user. Defaults to 'employee' role.
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Check for existing user
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return errorResponse(res, 409, 'An account with this email already exists.');
    }

    // Create user (password hashed via model hook)
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user);

    return successResponse(res, 201, 'User registered successfully.', {
      user: sanitiseUser(user),
      token,
    });
  } catch (err) {
    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const messages = err.errors.map((e) => e.message);
      return errorResponse(res, 422, 'Validation failed.', messages);
    }
    console.error('Register Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user WITH password (uses named scope)
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Verify password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Generate token
    const token = generateToken(user);

    return successResponse(res, 200, 'Login successful.', {
      user: sanitiseUser(user),
      token,
    });
  } catch (err) {
    console.error('Login Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * GET /api/auth/profile
 * Return the authenticated user's profile.
 */
async function getProfile(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    return successResponse(res, 200, 'Profile retrieved successfully.', {
      user: sanitiseUser(user),
    });
  } catch (err) {
    console.error('Profile Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

module.exports = { register, login, getProfile };
