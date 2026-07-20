import { Router } from 'express';
import { followUpController } from '../controllers/followup.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.get('/', authMiddleware, followUpController.list);
router.post('/', authMiddleware, followUpController.create);
router.patch('/:id', authMiddleware, followUpController.update);
router.patch('/:id/cancel', authMiddleware, followUpController.cancel);

export default router;
