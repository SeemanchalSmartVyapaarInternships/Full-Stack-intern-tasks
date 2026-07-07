// ============================================================
// Project Controller — CRUD & Members Management
// ============================================================

const { Project, Department, User, Task } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');
const { parseQueryParams } = require('../utils/queryHelper');

/**
 * Create a new Project.
 * POST /api/projects
 */
async function createProject(req, res) {
  try {
    const { name, description, status, department_id } = req.body;

    if (department_id) {
      const dept = await Department.findByPk(department_id);
      if (!dept) {
        return errorResponse(res, 400, 'Invalid department_id. Department does not exist.');
      }
    }

    const project = await Project.create({
      name,
      description,
      status,
      department_id,
    });

    return successResponse(res, 201, 'Project created successfully.', { project });
  } catch (err) {
    console.error('Create Project Error:', err);
    if (err.name === 'SequelizeValidationError') {
      return errorResponse(res, 400, err.errors[0].message);
    }
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * List all Projects with pagination, search, filter, and sorting.
 * GET /api/projects
 */
async function listProjects(req, res) {
  try {
    const { sequelizeOptions, pagination } = parseQueryParams(req.query, {
      searchFields: ['name', 'description'],
      filterFields: ['status', 'department_id'],
      defaultSortBy: 'id',
      defaultSortOrder: 'ASC',
    });

    // Include basic department info in list
    sequelizeOptions.include = [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
      },
    ];

    const { count, rows: projects } = await Project.findAndCountAll(sequelizeOptions);

    return successResponse(res, 200, 'Projects retrieved successfully.', {
      projects,
      pagination: {
        total: count,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(count / pagination.limit),
      },
    });
  } catch (err) {
    console.error('List Projects Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Get a specific Project by ID.
 * GET /api/projects/:id
 */
async function getProject(req, res) {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'description'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'role'],
          through: { attributes: [] }, // Exclude join table details from response
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'status', 'priority', 'due_date'],
        },
      ],
    });

    if (!project) {
      return errorResponse(res, 404, 'Project not found.');
    }

    return successResponse(res, 200, 'Project details retrieved successfully.', { project });
  } catch (err) {
    console.error('Get Project Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Update an existing Project.
 * PUT /api/projects/:id
 */
async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { name, description, status, department_id } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return errorResponse(res, 404, 'Project not found.');
    }

    if (department_id !== undefined) {
      if (department_id !== null) {
        const dept = await Department.findByPk(department_id);
        if (!dept) {
          return errorResponse(res, 400, 'Invalid department_id. Department does not exist.');
        }
      }
      project.department_id = department_id;
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();

    return successResponse(res, 200, 'Project updated successfully.', { project });
  } catch (err) {
    console.error('Update Project Error:', err);
    if (err.name === 'SequelizeValidationError') {
      return errorResponse(res, 400, err.errors[0].message);
    }
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Delete a Project.
 * DELETE /api/projects/:id
 */
async function deleteProject(req, res) {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return errorResponse(res, 404, 'Project not found.');
    }

    await project.destroy();

    return successResponse(res, 200, 'Project deleted successfully.');
  } catch (err) {
    console.error('Delete Project Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Add a member to a Project.
 * POST /api/projects/:id/members
 */
async function addProjectMember(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return errorResponse(res, 400, 'userId is required.');
    }

    const project = await Project.findByPk(id);
    if (!project) {
      return errorResponse(res, 404, 'Project not found.');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    const hasMember = await project.hasMember(user);
    if (hasMember) {
      return errorResponse(res, 400, 'User is already a member of this project.');
    }

    await project.addMember(user);

    return successResponse(res, 200, 'Member added to project successfully.');
  } catch (err) {
    console.error('Add Project Member Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Remove a member from a Project.
 * DELETE /api/projects/:id/members/:userId
 */
async function removeProjectMember(req, res) {
  try {
    const { id, userId } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return errorResponse(res, 404, 'Project not found.');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    const hasMember = await project.hasMember(user);
    if (!hasMember) {
      return errorResponse(res, 400, 'User is not a member of this project.');
    }

    await project.removeMember(user);

    return successResponse(res, 200, 'Member removed from project successfully.');
  } catch (err) {
    console.error('Remove Project Member Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};
