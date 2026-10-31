import { z } from 'zod';

export const createTransaksiSchema = z.object({
  memberId: z.string().uuid('ID Member tidak valid').optional().nullable(),
  jenisPelanggan: z.enum(['MEMBER', 'NON_MEMBER']).optional().default('MEMBER'),
  namaPelanggan: z.string().optional().nullable(),
  noHpPelanggan: z.string().optional().nullable(),
  tarifPerKg: z.coerce.number().optional().default(7000),
  totalBayar: z.coerce.number().optional().default(0),
  statusBayar: z.enum(['LUNAS', 'BELUM_LUNAS']).optional().default('LUNAS'),
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
