import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware, adminOnly } from '../middleware';

const router = Router();

router.post('/login', authController.login);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/users', authMiddleware, adminOnly, authController.createUser);
router.get('/users', authMiddleware, authController.listUsers);

export default router;
