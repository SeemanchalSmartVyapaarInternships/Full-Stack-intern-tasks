import { Router } from 'express';
import { changeUserRole, getAllUsers, getMe, login, register } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.get('/users', authenticateToken, authorizeRoles('Admin'), getAllUsers);
router.patch('/users/:id/role', authenticateToken, authorizeRoles('Admin'), changeUserRole);

export default router;
