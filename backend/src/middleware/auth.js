import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'medcarex-dev-secret-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '4h';

export function createAuthMiddleware(User) {
  return async (req, res, next) => {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
      const payload = jwt.verify(header.slice(7).trim(), JWT_SECRET);
      const user = await User.findByPk(payload.sub);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User session invalid.' });
      }
      req.user = user;
      return next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired JWT token.' });
    }
  };
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires role in [${roles.join(', ')}]`,
      });
    }
    return next();
  };
}
