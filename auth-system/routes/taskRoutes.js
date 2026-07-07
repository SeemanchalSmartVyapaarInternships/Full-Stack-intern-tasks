// ============================================================
// Task Routes — REST API
// ============================================================

const express = require('express');
const router = express.Router();

const {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// All task routes require authentication
router.use(authenticate);

// Public/Employee read, Admin/Manager write
router.get('/', listTasks);
router.get('/:id', getTask);
router.post('/', authorize('admin', 'manager'), createTask);
router.put('/:id', updateTask); // Authorized roles checked inside controller (for Employees)
router.delete('/:id', authorize('admin', 'manager'), deleteTask);

module.exports = router;
