import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserById, toSafeUser } from '../models/userStore.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Provide a Bearer token.',
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is missing.',
    });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token subject no longer exists.',
      });
    }
    req.user = toSafeUser(user);
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError' ? 'Access token expired.' : 'Invalid access token.',
    });
  }
}
