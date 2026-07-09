const router = require("express").Router();
const { listAppointments, createAppointment, updateAppointment } = require("../controllers/appointmentController");
const { appointmentRules, appointmentUpdateRules, idParam, historyRules } = require("../validators/appointmentValidator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", authorize("admin", "doctor", "receptionist", "nurse"), historyRules, validate, listAppointments);
router.post("/", authorize("admin", "receptionist"), appointmentRules, validate, createAppointment);
router.put("/:id", authorize("admin", "doctor", "receptionist", "nurse"), idParam, appointmentUpdateRules, validate, updateAppointment);

module.exports = router;
