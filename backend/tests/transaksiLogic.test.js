import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { createTransaksiSchema } from '../src/validators/transaksiValidator.js';
import { normalizeUid } from '../src/utils/response.js';

describe('1. Validasi Normalisasi UID NFC', () => {
  test('Membersihkan spasi, titik dua, dan mengubah huruf ke kapital', () => {
    expect(normalizeUid('04:a1:b2:c3:d4:e5:f6')).toBe('04A1B2C3D4E5F6');
    expect(normalizeUid(' 04 a1 b2 ')).toBe('04A1B2');
    expect(normalizeUid('e2-80-68-94')).toBe('E2806894');
  });

  test('Mengembalikan null jika UID kosong atau null', () => {
    expect(normalizeUid('')).toBeNull();
    expect(normalizeUid(null)).toBeNull();
    expect(normalizeUid(undefined)).toBeNull();
  });
});

describe('2. Validasi Input Berat Cucian (Validator Zod)', () => {
  test('Menolak berat cucian 0 atau negatif', () => {
    const invalidZero = {
      memberId: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
      beratKg: 0,
    };
    expect(() => createTransaksiSchema.parse(invalidZero)).toThrow();

    const invalidNegative = {
      memberId: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
      beratKg: -2.5,
    };
    expect(() => createTransaksiSchema.parse(invalidNegative)).toThrow();
  });

  test('Menerima berat cucian desimal positif', () => {
    const valid = {
      memberId: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
      beratKg: 3.75,
      catatan: 'Cuci kilat',
    };
    const parsed = createTransaksiSchema.parse(valid);
    expect(parsed.beratKg).toBe(3.75);
    expect(parsed.catatan).toBe('Cuci kilat');
  });
});

describe('3. Unit Logika Bisnis Transaksi', () => {
  // Simulasi aturan bisnis transaksi
  const processTransaksiLogic = (member, beratKg) => {
    if (!member) {
      throw new Error('Member tidak ditemukan');
    }
    if (member.status !== 'AKTIF') {
      throw new Error('Status member tidak aktif');
    }
    const now = new Date();
    if (new Date(member.tglBerakhir) < now) {
      throw new Error('Masa aktif sudah habis, silakan perpanjang');
    }
    const sisa = parseFloat(member.sisaKuota);
    if (beratKg <= 0) {
      throw new Error('Berat cucian harus lebih dari 0 kg');
    }
    if (beratKg > sisa) {
      throw new Error(`Sisa kuota ${sisa} kg`);
    }
    const sisaSesudah = +(sisa - beratKg).toFixed(2);
    return {
      success: true,
      sisaSebelum: sisa,
      sisaSesudah,
      beratKg,
    };
  };

  test('Lolos jika kuota cukup dan masa aktif masih berlaku', () => {
    const activeMember = {
      id: 'm-1',
      status: 'AKTIF',
      sisaKuota: 20.0,
      tglBerakhir: new Date(Date.now() + 86400000 * 10), // 10 hari ke depan
    };

    const result = processTransaksiLogic(activeMember, 4.5);
    expect(result.success).toBe(true);
    expect(result.sisaSebelum).toBe(20.0);
    expect(result.sisaSesudah).toBe(15.5);
  });

  test('Menolak jika sisa kuota kurang dari berat cucian', () => {
    const memberLowQuota = {
      id: 'm-2',
      status: 'AKTIF',
      sisaKuota: 2.5,
      tglBerakhir: new Date(Date.now() + 86400000 * 10),
    };

    expect(() => processTransaksiLogic(memberLowQuota, 3.0)).toThrow('Sisa kuota 2.5 kg');
  });

  test('Menolak jika masa aktif sudah habis', () => {
    const expiredMember = {
      id: 'm-3',
      status: 'AKTIF',
      sisaKuota: 15.0,
      tglBerakhir: new Date(Date.now() - 86400000 * 2), // 2 hari lalu
    };

    expect(() => processTransaksiLogic(expiredMember, 2.0)).toThrow(
      'Masa aktif sudah habis, silakan perpanjang'
    );
  });

  test('Simulasi request bersamaan (Atomic Guard Race Condition)', async () => {
    // Model atomic conditional update database:
    // Update berhasil HANYA jika sisaKuota saat ini >= amount
    let sisaKuotaDatabase = 4.0;
    let lock = false;

    const atomicDeduct = async (amount) => {
      // Meniru baris row lock / atomic transaction
      while (lock) {
        await new Promise((r) => setTimeout(r, 5));
      }
      lock = true;
      try {
        if (sisaKuotaDatabase >= amount) {
          await new Promise((r) => setTimeout(r, 10));
          sisaKuotaDatabase = +(sisaKuotaDatabase - amount).toFixed(2);
          return { success: true, sisa: sisaKuotaDatabase };
        }
        throw new Error('Transaksi ditolak: Kuota tidak mencukupi');
      } finally {
        lock = false;
      }
    };

    // Eksekusi dua request bersamaan
    const p1 = atomicDeduct(3.0);
    const p2 = atomicDeduct(3.0);

    const results = await Promise.allSettled([p1, p2]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Hanya 1 transaksi yang boleh berhasil, 1 lagi harus ditolak agar kuota tidak minus!
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect(sisaKuotaDatabase).toBe(1.0); // Kuota tidak minus
  });
});
