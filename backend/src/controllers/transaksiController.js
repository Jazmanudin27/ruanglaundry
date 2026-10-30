import * as transaksiService from '../services/transaksiService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createTransaksiSchema, updateStatusCucianSchema } from '../validators/transaksiValidator.js';

export const createTransaksi = async (req, res, next) => {
  try {
    const validated = createTransaksiSchema.parse(req.body);
    const result = await transaksiService.createTransaksi({
      memberId: validated.memberId,
      beratKg: validated.beratKg,
      catatan: validated.catatan,
      rakPenyimpanan: validated.rakPenyimpanan,
      adminId: req.user.id,
    });
    return successResponse(res, 201, 'Transaksi laundry berhasil dicatat', result);
  } catch (error) {
    if (
      error.message.includes('Masa aktif sudah habis') ||
      error.message.includes('Sisa kuota') ||
      error.message.includes('Status member') ||
      error.message.includes('Berat cucian') ||
      error.message.includes('Transaksi ditolak')
    ) {
      return errorResponse(res, 400, error.message);
    }
    return next(error);
  }
};

export const updateStatusCucian = async (req, res, next) => {
  try {
    const validated = updateStatusCucianSchema.parse(req.body);
    const result = await transaksiService.updateStatusCucian(req.params.id, validated);
    return successResponse(res, 200, 'Status cucian berhasil diperbarui', result);
  } catch (error) {
    if (error.message.includes('tidak ditemukan') || error.message.includes('tidak valid')) {
      return errorResponse(res, 400, error.message);
    }
    return next(error);
  }
};

export const getMemberTransaksi = async (req, res, next) => {
  try {
    const data = await transaksiService.getTransaksiByMember(req.params.id);
    return successResponse(res, 200, 'Riwayat transaksi member berhasil diambil', data);
  } catch (error) {
    return next(error);
  }
};

export const getAllTransaksi = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      search,
      memberId,
      adminId,
      statusCucian,
      startDate,
      endDate,
      minBerat,
      maxBerat,
    } = req.query;
    const data = await transaksiService.getAllTransaksi({
      page,
      limit,
      search,
      memberId,
      adminId,
      statusCucian,
      startDate,
      endDate,
      minBerat,
      maxBerat,
    });
    return successResponse(res, 200, 'Daftar semua transaksi berhasil diambil', data);
  } catch (error) {
    return next(error);
  }
};
