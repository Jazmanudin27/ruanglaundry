import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// GET /api/dashboard/ringkasan
router.get('/ringkasan', dashboardController.getRingkasanDashboard);

export default router;
