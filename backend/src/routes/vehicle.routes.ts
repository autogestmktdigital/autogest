import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller';
import { authMiddleware, adminOnly, upload } from '../middleware';

const router = Router();

router.get('/', authMiddleware, vehicleController.list);
router.get('/:id', authMiddleware, vehicleController.getById);
router.post('/', authMiddleware, upload.array('images', 10), vehicleController.create);
router.put('/:id', authMiddleware, upload.array('images', 10), vehicleController.update);
router.delete('/:id', authMiddleware, adminOnly, vehicleController.delete);
router.patch('/:id/status', authMiddleware, vehicleController.updateStatus);

export default router;
