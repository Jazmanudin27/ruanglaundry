import { z } from 'zod';

export const createPaketSchema = z.object({
  namaPaket: z.string({ required_error: 'Nama paket wajib diisi' }).min(2, 'Nama paket minimal 2 karakter'),
  kuotaKg: z.coerce.number({ required_error: 'Kuota (kg) wajib diisi' }).positive('Kuota harus lebih dari 0 kg'),
  durasiHari: z.coerce.number({ required_error: 'Durasi (hari) wajib diisi' }).int().positive('Durasi harus berupa angka bulat positif'),
  harga: z.coerce.number({ required_error: 'Harga wajib diisi' }).int().nonnegative('Harga tidak boleh negatif'),
  aktif: z.boolean().optional().default(true),
});

export const updatePaketSchema = createPaketSchema.partial();
