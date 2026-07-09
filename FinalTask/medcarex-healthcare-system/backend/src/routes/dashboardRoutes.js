const router = require("express").Router();
const { getDashboard } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("admin", "doctor", "receptionist", "nurse"), getDashboard);

module.exports = router;
