import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// POST /api/auth/login dengan rate limiting
router.post('/login', loginLimiter, authController.login);

// GET /api/auth/me dilindungi middleware token
router.get('/me', authenticateToken, authController.getMe);

export default router;
