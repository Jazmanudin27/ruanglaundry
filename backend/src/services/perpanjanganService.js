import prisma from '../config/db.js';

export const getAllPerpanjangan = async ({
  page = 1,
  limit = 100,
  search = '',
  memberId = '',
  paketId = '',
  startDate = '',
  endDate = '',
  perusahaanId = null,
}) => {
  const skip = (page - 1) * limit;

  let where = {};

  // Isolasi tenant jika bukan super owner
  if (perusahaanId) {
    where.perusahaanId = perusahaanId;
  }

  // Filter specific Member ID
  if (memberId && memberId !== 'semua') {
    where.memberId = memberId;
  }

  // Filter specific Paket ID
  if (paketId && paketId !== 'semua') {
    where.paketId = paketId;
  }

  // Filter Date Range
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.createdAt.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  // Search keyword (nama member, no HP, uid kartu, nama paket)
  if (search) {
    const clean = search.trim();
    where.OR = [
      { member: { nama: { contains: clean } } },
      { member: { noHp: { contains: clean } } },
      { member: { uidKartu: { contains: clean.toUpperCase() } } },
      { paket: { namaPaket: { contains: clean } } },
    ];
  }

  const [total, items, statsAgg] = await Promise.all([
    prisma.perpanjangan.count({ where }),
    prisma.perpanjangan.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        member: { select: { nama: true, noHp: true, uidKartu: true } },
        paket: { select: { namaPaket: true, kuotaKg: true, durasiHari: true, harga: true } },
        admin: { select: { nama: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.perpanjangan.findMany({
      where,
      select: { hargaDibayar: true, memberId: true, paket: { select: { kuotaKg: true } } },
    }),
  ]);

  const totalPendapatan = statsAgg.reduce((acc, curr) => acc + (curr.hargaDibayar || 0), 0);
  const totalKuotaTerjual = statsAgg.reduce((acc, curr) => acc + parseFloat(curr.paket?.kuotaKg || 0), 0);
  const memberUnik = new Set(statsAgg.map((s) => s.memberId)).size;

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
    ringkasan: {
      totalPerpanjangan: total,
      totalPendapatan,
      totalKuotaTerjual: +totalKuotaTerjual.toFixed(2),
      memberUnik,
    },
  };
};
