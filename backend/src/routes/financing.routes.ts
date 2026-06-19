import { Router } from 'express';
import { financingController } from '../controllers/financing.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.post('/simulate', authMiddleware, financingController.simulate);
router.post('/quick', financingController.quickSimulate);

export default router;
