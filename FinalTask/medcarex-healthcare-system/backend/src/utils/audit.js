const { ActivityLog } = require("../models");

async function logActivity({ userId, action, entity, entityId, metadata }) {
  try {
    await ActivityLog.create({ userId, action, entity, entityId, metadata });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
  }
}

module.exports = { logActivity };
