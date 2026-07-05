// ============================================================
// Google Auth Controller — OAuth 2.0 Sign-In
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

/**
 * POST /api/auth/google
 * Exchange a Google access token for an internal JWT.
 * Fetches user profile from Google, creates account if needed.
 */
async function googleAuth(req, res) {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return errorResponse(res, 422, 'Google access token is required.');
    }

    // Fetch user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!response.ok) {
      return errorResponse(res, 401, 'Invalid Google access token.');
    }

    const googleUser = await response.json();
    const { email, name, sub: googleId } = googleUser;

    if (!email) {
      return errorResponse(res, 400, 'Unable to retrieve email from Google account.');
    }

    // Find or create user
    let user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      // Create new user with a random password (they'll use Google to login)
      const randomPassword = require('crypto').randomBytes(32).toString('hex') + 'Aa1!';
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: randomPassword,
        role: 'employee',
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return successResponse(res, 200, 'Google authentication successful.', {
      user: sanitiseUser(user),
      token,
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return errorResponse(res, 500, 'Google authentication failed.');
  }
}

/**
 * GET /api/auth/google/config
 * Returns public Google Client ID for OAuth flow setup on frontend.
 */
async function getGoogleConfig(req, res) {
  try {
    return successResponse(res, 200, 'Google config retrieved.', {
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    });
  } catch (err) {
    console.error('Google Config Error:', err);
    return errorResponse(res, 500, 'Failed to retrieve Google config.');
  }
}

module.exports = { googleAuth, getGoogleConfig };
