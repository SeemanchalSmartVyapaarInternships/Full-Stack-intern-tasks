// ============================================================
// User Routes — Profile Management
// ============================================================

const express = require('express');
const router = express.Router();

const { updateProfile } = require('../controllers/userController');
const authenticate = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

router.patch('/profile', updateProfile);

module.exports = router;
