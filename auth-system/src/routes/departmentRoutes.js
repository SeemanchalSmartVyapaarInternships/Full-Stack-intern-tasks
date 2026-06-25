const express = require("express");
const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/rbac");

const router = express.Router();

router.get("/", auth, getAllDepartments);
router.get("/:id", auth, getDepartmentById);
router.post("/", auth, authorize("admin"), createDepartment);
router.put("/:id", auth, authorize("admin"), updateDepartment);
router.delete("/:id", auth, authorize("admin"), deleteDepartment);

module.exports = router;
