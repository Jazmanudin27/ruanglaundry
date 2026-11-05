import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string({ required_error: 'Username wajib diisi' }).min(3, 'Username minimal 3 karakter'),
  password: z.string({ required_error: 'Password wajib diisi' }).min(4, 'Password minimal 4 karakter'),
});

export const updateProfileSchema = z.object({
  nama: z.string().min(1, 'Nama tidak boleh kosong').optional(),
  username: z.string().min(3, 'Username minimal 3 karakter').optional(),
  passwordLama: z.string().optional(),
  passwordBaru: z.string().min(4, 'Password baru minimal 4 karakter').optional(),
});

export const createUserSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(4, 'Password minimal 4 karakter'),
  role: z.enum(['ADMIN', 'KASIR']).default('KASIR'),
});
