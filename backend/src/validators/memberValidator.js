import { z } from 'zod';

export const createMemberSchema = z.object({
  nama: z.string({ required_error: 'Nama member wajib diisi' }).min(2, 'Nama minimal 2 karakter'),
  noHp: z.string({ required_error: 'Nomor HP wajib diisi' }).min(8, 'Nomor HP minimal 8 digit'),
  uidKartu: z.string().nullable().optional(),
  paketId: z.string({ required_error: 'Pilihan paket wajib dipilih' }).uuid('ID Paket tidak valid'),
});

export const updateMemberSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  noHp: z.string().min(8, 'Nomor HP minimal 8 digit').optional(),
  uidKartu: z.string().nullable().optional(),
  status: z.enum(['AKTIF', 'NONAKTIF']).optional(),
});

export const gantiKartuSchema = z.object({
  uidKartuBaru: z.string({ required_error: 'UID kartu baru wajib diisi' }).min(4, 'UID kartu minimal 4 karakter'),
});

export const perpanjangMemberSchema = z.object({
  paketId: z.string({ required_error: 'Pilihan paket perpanjangan wajib dipilih' }).uuid('ID Paket tidak valid'),
  hargaDibayar: z.coerce.number().int().nonnegative('Harga dibayar tidak boleh negatif').optional(),
});
