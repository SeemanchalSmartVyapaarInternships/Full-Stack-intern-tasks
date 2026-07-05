// ============================================================
// Role-Specific Demo Routes — Manager & Employee
// ============================================================
// These routes demonstrate RBAC at different access levels.
// ============================================================

const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const { successResponse } = require('../utils/helpers');

// ---- Manager Routes (admin + manager) ----
router.get(
  '/manager/reports',
  authenticate,
  authorize('admin', 'manager'),
  (req, res) => {
    return successResponse(res, 200, 'Manager reports accessed successfully.', {
      reports: [
        { id: 1, title: 'Q2 Sales Summary', status: 'completed' },
        { id: 2, title: 'Team Performance Review', status: 'in-progress' },
        { id: 3, title: 'Budget Allocation Plan', status: 'pending' },
      ],
    });
  }
);

// ---- Employee Routes (admin + manager + employee) ----
router.get(
  '/employee/dashboard',
  authenticate,
  authorize('admin', 'manager', 'employee'),
  (req, res) => {
    return successResponse(res, 200, 'Employee dashboard accessed successfully.', {
      dashboard: {
        welcomeMessage: `Welcome, ${req.user.email}!`,
        role: req.user.role,
        announcements: [
          'Company town hall on Friday at 3 PM.',
          'New health benefits enrollment opens next week.',
        ],
      },
    });
  }
);

module.exports = router;
