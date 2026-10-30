import * as authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { loginSchema } from '../validators/authValidator.js';

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginAdmin(validatedData.username, validatedData.password);
    return successResponse(res, 200, 'Login berhasil', result);
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(error);
    }
    return errorResponse(res, 401, error.message || 'Login gagal');
  }
};

export const getMe = async (req, res, next) => {
  try {
    const admin = await authService.getAdminProfile(req.user.id);
    return successResponse(res, 200, 'Data profil admin berhasil diambil', admin);
  } catch (error) {
    return next(error);
  }
};
