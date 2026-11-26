import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ALLOWED_ROLES, env } from '../config/env.js';
import {
  createUser,
  findUserByEmail,
  listSafeUsers,
  toSafeUser,
  updateUserRole,
} from '../models/userStore.js';

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'Employee' } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}.`,
      });
    }
    if (findUserByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
    const created = createUser({ name, email, passwordHash, role });
    const token = signAccessToken(created);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: toSafeUser(created),
        accessToken: token,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signAccessToken(user);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: toSafeUser(user),
        accessToken: token,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: { user: req.user },
  });
}

export function getAllUsers(req, res) {
  return res.status(200).json({
    success: true,
    data: { users: listSafeUsers() },
  });
}

export function changeUserRole(req, res) {
  const { role } = req.body || {};
  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}.`,
    });
  }

  const updated = updateUserRole(req.params.id, role);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.status(200).json({
    success: true,
    message: 'User role updated.',
    data: { user: updated },
  });
}
