import { Router } from 'express';
import { createControllers } from '../controllers/apiControllers.js';

export function createApiRouter(models) {
  const router = Router();
  const ctrl = createControllers(models);

  router.get('/departments', ctrl.listDepartments);
  router.get('/departments/:id', ctrl.getDepartment);
  router.post('/departments', ctrl.createDepartment);
  router.put('/departments/:id', ctrl.updateDepartment);
  router.delete('/departments/:id', ctrl.deleteDepartment);

  router.get('/users', ctrl.listUsers);
  router.post('/users', ctrl.createUser);
  router.put('/users/:id', ctrl.updateUser);
  router.delete('/users/:id', ctrl.deleteUser);

  router.get('/projects', ctrl.listProjects);
  router.post('/projects', ctrl.createProject);
  router.post('/projects/:id/members', ctrl.assignProjectMember);
  router.put('/projects/:id', ctrl.updateProject);
  router.delete('/projects/:id', ctrl.deleteProject);

  router.get('/tasks', ctrl.listTasks);
  router.post('/tasks', ctrl.createTask);
  router.put('/tasks/:id', ctrl.updateTask);
  router.delete('/tasks/:id', ctrl.deleteTask);

  return router;
}
