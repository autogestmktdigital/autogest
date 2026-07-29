import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';
import { financingController } from '../controllers/financing.controller';
import { cleanupData } from '../controllers/admin.controller';

const router = Router();

router.post('/search-vehicles', webhookController.searchVehicles);
router.post('/recommend-vehicles', webhookController.recommendVehicles);
router.post('/vehicle-assistant', webhookController.vehicleAssistant);
router.post('/register-lead', webhookController.registerLead);
router.post('/handoff', webhookController.handoff);
router.post('/simulate-financing', financingController.quickSimulate);

// WhatsApp Business API webhook
router.get('/whatsapp', webhookController.whatsappWebhook);
router.post('/whatsapp', webhookController.whatsappWebhook);

// Create lead from Typebot
router.post('/create-lead', webhookController.createLead);

// Cleanup endpoint (temporário)
router.post('/cleanup', cleanupData);

export default router;
