const { ActivityLog, LoginHistory, UploadHistory, TaskUpdate, User, Task, Project } = require("../models");
const { buildPaginatedQuery, paginatedResponse } = require("../utils/queryHelper");

/**
 * Get general user action logs.
 */
const getActivityLogs = async (req, res) => {
  try {
    const { where, order, limit, offset, page, pageSize } = buildPaginatedQuery(
      req,
      ["action", "details"],
      ["userId", "entityType"],
      "-createdAt"
    );

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
    });

    return res.status(200).json(paginatedResponse(rows, count, page, pageSize));
  } catch (err) {
    console.error("Failed to fetch activity logs:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * Get login histories (success and failures).
 */
const getLoginHistory = async (req, res) => {
  try {
    const { where, order, limit, offset, page, pageSize } = buildPaginatedQuery(
      req,
      ["email", "failureReason", "ipAddress", "userAgent"],
      ["userId", "status"],
      "-createdAt"
    );

    const { count, rows } = await LoginHistory.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
    });

    return res.status(200).json(paginatedResponse(rows, count, page, pageSize));
  } catch (err) {
    console.error("Failed to fetch login history:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * Get upload history details.
 */
const getUploadHistory = async (req, res) => {
  try {
    const { where, order, limit, offset, page, pageSize } = buildPaginatedQuery(
      req,
      ["fileName"],
      ["userId", "projectId", "uploadType"],
      "-createdAt"
    );

    const { count, rows } = await UploadHistory.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: User, as: "uploader", attributes: ["id", "name", "email"] },
        { model: Project, as: "project", attributes: ["id", "name"] },
      ],
    });

    return res.status(200).json(paginatedResponse(rows, count, page, pageSize));
  } catch (err) {
    console.error("Failed to fetch upload history:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * Get historical updates on tasks.
 */
const getTaskUpdates = async (req, res) => {
  try {
    const { where, order, limit, offset, page, pageSize } = buildPaginatedQuery(
      req,
      ["comment"],
      ["taskId", "userId"],
      "-createdAt"
    );

    const { count, rows } = await TaskUpdate.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Task, as: "task", attributes: ["id", "title"] },
      ],
    });

    return res.status(200).json(paginatedResponse(rows, count, page, pageSize));
  } catch (err) {
    console.error("Failed to fetch task updates:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getActivityLogs,
  getLoginHistory,
  getUploadHistory,
  getTaskUpdates,
};
