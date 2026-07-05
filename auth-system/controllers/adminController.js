// ============================================================
// Admin Controller — User Management (Admin-only)
// ============================================================

const { User } = require('../models');
const { successResponse, errorResponse, sanitiseUser } = require('../utils/helpers');

/**
 * GET /api/admin/users
 * List all users with pagination.
 */
async function listUsers(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      order: [['id', 'ASC']],
      limit,
      offset,
    });

    return successResponse(res, 200, 'Users retrieved successfully.', {
      users: users.map(sanitiseUser),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error('List Users Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * PUT /api/admin/users/:id/role
 * Update a user's role.
 */
async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    // Prevent admin from demoting themselves
    if (parseInt(id, 10) === req.user.id && role !== 'admin') {
      return errorResponse(res, 400, 'You cannot change your own admin role.');
    }

    user.role = role;
    await user.save();

    return successResponse(res, 200, 'User role updated successfully.', {
      user: sanitiseUser(user),
    });
  } catch (err) {
    console.error('Update Role Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * DELETE /api/admin/users/:id
 * Delete a user.
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (parseInt(id, 10) === req.user.id) {
      return errorResponse(res, 400, 'You cannot delete your own account.');
    }

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    await user.destroy();

    return successResponse(res, 200, 'User deleted successfully.');
  } catch (err) {
    console.error('Delete User Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

module.exports = { listUsers, updateUserRole, deleteUser };
