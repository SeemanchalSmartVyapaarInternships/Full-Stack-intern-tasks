// ============================================================
// Department Controller — CRUD Operations
// ============================================================

const { Department, User, Project } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');
const { parseQueryParams } = require('../utils/queryHelper');

/**
 * Create a new Department.
 * POST /api/departments
 */
async function createDepartment(req, res) {
  try {
    const { name, description } = req.body;

    const existing = await Department.findOne({ where: { name } });
    if (existing) {
      return errorResponse(res, 400, 'A department with this name already exists.');
    }

    const department = await Department.create({ name, description });

    return successResponse(res, 201, 'Department created successfully.', { department });
  } catch (err) {
    console.error('Create Department Error:', err);
    if (err.name === 'SequelizeValidationError') {
      return errorResponse(res, 400, err.errors[0].message);
    }
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * List all Departments with pagination, search, and sorting.
 * GET /api/departments
 */
async function listDepartments(req, res) {
  try {
    const { sequelizeOptions, pagination } = parseQueryParams(req.query, {
      searchFields: ['name', 'description'],
      defaultSortBy: 'name',
      defaultSortOrder: 'ASC',
    });

    const { count, rows: departments } = await Department.findAndCountAll(sequelizeOptions);

    return successResponse(res, 200, 'Departments retrieved successfully.', {
      departments,
      pagination: {
        total: count,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(count / pagination.limit),
      },
    });
  } catch (err) {
    console.error('List Departments Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Get a specific Department by ID.
 * GET /api/departments/:id
 */
async function getDepartment(req, res) {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role'],
        },
        {
          model: Project,
          as: 'projects',
          attributes: ['id', 'name', 'status'],
        },
      ],
    });

    if (!department) {
      return errorResponse(res, 404, 'Department not found.');
    }

    return successResponse(res, 200, 'Department details retrieved successfully.', { department });
  } catch (err) {
    console.error('Get Department Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Update an existing Department.
 * PUT /api/departments/:id
 */
async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const department = await Department.findByPk(id);
    if (!department) {
      return errorResponse(res, 404, 'Department not found.');
    }

    if (name && name !== department.name) {
      const existing = await Department.findOne({ where: { name } });
      if (existing) {
        return errorResponse(res, 400, 'A department with this name already exists.');
      }
      department.name = name;
    }

    if (description !== undefined) {
      department.description = description;
    }

    await department.save();

    return successResponse(res, 200, 'Department updated successfully.', { department });
  } catch (err) {
    console.error('Update Department Error:', err);
    if (err.name === 'SequelizeValidationError') {
      return errorResponse(res, 400, err.errors[0].message);
    }
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Delete a Department.
 * DELETE /api/departments/:id
 */
async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      return errorResponse(res, 404, 'Department not found.');
    }

    await department.destroy();

    return successResponse(res, 200, 'Department deleted successfully.');
  } catch (err) {
    console.error('Delete Department Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

module.exports = {
  createDepartment,
  listDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
