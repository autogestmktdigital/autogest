import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller';
import { vehicleSaleController } from '../controllers/vehicle-sale.controller';
import { authMiddleware, adminOnly } from '../middleware';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/public/:id', vehicleController.publicGetById);
router.get('/public', vehicleController.publicList);
router.get('/', authMiddleware, vehicleController.list);
router.get('/:id', authMiddleware, vehicleController.getById);
router.post('/', authMiddleware, upload.any(), vehicleController.create);
router.put('/:id', authMiddleware, upload.any(), vehicleController.update);
router.delete('/:id', authMiddleware, adminOnly, vehicleController.delete);
router.patch('/:id/status', authMiddleware, vehicleController.updateStatus);
router.post('/:id/expenses', authMiddleware, vehicleController.addExpense);
router.delete('/:id/expenses/:expenseId', authMiddleware, vehicleController.removeExpense);

// Rotas de venda do veículo
router.get('/:vehicleId/sale', authMiddleware, vehicleSaleController.getByVehicleId);
router.post('/:vehicleId/sale', authMiddleware, vehicleSaleController.create);
router.put('/sale/:id', authMiddleware, vehicleSaleController.update);
router.delete('/sale/:id', authMiddleware, vehicleSaleController.delete);

export default router;
