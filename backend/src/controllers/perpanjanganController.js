import * as perpanjanganService from '../services/perpanjanganService.js';
import { successResponse } from '../utils/response.js';

export const getAllPerpanjangan = async (req, res, next) => {
  try {
    const { page, limit, search, memberId, paketId, startDate, endDate } = req.query;
    // Jika bukan SUPER_OWNER, batasi ke perusahaan admin yang login
    const perusahaanId = req.user.role === 'SUPER_OWNER' ? null : req.user.perusahaanId;

    const data = await perpanjanganService.getAllPerpanjangan({
      page,
      limit,
      search,
      memberId,
      paketId,
      startDate,
      endDate,
      perusahaanId,
    });
    return successResponse(res, 200, 'Riwayat perpanjangan paket berhasil diambil', data);
  } catch (error) {
    return next(error);
  }
};
