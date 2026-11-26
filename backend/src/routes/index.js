import { Router } from 'express';
import { authorizeRoles, createAuthMiddleware } from '../middleware/auth.js';
import { createMedcarexController } from '../controllers/medcarexController.js';

export function createMedcarexRouter(models) {
  const router = Router();
  const authenticate = createAuthMiddleware(models.User);
  const ctrl = createMedcarexController(models);

  // Public auth endpoints
  router.post('/auth/register', ctrl.register);
  router.post('/auth/login', ctrl.login);

  // Protected routes
  router.use(authenticate);
  router.get('/auth/me', ctrl.getMe);

  router.get('/dashboard/summary', ctrl.getDashboardSummary);
  router.get('/activity', ctrl.listActivity);

  router.get('/departments', ctrl.listDepartments);
  router.get('/doctors', ctrl.listDoctors);
  router.post('/doctors', authorizeRoles('Admin', 'Manager'), ctrl.createDoctor);

  router.get('/patients', ctrl.listPatients);
  router.post('/patients', authorizeRoles('Admin', 'Manager', 'Employee'), ctrl.createPatient);
  router.put('/patients/:id', authorizeRoles('Admin', 'Manager', 'Employee'), ctrl.updatePatient);
  router.delete('/patients/:id', authorizeRoles('Admin'), ctrl.deletePatient);

  router.get('/appointments', ctrl.listAppointments);
  router.post('/appointments', authorizeRoles('Admin', 'Manager', 'Employee'), ctrl.createAppointment);
  router.patch('/appointments/:id', authorizeRoles('Admin', 'Manager'), ctrl.updateAppointment);

  return router;
}
