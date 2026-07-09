const router = require("express").Router();
const authRoutes = require("./authRoutes");
const patientRoutes = require("./patientRoutes");
const doctorRoutes = require("./doctorRoutes");
const appointmentRoutes = require("./appointmentRoutes");
const dashboardRoutes = require("./dashboardRoutes");

router.get("/", (_req, res) => {
  res.json({
    success: true,
    name: "MedCareX API",
    version: "1.0.0",
    modules: ["auth", "patients", "doctors", "appointments", "dashboard"],
  });
});

router.use("/auth", authRoutes);
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
