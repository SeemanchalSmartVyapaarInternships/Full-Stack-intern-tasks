// ============================================================
// Role-Based Access Control (RBAC) Middleware
// ============================================================
// Factory function that returns middleware allowing only the
// specified roles to proceed.  Must be used AFTER authenticate.
// ============================================================

const { errorResponse } = require('../utils/helpers');

/**
 * Restrict access to one or more roles.
 * @param  {...string} allowedRoles  e.g. 'admin', 'manager'
 * @returns {Function} Express middleware
 *
 * @example
 *   router.get('/admin/users', authenticate, authorize('admin'), handler);
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    // authenticate middleware must have run first
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required before authorization.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. This resource requires one of the following roles: ${allowedRoles.join(', ')}.`
      );
    }

    next();
  };
}

module.exports = authorize;
