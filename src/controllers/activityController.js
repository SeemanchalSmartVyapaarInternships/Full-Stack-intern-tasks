export function createActivityController({ ActivityLog }) {
  const listActivity = async (req, res, next) => {
    try {
      const where = {};
      if (req.query.eventType) where.eventType = req.query.eventType;
      if (req.query.actor) where.actor = req.query.actor;
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));

      const logs = await ActivityLog.findAll({ where, order: [['id', 'DESC']], limit });
      res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  };

  const logLoginEvent = async (req, res, next) => {
    try {
      const { actor, status = 'SUCCESS' } = req.body || {};
      if (!actor) {
        return res.status(400).json({ success: false, message: 'actor is required.' });
      }
      const created = await ActivityLog.create({
        eventType: 'LOGIN',
        actor,
        action: `User login (${status})`,
        resource: 'auth-session',
        metadataJson: JSON.stringify({ status }),
        ipAddress: req.ip || '127.0.0.1',
      });
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return next(err);
    }
  };

  const logTaskUpdate = async (req, res, next) => {
    try {
      const { actor, taskId, fromStatus, toStatus } = req.body || {};
      if (!actor || !taskId || !toStatus) {
        return res.status(400).json({
          success: false,
          message: 'actor, taskId, and toStatus are required.',
        });
      }
      const created = await ActivityLog.create({
        eventType: 'TASK_UPDATE',
        actor,
        action: `Updated task status to ${toStatus}`,
        resource: `Task #${taskId}`,
        metadataJson: JSON.stringify({ fromStatus: fromStatus || null, toStatus }),
        ipAddress: req.ip || '127.0.0.1',
      });
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return next(err);
    }
  };

  return { listActivity, logLoginEvent, logTaskUpdate };
}
