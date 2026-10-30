import { Router } from 'express';
import * as memberController from '../controllers/memberController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Semua rute member dilindungi autentikasi JWT
router.use(authenticateToken);

// Rute Spesifik (harus ditaruh sebelum /:id)
router.get('/hampir-habis', memberController.getHampirHabis);
router.get('/by-uid/:uid', memberController.getMemberByUid);

// CRUD Utama
router.get('/', memberController.listMembers);
router.post('/', memberController.createMember);
router.get('/:id', memberController.getMember);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

// Rute Aksi Khusus
router.put('/:id/ganti-kartu', memberController.gantiKartu);
router.post('/:id/perpanjang', memberController.perpanjangMember);
router.get('/:id/transaksi', async (req, res, next) => {
  try {
    const { getTransaksiByMember } = await import('../services/transaksiService.js');
    const { successResponse } = await import('../utils/response.js');
    const data = await getTransaksiByMember(req.params.id);
    return successResponse(res, 200, 'Riwayat transaksi member berhasil diambil', data);
  } catch (error) {
    next(error);
  }
});

export default router;
