export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user context missing.',
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of [${allowedRoles.join(', ')}] roles.`,
      });
    }
    return next();
  };
}
