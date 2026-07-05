// ============================================================
// Auth Routes — Public & Protected
// ============================================================

const express = require('express');
const router = express.Router();

const { register, login, getProfile } = require('../controllers/authController');
const { forgotPassword, verifyOtp, resetPassword } = require('../controllers/passwordController');
const { googleAuth, getGoogleConfig } = require('../controllers/googleAuthController');
const authenticate = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validate');

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Forgot Password flow (public)
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Google OAuth (public)
router.post('/google', googleAuth);
router.get('/google/config', getGoogleConfig);

// Protected routes (any authenticated user)
router.get('/profile', authenticate, getProfile);

module.exports = router;
