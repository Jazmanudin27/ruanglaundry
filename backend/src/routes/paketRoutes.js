import { Router } from 'express';
import * as paketController from '../controllers/paketController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Semua rute paket dilindungi token admin
router.use(authenticateToken);

router.get('/', paketController.listPaket);
router.get('/:id', paketController.getPaket);
router.post('/', paketController.createPaket);
router.put('/:id', paketController.updatePaket);
router.delete('/:id', paketController.deletePaket);

export default router;
