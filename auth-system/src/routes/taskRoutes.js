const express = require("express");
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/rbac");

const router = express.Router();

router.get("/", auth, getAllTasks);
router.get("/:id", auth, getTaskById);
router.post("/", auth, authorize("admin", "manager"), createTask);
router.put("/:id", auth, updateTask);
router.patch("/:id", auth, updateTask);
router.delete("/:id", auth, authorize("admin", "manager"), deleteTask);

module.exports = router;
