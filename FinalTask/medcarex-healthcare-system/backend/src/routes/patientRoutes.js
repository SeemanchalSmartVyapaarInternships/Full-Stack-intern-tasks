const router = require("express").Router();
const { listPatients, createPatient, getPatient, updatePatient } = require("../controllers/patientController");
const { patientBodyRules, idParam, listRules } = require("../validators/patientValidator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", authorize("admin", "doctor", "receptionist", "nurse"), listRules, validate, listPatients);
router.post("/", authorize("admin", "receptionist", "nurse"), patientBodyRules, validate, createPatient);
router.get("/:id", authorize("admin", "doctor", "receptionist", "nurse"), idParam, validate, getPatient);
router.put("/:id", authorize("admin", "receptionist", "nurse"), idParam, patientBodyRules, validate, updatePatient);

module.exports = router;
