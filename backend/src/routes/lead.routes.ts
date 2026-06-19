import { Router } from 'express';
import { leadController } from '../controllers/lead.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.get('/', authMiddleware, leadController.list);
router.get('/stats', authMiddleware, leadController.getStats);
router.get('/:id', authMiddleware, leadController.getById);
router.put('/:id', authMiddleware, leadController.update);
router.patch('/:id/status', authMiddleware, leadController.updateStatus);
router.patch('/:id/assign', authMiddleware, leadController.assignToSeller);

export default router;
