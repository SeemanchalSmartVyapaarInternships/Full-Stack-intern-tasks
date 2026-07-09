const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("../utils/audit");
const { Appointment, Patient, Doctor, User, Department } = require("../models");

const include = [
  { model: Patient, as: "patient" },
  { model: Doctor, as: "doctor", include: [{ model: User, as: "user" }, { model: Department, as: "department" }] },
];

const listAppointments = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.patientId) where.patientId = req.query.patientId;
  if (req.query.doctorId) where.doctorId = req.query.doctorId;
  if (req.query.status) where.status = req.query.status;

  const appointments = await Appointment.findAll({
    where,
    include,
    order: [["scheduledAt", "DESC"]],
    limit: 100,
  });
  res.json({ success: true, data: { appointments } });
});

const createAppointment = asyncHandler(async (req, res) => {
  const [patient, doctor] = await Promise.all([
    Patient.findByPk(req.body.patientId),
    Doctor.findByPk(req.body.doctorId),
  ]);
  if (!patient) throw new ApiError(404, "Patient not found.");
  if (!doctor || doctor.status !== "active") throw new ApiError(404, "Active doctor not found.");

  const appointment = await Appointment.create({ ...req.body, createdBy: req.user.id });
  await logActivity({ userId: req.user.id, action: "CREATE", entity: "Appointment", entityId: appointment.id });

  const created = await Appointment.findByPk(appointment.id, { include });
  res.status(201).json({ success: true, message: "Appointment booked.", data: { appointment: created } });
});

const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found.");

  await appointment.update(req.body);
  await logActivity({ userId: req.user.id, action: "UPDATE", entity: "Appointment", entityId: appointment.id });

  const updated = await Appointment.findByPk(appointment.id, { include });
  res.json({ success: true, message: "Appointment updated.", data: { appointment: updated } });
});

module.exports = { listAppointments, createAppointment, updateAppointment };
