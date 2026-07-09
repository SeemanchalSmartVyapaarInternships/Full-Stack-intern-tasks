const router = require("express").Router();
const {
  listDepartments,
  createDepartment,
  listDoctors,
  createDoctor,
  updateDoctor,
} = require("../controllers/doctorController");
const { departmentRules, doctorRules, doctorUpdateRules, idParam, listRules } = require("../validators/doctorValidator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/departments", authorize("admin", "doctor", "receptionist", "nurse"), listDepartments);
router.post("/departments", authorize("admin"), departmentRules, validate, createDepartment);
router.get("/", authorize("admin", "doctor", "receptionist", "nurse", "patient"), listRules, validate, listDoctors);
router.post("/", authorize("admin"), doctorRules, validate, createDoctor);
router.put("/:id", authorize("admin"), idParam, doctorUpdateRules, validate, updateDoctor);

module.exports = router;
