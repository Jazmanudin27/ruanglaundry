import { Router } from 'express';
import * as perusahaanController from '../controllers/perusahaanController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Status langganan perusahaan akun saat ini
router.get('/me', perusahaanController.getMyPerusahaan);

// Khusus Super Owner (Kelola semua perusahaan & lisensi 200rb)
router.get('/', perusahaanController.listPerusahaan);
router.post('/', perusahaanController.createPerusahaan);
router.get('/:id', perusahaanController.getPerusahaan);
router.put('/:id/perpanjang-langganan', perusahaanController.perpanjangLangganan);

export default router;
