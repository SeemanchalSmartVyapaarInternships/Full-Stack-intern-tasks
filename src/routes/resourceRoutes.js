import { Router } from 'express';
import {
  getAdminControlPlane,
  getEmployeeWorkspace,
  getManagerOperations,
} from '../controllers/resourceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/employee', authorizeRoles('Admin', 'Manager', 'Employee'), getEmployeeWorkspace);
router.get('/manager', authorizeRoles('Admin', 'Manager'), getManagerOperations);
router.get('/admin', authorizeRoles('Admin'), getAdminControlPlane);

export default router;
