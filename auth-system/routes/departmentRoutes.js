// ============================================================
// Department Routes — REST API
// ============================================================

const express = require('express');
const router = express.Router();

const {
  createDepartment,
  listDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// All department routes require authentication
router.use(authenticate);

// Public/Employee read, Admin/Manager write
router.get('/', listDepartments);
router.get('/:id', getDepartment);
router.post('/', authorize('admin', 'manager'), createDepartment);
router.put('/:id', authorize('admin', 'manager'), updateDepartment);
router.delete('/:id', authorize('admin'), deleteDepartment);

module.exports = router;
