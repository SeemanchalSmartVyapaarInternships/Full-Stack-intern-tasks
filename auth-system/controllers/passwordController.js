// ============================================================
// Password Controller — Forgot Password / OTP / Reset
// ============================================================

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Otp } = require('../models');
const { sendOtpEmail } = require('../utils/email');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Generate a random 6-digit OTP.
 */
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// ---- Handlers ----

/**
 * POST /api/auth/forgot-password
 * Generate OTP, store it, and send via email.
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return errorResponse(res, 422, 'Email is required.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      // Don't reveal whether email exists — return success either way
      return successResponse(res, 200, 'If this email is registered, an OTP has been sent.');
    }

    // Delete any existing OTPs for this email
    await Otp.destroy({ where: { email: normalizedEmail } });

    // Generate and store new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.create({
      email: normalizedEmail,
      otp,
      expires_at: expiresAt,
    });

    // Send email
    await sendOtpEmail(normalizedEmail, otp);

    return successResponse(res, 200, 'OTP sent successfully. Check your email.');
  } catch (err) {
    console.error('Forgot Password Error:', err);
    return errorResponse(res, 500, 'Failed to send OTP. Please try again.');
  }
}

/**
 * POST /api/auth/verify-otp
 * Verify OTP and return a temporary reset token.
 */
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 422, 'Email and OTP are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find valid OTP
    const otpRecord = await Otp.findOne({
      where: {
        email: normalizedEmail,
        otp: otp.toString().trim(),
        expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      return errorResponse(res, 400, 'Invalid or expired OTP.');
    }

    // Generate a temporary reset token (15 min expiry)
    const resetToken = jwt.sign(
      { email: normalizedEmail, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return successResponse(res, 200, 'OTP verified successfully.', { resetToken });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * POST /api/auth/reset-password
 * Reset password using the temporary reset token.
 */
async function resetPassword(req, res) {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return errorResponse(res, 422, 'Reset token and new password are required.');
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 422, 'Password must be at least 8 characters.');
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return errorResponse(res, 400, 'Invalid or expired reset token.');
    }

    if (decoded.purpose !== 'password-reset') {
      return errorResponse(res, 400, 'Invalid reset token.');
    }

    // Find user
    const user = await User.scope('withPassword').findOne({
      where: { email: decoded.email },
    });

    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    // Update password (model hook will hash it)
    user.password = newPassword;
    await user.save();

    // Clean up — delete all OTPs for this email
    await Otp.destroy({ where: { email: decoded.email } });

    return successResponse(res, 200, 'Password reset successfully. You can now login.');
  } catch (err) {
    console.error('Reset Password Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

module.exports = { forgotPassword, verifyOtp, resetPassword };
