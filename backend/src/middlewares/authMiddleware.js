import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { errorResponse } from '../utils/response.js';
import prisma from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 401, 'Akses ditolak: Token autentikasi tidak ditemukan');
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        perusahaanId: true,
        perusahaan: true,
      },
    });

    if (!admin) {
      return errorResponse(res, 401, 'Sesi tidak valid: Akun admin tidak ditemukan');
    }

    req.user = admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token kedaluwarsa, silakan login ulang');
    }
    return errorResponse(res, 403, 'Token tidak valid atau rusak');
  }
};

/**
 * Guard SaaS: Cek apakah langganan perusahaan masih aktif
 * Menolak transaksi/perubahan data jika perusahaan telat bayar 200rb/bulan
 */
export const checkSubscriptionGuard = (req, res, next) => {
  if (!req.user || req.user.role === 'SUPER_OWNER') {
    return next(); // Super owner bypass
  }

  const p = req.user.perusahaan;
  if (!p) {
    return next();
  }

  const now = new Date();
  const isExpired = new Date(p.tglBerakhirLangganan) < now || p.statusLangganan === 'EXPIRED';

  if (isExpired && req.method !== 'GET') {
    return errorResponse(
      res,
      403,
      `Masa aktif langganan aplikasi perusahaan "${p.namaPerusahaan}" telah kedaluwarsa (Tarif Rp ${p.tarifBulanan.toLocaleString('id-ID')}/bulan). Silakan lakukan pembayaran perpanjangan ke penyedia sistem.`
    );
  }

  next();
};
