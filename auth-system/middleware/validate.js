// ============================================================
// Input Validation Middleware
// ============================================================
// Pure validation — no external libraries required.
// Returns 422 with descriptive error messages on failure.
// ============================================================

const { errorResponse } = require('../utils/helpers');

// ---- Helpers ----

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password policy:
 *  - Minimum 8 characters
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 *  - At least one special character
 */
function getPasswordErrors(password) {
  const errors = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters long.');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter.');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one digit.');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }
  return errors;
}

// ---- Validators ----

/**
 * Validate registration payload: name, email, password.
 */
function validateRegistration(req, res, next) {
  const errors = [];
  const { name, email, password } = req.body;

  // Name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required.');
  } else if (name.trim().length < 2 || name.trim().length > 100) {
    errors.push('Name must be between 2 and 100 characters.');
  }

  // Email
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  // Password
  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  } else {
    errors.push(...getPasswordErrors(password));
  }

  if (errors.length > 0) {
    return errorResponse(res, 422, 'Validation failed.', errors);
  }

  // Sanitise
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
}

/**
 * Validate login payload: email, password.
 */
function validateLogin(req, res, next) {
  const errors = [];
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required.');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return errorResponse(res, 422, 'Validation failed.', errors);
  }

  req.body.email = email.trim().toLowerCase();

  next();
}

/**
 * Validate role update payload.
 */
function validateRoleUpdate(req, res, next) {
  const { role } = req.body;
  const validRoles = ['admin', 'manager', 'employee'];

  if (!role || !validRoles.includes(role)) {
    return errorResponse(
      res,
      422,
      `Invalid role. Must be one of: ${validRoles.join(', ')}.`
    );
  }

  next();
}

module.exports = { validateRegistration, validateLogin, validateRoleUpdate };
