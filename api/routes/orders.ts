import { Router } from 'express';
import {
  getOrderList,
  getOrderDetail,
  createOrder,
  returnOrder,
  exportOrders,
} from '../controllers/orders.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, getOrderList);
router.get('/export', authMiddleware, requireRole('admin'), exportOrders);
router.get('/:id', authMiddleware, getOrderDetail);
router.post('/', authMiddleware, createOrder);
router.post('/:id/return', authMiddleware, returnOrder);

export default router;
