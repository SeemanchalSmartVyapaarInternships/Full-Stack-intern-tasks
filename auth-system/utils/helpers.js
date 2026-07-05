// ============================================================
// Response Helpers & Utilities
// ============================================================

/**
 * Send a standardised success response.
 */
function successResponse(res, statusCode, message, data = null) {
  const body = {
    success: true,
    message,
  };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
}

/**
 * Send a standardised error response.
 */
function errorResponse(res, statusCode, message, errors = null) {
  const body = {
    success: false,
    message,
  };
  if (errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Strip sensitive fields from a user object for API output.
 */
function sanitiseUser(user) {
  const plain = user.toJSON ? user.toJSON() : { ...user };
  delete plain.password;
  return plain;
}

module.exports = { successResponse, errorResponse, sanitiseUser };
