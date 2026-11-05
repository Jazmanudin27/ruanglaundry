import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// POST /api/auth/login dengan rate limiting
router.post('/login', loginLimiter, authController.login);

// GET /api/auth/me dilindungi middleware token
router.get('/me', authenticateToken, authController.getMe);

// PUT /api/auth/profile - ganti nama, username, password sendiri
router.put('/profile', authenticateToken, authController.updateProfile);

// Manajemen user oleh Admin/Owner
router.get('/users', authenticateToken, authController.getAllUsers);
router.post('/users', authenticateToken, authController.createUser);
router.delete('/users/:id', authenticateToken, authController.deleteUser);

export default router;
