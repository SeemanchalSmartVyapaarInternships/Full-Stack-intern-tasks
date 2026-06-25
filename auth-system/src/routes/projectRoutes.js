const express = require("express");
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} = require("../controllers/projectController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/rbac");

const router = express.Router();

router.get("/", auth, getAllProjects);
router.get("/:id", auth, getProjectById);
router.post("/", auth, authorize("admin", "manager"), createProject);
router.put("/:id", auth, authorize("admin", "manager"), updateProject);
router.delete("/:id", auth, authorize("admin"), deleteProject);

// Member management
router.post("/:id/members", auth, authorize("admin", "manager"), addProjectMember);
router.delete("/:id/members/:userId", auth, authorize("admin", "manager"), removeProjectMember);

module.exports = router;
