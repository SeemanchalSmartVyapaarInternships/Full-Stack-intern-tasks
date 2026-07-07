// ============================================================
// Admin Routes — Admin-Only User Management
// ============================================================

const express = require('express');
const router = express.Router();

const { listUsers, updateUserRole, deleteUser, updateUser } = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const { validateRoleUpdate } = require('../middleware/validate');

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', listUsers);
router.put('/users/:id/role', validateRoleUpdate, updateUserRole);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
