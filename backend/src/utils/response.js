/**
 * Format standar response API:
 * { success: boolean, message: string, data: any }
 */
export const successResponse = (res, statusCode = 200, message = 'Berhasil', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode = 500, message = 'Terjadi kesalahan pada server', data = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};

/**
 * Normalisasi format UID: huruf besar, hapus spasi, titik dua, tanda hubung.
 */
export const normalizeUid = (uid) => {
  if (!uid) return null;
  return uid.toString().trim().toUpperCase().replace(/[^0-9A-F]/g, '');
};
