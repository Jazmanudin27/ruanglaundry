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
      createdAt: true,
    },
  });

  if (!admin) {
    throw new Error('Data admin tidak ditemukan');
  }

  return admin;
};
