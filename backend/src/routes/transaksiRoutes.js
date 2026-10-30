import { Router } from 'express';
import * as transaksiController from '../controllers/transaksiController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// PROTECTED ROUTES (Admin/Kasir)
router.use(authenticateToken);

// POST /api/transaksi
router.post('/', transaksiController.createTransaksi);

// GET /api/transaksi (semua transaksi)
router.get('/', transaksiController.getAllTransaksi);

// PATCH /api/transaksi/:id/status (update status cucian & nomor rak)
router.patch('/:id/status', transaksiController.updateStatusCucian);

export default router;
