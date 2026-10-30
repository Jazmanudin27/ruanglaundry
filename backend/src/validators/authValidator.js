import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string({ required_error: 'Username wajib diisi' }).min(3, 'Username minimal 3 karakter'),
  password: z.string({ required_error: 'Password wajib diisi' }).min(4, 'Password minimal 4 karakter'),
});
