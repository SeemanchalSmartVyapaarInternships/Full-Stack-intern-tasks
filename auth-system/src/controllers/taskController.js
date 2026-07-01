const { Task, Project, User, TaskUpdate } = require("../models");
const { logActivity } = require("../utils/activityLogger");
const { buildPaginatedQuery, paginatedResponse } = require("../utils/queryHelper");

const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, projectId, assigneeId, comment } = req.body;

  if (!title || title.trim().length < 2) {
    return res.status(400).json({ success: false, message: "Task title is required (min 2 characters)." });
  }
  if (!projectId) {
    return res.status(400).json({ success: false, message: "projectId is required." });
  }

  try {
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    if (assigneeId) {
      const assignee = await User.findByPk(assigneeId);
      if (!assignee) return res.status(404).json({ success: false, message: "Assignee user not found." });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || null,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
      projectId,
      assigneeId: assigneeId || null,
      comment: comment?.trim() || null,
    });

    await logActivity(req.user.id, "CREATE_TASK", "task", task.id, { title: task.title, projectId: task.projectId }, req);

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const { where, order, limit, offset, page, pageSize } = buildPaginatedQuery(
      req,
      ["title", "description"],
      ["status", "priority", "projectId", "assigneeId"],
      "-createdAt"
    );

    const { count, rows } = await Task.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
      ],
      distinct: true,
    });

    return res.status(200).json(paginatedResponse(rows, count, page, pageSize));
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Project, as: "project", attributes: ["id", "name", "status"] },
        { model: User, as: "assignee", attributes: ["id", "name", "email", "role"] },
      ],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const updateTask = async (req, res) => {
  const { title, description, status, priority, dueDate, projectId, assigneeId, comment } = req.body;

  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    if (req.user.role === "employee" && task.assigneeId !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only update tasks assigned to you." });
    }

    const previousStatus = task.status;
    const previousAssigneeId = task.assigneeId;

    if (projectId !== undefined) {
      if (projectId) {
        const project = await Project.findByPk(projectId);
        if (!project) return res.status(404).json({ success: false, message: "Project not found." });
      }
      task.projectId = projectId;
    }

    if (assigneeId !== undefined) {
      if (assigneeId) {
        const assignee = await User.findByPk(assigneeId);
        if (!assignee) return res.status(404).json({ success: false, message: "Assignee user not found." });
      }
      task.assigneeId = assigneeId || null;
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description?.trim() || null;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (comment !== undefined) task.comment = comment?.trim() || null;

    const statusChanged = status !== undefined && status !== previousStatus;
    const assigneeChanged = assigneeId !== undefined && assigneeId !== previousAssigneeId;

    if (statusChanged || assigneeChanged || comment) {
      await TaskUpdate.create({
        taskId: task.id,
        userId: req.user.id,
        previousStatus: statusChanged ? previousStatus : null,
        newStatus: statusChanged ? task.status : null,
        previousAssigneeId: assigneeChanged ? previousAssigneeId : null,
        newAssigneeId: assigneeChanged ? task.assigneeId : null,
        comment: comment?.trim() || null,
      });
    }

    await task.save();

    await logActivity(req.user.id, "UPDATE_TASK", "task", task.id, {
      title: task.title,
      statusChanged,
      assigneeChanged,
      newStatus: task.status,
      comment: comment || undefined,
    }, req);

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: task,
    });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    const title = task.title;
    const projectId = task.projectId;
    await task.destroy();

    await logActivity(req.user.id, "DELETE_TASK", "task", req.params.id, { title, projectId }, req);

    return res.status(200).json({ success: true, message: "Task deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
