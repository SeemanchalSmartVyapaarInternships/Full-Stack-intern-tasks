const express = require("express");
const {
  getActivityLogs,
  getLoginHistory,
  getUploadHistory,
  getTaskUpdates,
} = require("../controllers/activityController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/rbac");

const router = express.Router();

// All routes require authentication and manager/admin roles
router.get("/", auth, authorize("admin", "manager"), getActivityLogs);
router.get("/login-history", auth, authorize("admin", "manager"), getLoginHistory);
router.get("/upload-history", auth, authorize("admin", "manager"), getUploadHistory);
router.get("/task-updates", auth, authorize("admin", "manager"), getTaskUpdates);

module.exports = router;
