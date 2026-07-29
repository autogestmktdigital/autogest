import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';
import { financingController } from '../controllers/financing.controller';

const router = Router();

router.post('/search-vehicles', webhookController.searchVehicles);
router.post('/recommend-vehicles', webhookController.recommendVehicles);
router.post('/vehicle-assistant', webhookController.vehicleAssistant);
router.post('/register-lead', webhookController.registerLead);
router.post('/handoff', webhookController.handoff);
router.post('/simulate-financing', financingController.quickSimulate);

export default router;
