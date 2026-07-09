const { Op } = require("sequelize");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { logActivity } = require("../utils/audit");
const { sequelize, Doctor, Department, User } = require("../models");

const listDepartments = asyncHandler(async (_req, res) => {
  const departments = await Department.findAll({ order: [["name", "ASC"]] });
  res.json({ success: true, data: { departments } });
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create({
    name: req.body.name,
    code: req.body.code.toUpperCase(),
    description: req.body.description,
  });
  await logActivity({ userId: req.user.id, action: "CREATE", entity: "Department", entityId: department.id });
  res.status(201).json({ success: true, message: "Department created.", data: { department } });
});

const listDoctors = asyncHandler(async (req, res) => {
  const doctorWhere = {};
  const userWhere = {};
  if (req.query.departmentId) doctorWhere.departmentId = req.query.departmentId;
  if (req.query.q) {
    userWhere[Op.or] = [
      { name: { [Op.like]: `%${req.query.q}%` } },
      { email: { [Op.like]: `%${req.query.q}%` } },
    ];
  }

  const doctors = await Doctor.findAll({
    where: doctorWhere,
    include: [
      { model: User, as: "user", where: userWhere },
      { model: Department, as: "department" },
    ],
    order: [[{ model: User, as: "user" }, "name", "ASC"]],
  });
  res.json({ success: true, data: { doctors } });
});

const createDoctor = asyncHandler(async (req, res) => {
  const result = await sequelize.transaction(async (transaction) => {
    let user;
    if (req.body.userId) {
      user = await User.findByPk(req.body.userId, { transaction });
      if (!user) throw new ApiError(404, "Doctor user not found.");
      await user.update({ role: "doctor" }, { transaction });
    } else {
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        passwordHash: req.body.password,
        role: "doctor",
      }, { transaction });
    }

    const doctor = await Doctor.create({
      userId: user.id,
      departmentId: req.body.departmentId,
      specialization: req.body.specialization,
      licenseNumber: req.body.licenseNumber,
      phone: req.body.phone,
      experienceYears: req.body.experienceYears || 0,
      consultationFee: req.body.consultationFee || 0,
      availability: req.body.availability,
      status: req.body.status || "active",
    }, { transaction });

    return { doctor, user };
  });

  await logActivity({ userId: req.user.id, action: "CREATE", entity: "Doctor", entityId: result.doctor.id });
  const doctor = await Doctor.findByPk(result.doctor.id, {
    include: [{ model: User, as: "user" }, { model: Department, as: "department" }],
  });
  res.status(201).json({ success: true, message: "Doctor profile created.", data: { doctor } });
});

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByPk(req.params.id);
  if (!doctor) throw new ApiError(404, "Doctor not found.");
  await doctor.update(req.body);
  await logActivity({ userId: req.user.id, action: "UPDATE", entity: "Doctor", entityId: doctor.id });

  const updated = await Doctor.findByPk(doctor.id, {
    include: [{ model: User, as: "user" }, { model: Department, as: "department" }],
  });
  res.json({ success: true, message: "Doctor updated.", data: { doctor: updated } });
});

module.exports = { listDepartments, createDepartment, listDoctors, createDoctor, updateDoctor };
