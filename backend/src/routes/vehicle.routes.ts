import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller';
import { authMiddleware, adminOnly } from '../middleware';
import { upload, uploadDocuments } from '../middleware/upload';

const router = Router();

router.get('/public/:id', vehicleController.publicGetById);
router.get('/public', vehicleController.publicList);
router.get('/', authMiddleware, vehicleController.list);
router.get('/:id', authMiddleware, vehicleController.getById);
router.post('/', authMiddleware, upload.array('images', 10), uploadDocuments.single('reportFile'), uploadDocuments.single('documentFile'), vehicleController.create);
router.put('/:id', authMiddleware, upload.array('images', 10), uploadDocuments.single('reportFile'), uploadDocuments.single('documentFile'), vehicleController.update);
router.delete('/:id', authMiddleware, adminOnly, vehicleController.delete);
router.patch('/:id/status', authMiddleware, vehicleController.updateStatus);
router.post('/:id/expenses', authMiddleware, vehicleController.addExpense);
router.delete('/:id/expenses/:expenseId', authMiddleware, vehicleController.removeExpense);

export default router;
