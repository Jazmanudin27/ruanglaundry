import { Router } from 'express';
import * as perpanjanganController from '../controllers/perpanjanganController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// GET /api/perpanjangan
router.get('/', perpanjanganController.getAllPerpanjangan);

export default router;
