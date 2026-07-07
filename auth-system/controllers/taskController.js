// ============================================================
// Task Controller — CRUD Operations
// ============================================================

const { Task, Project, User } = require('../models');
const { successResponse, errorResponse, sanitiseUser } = require('../utils/helpers');
const { parseQueryParams } = require('../utils/queryHelper');

/**
 * Create a new Task.
 * POST /api/tasks
 */
async function createTask(req, res) {
  try {
    const { title, description, status, priority, due_date, project_id, assignee_id } = req.body;

    if (!project_id) {
      return errorResponse(res, 400, 'project_id is required.');
    }

    const project = await Project.findByPk(project_id);
    if (!project) {
      return errorResponse(res, 400, 'Invalid project_id. Project does not exist.');
    }

    if (assignee_id) {
      const assignee = await User.findByPk(assignee_id);
      if (!assignee) {
        return errorResponse(res, 400, 'Invalid assignee_id. User does not exist.');
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      due_date,
      project_id,
      assignee_id,
    });

    return successResponse(res, 201, 'Task created successfully.', { task });
  } catch (err) {
    console.error('Create Task Error:', err);
    if (err.name === 'SequelizeValidationError') {
      return errorResponse(res, 400, err.errors[0].message);
    }
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * List all Tasks with pagination, search, filtering, and sorting.
 * GET /api/tasks
 */
async function listTasks(req, res) {
  try {
    const { sequelizeOptions, pagination } = parseQueryParams(req.query, {
      searchFields: ['title', 'description'],
      filterFields: ['status', 'priority', 'project_id', 'assignee_id'],
      defaultSortBy: 'id',
      defaultSortOrder: 'ASC',
    });

    // Include project and assignee info
    sequelizeOptions.include = [
      {
        model: Project,
        as: 'project',
        attributes: ['id', 'name'],
      },
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ];

    const { count, rows: tasks } = await Task.findAndCountAll(sequelizeOptions);

    return successResponse(res, 200, 'Tasks retrieved successfully.', {
      tasks,
      pagination: {
        total: count,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(count / pagination.limit),
      },
    });
  } catch (err) {
    console.error('List Tasks Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Get a specific Task by ID.
 * GET /api/tasks/:id
 */
async function getTask(req, res) {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status'],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
    });

    if (!task) {
      return errorResponse(res, 404, 'Task not found.');
    }

    return successResponse(res, 200, 'Task details retrieved successfully.', { task });
  } catch (err) {
    console.error('Get Task Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Update an existing Task.
 * PUT /api/tasks/:id
 */
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, project_id, assignee_id } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return errorResponse(res, 404, 'Task not found.');
    }

    // Role-based authorization: Employees can only update status on tasks assigned to them
    if (req.user.role === 'employee') {
      if (task.assignee_id !== req.user.id) {
        return errorResponse(res, 403, 'Access denied. You can only update tasks assigned to you.');
      }
      if (title !== undefined || description !== undefined || priority !== undefined || due_date !== undefined || project_id !== undefined || assignee_id !== undefined) {
        return errorResponse(res, 400, 'Access denied. Employees can only update the status of tasks assigned to them.');
      }
    }

    if (project_id !== undefined) {
      const project = await Project.findByPk(project_id);
      if (!project) {
        return errorResponse(res, 400, 'Invalid project_id. Project does not exist.');
      }
      task.project_id = project_id;
    }

    if (assignee_id !== undefined) {
      if (assignee_id !== null) {
        const assignee = await User.findByPk(assignee_id);
        if (!assignee) {
          return errorResponse(res, 400, 'Invalid assignee_id. User does not exist.');
        }
      }
      task.assignee_id = assignee_id;
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (due_date !== undefined) task.due_date = due_date;

    await task.save();

    return successResponse(res, 200, 'Task updated successfully.', { task });
  } catch (err) {
    console.error('Update Task Error:', err);
    if (err.name === 'SequelizeValidationError') {
      return errorResponse(res, 400, err.errors[0].message);
    }
    return errorResponse(res, 500, 'Internal server error.');
  }
}

/**
 * Delete a Task.
 * DELETE /api/tasks/:id
 */
async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return errorResponse(res, 404, 'Task not found.');
    }

    await task.destroy();

    return successResponse(res, 200, 'Task deleted successfully.');
  } catch (err) {
    console.error('Delete Task Error:', err);
    return errorResponse(res, 500, 'Internal server error.');
  }
}

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
};
