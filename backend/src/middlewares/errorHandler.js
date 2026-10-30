import { errorResponse } from '../utils/response.js';
import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  // Zod validation error
  if (err instanceof ZodError) {
    const errorDetails = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 400, 'Validasi input gagal: ' + err.errors.map(e => e.message).join(', '), errorDetails);
  }

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const fields = err.meta?.target || 'data';
    return errorResponse(res, 409, `Data duplikat: ${fields} sudah digunakan.`);
  }

  // Prisma record not found error
  if (err.code === 'P2025') {
    return errorResponse(res, 404, 'Data yang dicari tidak ditemukan.');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal server';

  return errorResponse(res, statusCode, message);
};
