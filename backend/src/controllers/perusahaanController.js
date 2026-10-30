import * as perusahaanService from '../services/perusahaanService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const listPerusahaan = async (req, res, next) => {
  try {
    const list = await perusahaanService.getAllPerusahaan();
    return successResponse(res, 200, 'Daftar perusahaan langganan berhasil diambil', list);
  } catch (error) {
    return next(error);
  }
};

export const getPerusahaan = async (req, res, next) => {
  try {
    const p = await perusahaanService.getPerusahaanById(req.params.id);
    return successResponse(res, 200, 'Detail perusahaan berhasil diambil', p);
  } catch (error) {
    return errorResponse(res, 404, error.message || 'Perusahaan tidak ditemukan');
  }
};

export const getMyPerusahaan = async (req, res, next) => {
  try {
    if (!req.user.perusahaanId) {
      return successResponse(res, 200, 'Super Owner / Platform Admin', {
        namaPerusahaan: 'Ruang Laundry Platform (Super Owner)',
        statusLangganan: 'AKTIF',
        isSuperOwner: true,
      });
    }
    const p = await perusahaanService.getPerusahaanById(req.user.perusahaanId);
    return successResponse(res, 200, 'Status langganan perusahaan outlet berhasil diambil', p);
  } catch (error) {
    return next(error);
  }
};

export const createPerusahaan = async (req, res, next) => {
  try {
    const { namaPerusahaan, kodePerusahaan, namaOwner, noHpOwner, alamat, tarifBulanan } = req.body;
    if (!namaPerusahaan || !kodePerusahaan || !namaOwner || !noHpOwner) {
      return errorResponse(res, 400, 'Nama perusahaan, kode unik, nama owner, dan no HP wajib diisi');
    }
    const p = await perusahaanService.createPerusahaan({
      namaPerusahaan,
      kodePerusahaan,
      namaOwner,
      noHpOwner,
      alamat,
      tarifBulanan: tarifBulanan ? parseInt(tarifBulanan) : 200000,
    });
    return successResponse(res, 201, 'Perusahaan langganan baru berhasil didaftarkan', p);
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, 409, 'Kode perusahaan sudah digunakan. Gunakan kode lain.');
    }
    return next(error);
  }
};

export const perpanjangLangganan = async (req, res, next) => {
  try {
    const tambahanHari = req.body.tambahanHari ? parseInt(req.body.tambahanHari) : 30;
    const p = await perusahaanService.perpanjangLanggananPerusahaan(req.params.id, tambahanHari);
    return successResponse(res, 200, `Langganan perusahaan berhasil diperpanjang +${tambahanHari} hari (Pembayaran Rp 200.000 tercatat)`, p);
  } catch (error) {
    return next(error);
  }
};
