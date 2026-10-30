import { z } from 'zod';

export const createTransaksiSchema = z.object({
  memberId: z.string({ required_error: 'ID Member wajib diisi' }).uuid('ID Member tidak valid'),
  beratKg: z.coerce.number({ required_error: 'Berat cucian wajib diisi' }).positive('Berat cucian harus lebih dari 0 kg'),
  catatan: z.string().optional().nullable(),
  rakPenyimpanan: z.string().optional().nullable(),
});

export const updateStatusCucianSchema = z.object({
  statusCucian: z.enum(['ANTRIAN', 'PROSES', 'SIAP_AMBIL', 'SELESAI'], {
    required_error: 'Status cucian wajib diisi',
    invalid_type_error: 'Status cucian harus ANTRIAN, PROSES, SIAP_AMBIL, atau SELESAI',
  }),
  rakPenyimpanan: z.string().optional().nullable(),
  catatan: z.string().optional().nullable(),
});
