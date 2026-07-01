const { ActivityLog } = require("../models");

/**
 * Helper to log general user activities / audit logs.
 *
 * @param {string|null} userId - The ID of the user performing the action
 * @param {string} action - Action name (e.g. 'CREATE_PROJECT')
 * @param {string} entityType - Entity type ('project', 'task', 'user', 'document', 'auth')
 * @param {string|number|null} entityId - Target entity ID
 * @param {object|string|null} details - Structured JSON details about the change/action
 * @param {object|null} req - Express request object to capture client IP address
 */
async function logActivity(userId, action, entityType, entityId, details, req = null) {
  try {
    let ipAddress = null;
    if (req) {
      ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    }

    await ActivityLog.create({
      userId,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      details: details ? (typeof details === "object" ? JSON.stringify(details) : details) : null,
      ipAddress,
    });
  } catch (err) {
    console.error("Failed to create activity log:", err.message);
  }
}

module.exports = {
  logActivity,
};
