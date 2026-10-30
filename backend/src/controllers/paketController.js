import * as paketService from '../services/paketService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createPaketSchema, updatePaketSchema } from '../validators/paketValidator.js';

export const listPaket = async (req, res, next) => {
  try {
    const includeNonAktif = req.query.all === 'true';
    const pakets = await paketService.getAllPaket(includeNonAktif);
    return successResponse(res, 200, 'Daftar paket berhasil diambil', pakets);
  } catch (error) {
    return next(error);
  }
};

export const getPaket = async (req, res, next) => {
  try {
    const paket = await paketService.getPaketById(req.params.id);
    return successResponse(res, 200, 'Detail paket berhasil diambil', paket);
  } catch (error) {
    return errorResponse(res, 404, error.message || 'Paket tidak ditemukan');
  }
};

export const createPaket = async (req, res, next) => {
  try {
    const validated = createPaketSchema.parse(req.body);
    const newPaket = await paketService.createPaket(validated);
    return successResponse(res, 201, 'Paket baru berhasil ditambahkan', newPaket);
  } catch (error) {
    return next(error);
  }
};

export const updatePaket = async (req, res, next) => {
  try {
    const validated = updatePaketSchema.parse(req.body);
    const updated = await paketService.updatePaket(req.params.id, validated);
    return successResponse(res, 200, 'Paket berhasil diperbarui', updated);
  } catch (error) {
    return next(error);
  }
};

export const deletePaket = async (req, res, next) => {
  try {
    const result = await paketService.deletePaket(req.params.id);
    return successResponse(res, 200, 'Paket berhasil dihapus / dinonaktifkan', result);
  } catch (error) {
    return next(error);
  }
};
