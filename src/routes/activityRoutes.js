import { Router } from 'express';
import { createActivityController } from '../controllers/activityController.js';

export function createActivityRouter(models) {
  const router = Router();
  const ctrl = createActivityController(models);

  router.get('/', ctrl.listActivity);
  router.post('/login-event', ctrl.logLoginEvent);
  router.post('/task-update', ctrl.logTaskUpdate);

  return router;
}
