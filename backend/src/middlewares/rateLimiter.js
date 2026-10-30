import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/response.js';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Maksimal 10 percobaan per 15 menit per IP
  handler: (req, res) => {
    return errorResponse(res, 429, 'Terlalu banyak percobaan login yang gagal. Silakan coba lagi setelah 15 menit.');
  },
  standardHeaders: true,
  legacyHeaders: false,
});
