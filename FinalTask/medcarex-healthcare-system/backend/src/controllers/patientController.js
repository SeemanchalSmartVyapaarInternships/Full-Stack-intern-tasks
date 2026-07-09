const { Op } = require("sequelize");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("../utils/audit");
const { Patient, Appointment, Doctor, User, Department } = require("../models");

function makePatientCode() {
  return `MCX-${Date.now().toString(36).toUpperCase()}`;
}

const listPatients = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const offset = (page - 1) * limit;
  const q = req.query.q;
  const where = q ? {
    [Op.or]: [
      { patientCode: { [Op.like]: `%${q}%` } },
      { firstName: { [Op.like]: `%${q}%` } },
      { lastName: { [Op.like]: `%${q}%` } },
      { phone: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
    ],
  } : {};

  const result = await Patient.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  res.json({ success: true, data: { patients: result.rows, total: result.count, page, limit } });
});

const createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create({
    ...req.body,
    patientCode: makePatientCode(),
    createdBy: req.user.id,
  });

  await logActivity({ userId: req.user.id, action: "CREATE", entity: "Patient", entityId: patient.id });
  res.status(201).json({ success: true, message: "Patient created.", data: { patient } });
});

const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByPk(req.params.id, {
    include: [{
      model: Appointment,
      as: "appointments",
      include: [{ model: Doctor, as: "doctor", include: [{ model: User, as: "user" }, { model: Department, as: "department" }] }],
      limit: 10,
      order: [["scheduledAt", "DESC"]],
    }],
  });
  if (!patient) throw new ApiError(404, "Patient not found.");
  res.json({ success: true, data: { patient } });
});

const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByPk(req.params.id);
  if (!patient) throw new ApiError(404, "Patient not found.");

  await patient.update(req.body);
  await logActivity({ userId: req.user.id, action: "UPDATE", entity: "Patient", entityId: patient.id });

  res.json({ success: true, message: "Patient updated.", data: { patient } });
});

module.exports = { listPatients, createPatient, getPatient, updatePatient };
