// ============================================================
// Project Routes — REST API
// ============================================================

const express = require('express');
const router = Router = express.Router();

const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} = require('../controllers/projectController');

const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// All project routes require authentication
router.use(authenticate);

// Public/Employee read, Admin/Manager write
router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', authorize('admin', 'manager'), createProject);
router.put('/:id', authorize('admin', 'manager'), updateProject);
router.delete('/:id', authorize('admin'), deleteProject);

// Member management (Admin/Manager only)
router.post('/:id/members', authorize('admin', 'manager'), addProjectMember);
router.delete('/:id/members/:userId', authorize('admin', 'manager'), removeProjectMember);

module.exports = router;
