const { Department, User } = require("../models");
const { buildPaginatedQuery, paginatedResponse } = require("../utils/queryHelper");

// ─── CREATE ─────────────────────────────────────────────────────
const createDepartment = async (req, res) => {
  const { name, description, status } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: "Department name is required (min 2 characters)." });
  }

  try {
    const department = await Department.create({
      name: name.trim(),
      description: description?.trim() || null,
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      data: department,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "A department with this name already exists." });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET ALL (paginated, searchable, filterable, sortable) ──────
const getAllDepartments = async (req, res) => {
  try {
    const { where, order, limit, offset, page, pageSize } = buildPaginatedQuery(
      req,
      ["name", "description"],    // searchable
      ["status"],                  // filterable
      "name"                       // default sort
    );

    const { count, rows } = await Department.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    return res.status(200).json(paginatedResponse(rows, count, page, pageSize));
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET BY ID ──────────────────────────────────────────────────
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }

    return res.status(200).json({ success: true, data: department });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── UPDATE ─────────────────────────────────────────────────────
const updateDepartment = async (req, res) => {
  const { name, description, status } = req.body;

  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }

    if (name !== undefined) department.name = name.trim();
    if (description !== undefined) department.description = description?.trim() || null;
    if (status !== undefined) department.status = status;

    await department.save();

    return res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      data: department,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "A department with this name already exists." });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── DELETE ─────────────────────────────────────────────────────
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [{ model: User, as: "members", attributes: ["id"] }],
    });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }

    if (department.members && department.members.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete department. ${department.members.length} user(s) are still assigned to it.`,
      });
    }

    await department.destroy();

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment };
