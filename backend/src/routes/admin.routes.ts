import { Router } from 'express';
import { cleanupData } from '../controllers/admin.controller';

const router = Router();

router.post('/cleanup', cleanupData);

export default router;
