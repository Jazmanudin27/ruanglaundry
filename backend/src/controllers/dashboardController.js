import prisma from '../config/db.js';
import { successResponse } from '../utils/response.js';
import { getMembersHampirHabis } from '../services/memberService.js';

export const getRingkasanDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Transaksi Hari Ini
    const transaksiHariIni = await prisma.transaksi.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: {
        beratKg: true,
      },
    });

    const jumlahTransaksiHariIni = transaksiHariIni.length;
    const totalKgHariIni = transaksiHariIni.reduce((acc, curr) => {
      return acc + parseFloat(curr.beratKg || 0);
    }, 0);

    // 2. Total Member Aktif (Masa aktif belum lewat atau baru daftar belum cuci 1)
    const now = new Date();
    const totalMemberAktif = await prisma.member.count({
      where: {
        status: 'AKTIF',
        OR: [
          { tglBerakhir: { gte: now } },
          { tglBerakhir: null },
        ],
      },
    });

    // 3. Total Semua Member
    const totalMember = await prisma.member.count();

    // 4. Member Hampir Habis (kuota <= 10% atau hari <= 7)
    const memberHampirHabis = await getMembersHampirHabis();

    return successResponse(res, 200, 'Ringkasan dashboard berhasil diambil', {
      hariIni: {
        jumlahTransaksi: jumlahTransaksiHariIni,
        totalKg: +totalKgHariIni.toFixed(2),
      },
      statistik: {
        totalMemberAktif,
        totalMember,
        totalHampirHabis: memberHampirHabis.length,
      },
      memberHampirHabis,
    });
  } catch (error) {
    return next(error);
  }
};
