// ============================================================
// User Controller — Profile Management
// ============================================================

const { User } = require('../models');
const { successResponse, errorResponse, sanitiseUser } = require('../utils/helpers');

/**
 * PATCH /api/users/profile
 * Update authenticated user's display name.
 */
async function updateProfile(req, res) {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return errorResponse(res, 422, 'Name must be at least 2 characters.');
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    user.name = name.trim();
    await user.save();

    return successResponse(res, 200, 'Profile updated successfully.', {
      user: sanitiseUser(user),
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

module.exports = { updateProfile };
