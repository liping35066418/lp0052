import { Router } from 'express';
import { getDashboardStats } from '../controllers/orders.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authMiddleware, requireRole('admin'), getDashboardStats);

export default router;
