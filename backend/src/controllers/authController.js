import * as authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { loginSchema, updateProfileSchema, createUserSchema } from '../validators/authValidator.js';

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

export const updateProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const result = await authService.updateProfile(req.user.id, validatedData);
    return successResponse(res, 200, 'Profil akun berhasil diperbarui', result);
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(error);
    }
    return errorResponse(res, 400, error.message || 'Gagal memperbarui profil');
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers(req.user);
    return successResponse(res, 200, 'Daftar user berhasil diambil', users);
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const newUser = await authService.createUser(req.user, validatedData);
    return successResponse(res, 201, 'User baru berhasil dibuat', newUser);
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(error);
    }
    return errorResponse(res, 400, error.message || 'Gagal menambahkan user');
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await authService.deleteUser(req.user, req.params.id);
    return successResponse(res, 200, 'User berhasil dihapus');
  } catch (error) {
    return errorResponse(res, 400, error.message || 'Gagal menghapus user');
  }
};
