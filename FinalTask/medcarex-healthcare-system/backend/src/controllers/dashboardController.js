const { fn, col, literal, Op } = require("sequelize");
const asyncHandler = require("../utils/asyncHandler");
const { Patient, Doctor, Appointment, ActivityLog, User, Department } = require("../models");

const getDashboard = asyncHandler(async (_req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalPatients,
    activeDoctors,
    todayAppointments,
    bookedAppointments,
    appointmentTrend,
    departmentRows,
    recentActivities,
  ] = await Promise.all([
    Patient.count(),
    Doctor.count({ where: { status: "active" } }),
    Appointment.count({ where: { scheduledAt: { [Op.gte]: todayStart } } }),
    Appointment.count({ where: { status: "booked" } }),
    Appointment.findAll({
      attributes: [
        [fn("DATE", col("scheduled_at")), "date"],
        [fn("COUNT", col("Appointment.id")), "count"],
      ],
      group: [literal("DATE(scheduled_at)")],
      order: [[literal("DATE(scheduled_at)"), "ASC"]],
      limit: 7,
      raw: true,
    }),
    Doctor.findAll({
      attributes: [
        "departmentId",
        [fn("COUNT", col("Doctor.id")), "doctorCount"],
      ],
      include: [{ model: Department, as: "department", attributes: ["id", "name"] }],
      group: ["Doctor.department_id", "department.id", "department.name"],
      order: [[literal("doctorCount"), "DESC"]],
      limit: 6,
      raw: true,
      nest: true,
    }),
    ActivityLog.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "name", "role"] }],
      order: [["createdAt", "DESC"]],
      limit: 10,
    }),
  ]);

  res.json({
    success: true,
    data: {
      stats: { totalPatients, activeDoctors, todayAppointments, bookedAppointments },
      appointmentTrend,
      departmentLoad: departmentRows.map((row) => ({
        id: row.department.id,
        name: row.department.name,
        doctorCount: Number(row.doctorCount),
      })),
      recentActivities,
    },
  });
});

module.exports = { getDashboard };
