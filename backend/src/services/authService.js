import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { ENV } from '../config/env.js';

export const loginAdmin = async (username, password) => {
  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) {
    throw new Error('Username atau password salah');
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Username atau password salah');
  }

  const token = jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );

  return {
    token,
    admin: {
      id: admin.id,
      nama: admin.nama,
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt,
    },
  };
};

export const getAdminProfile = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      nama: true,
      username: true,
      role: true,
      perusahaanId: true,
      createdAt: true,
    },
  });

  if (!admin) {
    throw new Error('Data admin tidak ditemukan');
  }

  return admin;
};

export const updateProfile = async (userId, data) => {
  const user = await prisma.admin.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  const updateData = {};

  if (data.nama && data.nama.trim() !== '') {
    updateData.nama = data.nama.trim();
  }

  if (data.username && data.username.trim() !== '' && data.username.trim() !== user.username) {
    const existing = await prisma.admin.findUnique({
      where: { username: data.username.trim() },
    });
    if (existing && existing.id !== user.id) {
      throw new Error('Username sudah digunakan oleh akun lain');
    }
    updateData.username = data.username.trim();
  }

  if (data.passwordBaru) {
    if (!data.passwordLama) {
      throw new Error('Password lama wajib diisi untuk verifikasi penggantian password');
    }
    const isOldValid = await bcrypt.compare(data.passwordLama, user.passwordHash);
    if (!isOldValid) {
      throw new Error('Password lama tidak cocok');
    }
    updateData.passwordHash = await bcrypt.hash(data.passwordBaru, 10);
  }

  const updatedUser = await prisma.admin.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      nama: true,
      username: true,
      role: true,
      perusahaanId: true,
      createdAt: true,
    },
  });

  const token = jwt.sign(
    {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );

  return {
    admin: updatedUser,
    token,
  };
};

export const getAllUsers = async (currentUser) => {
  const where = currentUser.role === 'SUPER_OWNER'
    ? {}
    : { perusahaanId: currentUser.perusahaanId };

  return prisma.admin.findMany({
    where,
    select: {
      id: true,
      nama: true,
      username: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const createUser = async (currentUser, data) => {
  const existing = await prisma.admin.findUnique({
    where: { username: data.username.trim() },
  });
  if (existing) {
    throw new Error('Username sudah digunakan');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const perusahaanId = currentUser.role === 'SUPER_OWNER' ? null : currentUser.perusahaanId;

  return prisma.admin.create({
    data: {
      nama: data.nama.trim(),
      username: data.username.trim(),
      passwordHash,
      role: data.role || 'KASIR',
      perusahaanId,
    },
    select: {
      id: true,
      nama: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
};

export const deleteUser = async (currentUser, targetId) => {
  if (currentUser.id === targetId) {
    throw new Error('Tidak dapat menghapus akun Anda sendiri');
  }

  const target = await prisma.admin.findUnique({
    where: { id: targetId },
  });

  if (!target) {
    throw new Error('User tidak ditemukan');
  }

  if (currentUser.role !== 'SUPER_OWNER' && target.perusahaanId !== currentUser.perusahaanId) {
    throw new Error('Tidak memiliki akses untuk menghapus user ini');
  }

  return prisma.admin.delete({
    where: { id: targetId },
  });
};
