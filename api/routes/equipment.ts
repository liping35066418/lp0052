import { Router } from 'express';
import {
  getCategories,
  getEquipmentList,
  getEquipmentDetail,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  adjustStock,
} from '../controllers/equipment.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getEquipmentList);
router.get('/:id', getEquipmentDetail);
router.post('/', authMiddleware, requireRole('admin'), createEquipment);
router.put('/:id', authMiddleware, requireRole('admin'), updateEquipment);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteEquipment);
router.post('/:id/stock', authMiddleware, requireRole('admin'), adjustStock);

export default router;
