import { Router } from 'express';
import authRoutes from './auth.routes';
import vehicleRoutes from './vehicle.routes';
import leadRoutes from './lead.routes';
import conversationRoutes from './conversation.routes';
import financingRoutes from './financing.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/leads', leadRoutes);
router.use('/conversations', conversationRoutes);
router.use('/financing', financingRoutes);
router.use('/webhook', webhookRoutes);

export default router;
