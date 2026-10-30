import prisma from '../config/db.js';

export const createTransaksi = async ({ memberId, beratKg, catatan, rakPenyimpanan, adminId }) => {
  const berat = Number(beratKg);
  if (isNaN(berat) || berat <= 0) {
    throw new Error('Berat cucian harus lebih dari 0 kg');
  }

  // 1. Periksa member ada dan status AKTIF
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { paket: true },
  });

  if (!member) {
    throw new Error('Member tidak ditemukan');
  }

  if (member.status !== 'AKTIF') {
    throw new Error('Status member tidak aktif');
  }

  // 2. Periksa masa aktif belum lewat (tglBerakhir >= hari ini)
  const now = new Date();
  if (new Date(member.tglBerakhir) < now) {
    throw new Error('Masa aktif sudah habis, silakan perpanjang');
  }

  // 3. Periksa beratKg <= sisaKuota
  const sisaSebelum = parseFloat(member.sisaKuota);
  if (berat > sisaSebelum) {
    throw new Error(`Sisa kuota ${sisaSebelum} kg`);
  }

  const sisaSesudah = +(sisaSebelum - berat).toFixed(2);
  const beratVal = +(berat.toFixed(2));
  const sisaSebelumVal = +(sisaSebelum.toFixed(2));
  const sisaSesudahVal = +(sisaSesudah.toFixed(2));

  // 4. Jalankan dalam SATU prisma.$transaction dengan atomic conditional update
  return await prisma.$transaction(async (tx) => {
    const updatedMember = await tx.member.updateMany({
      where: {
        id: memberId,
        status: 'AKTIF',
        sisaKuota: { gte: beratVal },
      },
      data: {
        sisaKuota: { decrement: beratVal },
      },
    });

    if (updatedMember.count === 0) {
      throw new Error('Transaksi ditolak: Kuota tidak mencukupi atau terjadi proses transaksi bersamaan');
    }

    const transaksiRecord = await tx.transaksi.create({
      data: {
        memberId,
        beratKg: beratVal,
        sisaSebelum: sisaSebelumVal,
        sisaSesudah: sisaSesudahVal,
        statusCucian: 'ANTRIAN',
        rakPenyimpanan: rakPenyimpanan || null,
        catatan: catatan || null,
        adminId,
        perusahaanId: member.perusahaanId || null,
      },
      include: {
        admin: { select: { nama: true } },
        member: { select: { nama: true, noHp: true, uidKartu: true } },
        perusahaan: { select: { namaPerusahaan: true } },
      },
    });

    return {
      transaksi: transaksiRecord,
      sisaKuotaBaru: sisaSesudahVal,
    };
  });
};

export const updateStatusCucian = async (id, { statusCucian, rakPenyimpanan, catatan }) => {
  const existing = await prisma.transaksi.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Transaksi cucian tidak ditemukan');
  }

  const validStatus = ['ANTRIAN', 'PROSES', 'SIAP_AMBIL', 'SELESAI'];
  if (!validStatus.includes(statusCucian)) {
    throw new Error('Status cucian tidak valid');
  }

  const updateData = {
    statusCucian,
  };

  if (rakPenyimpanan !== undefined) {
    updateData.rakPenyimpanan = rakPenyimpanan;
  }

  if (catatan !== undefined) {
    updateData.catatan = catatan;
  }

  if (statusCucian === 'SIAP_AMBIL' && !existing.tglSelesaiCuci) {
    updateData.tglSelesaiCuci = new Date();
  }

  if (statusCucian === 'SELESAI' && !existing.tglDiambil) {
    updateData.tglDiambil = new Date();
    if (!existing.tglSelesaiCuci) {
      updateData.tglSelesaiCuci = new Date();
    }
  }

  return await prisma.transaksi.update({
    where: { id },
    data: updateData,
    include: {
      member: { select: { nama: true, noHp: true, uidKartu: true } },
      admin: { select: { nama: true } },
      perusahaan: { select: { namaPerusahaan: true } },
    },
  });
};

export const getTransaksiByMember = async (memberId) => {
  return await prisma.transaksi.findMany({
    where: { memberId },
    include: {
      admin: { select: { nama: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAllTransaksi = async ({
  page = 1,
  limit = 100,
  search = '',
  memberId = '',
  adminId = '',
  statusCucian = '',
  startDate = '',
  endDate = '',
  minBerat = '',
  maxBerat = '',
}) => {
  const skip = (page - 1) * limit;

  let where = {};

  // Filter status cucian
  if (statusCucian && statusCucian !== 'semua') {
    where.statusCucian = statusCucian;
  }

  // Filter specific Member ID
  if (memberId && memberId !== 'semua') {
    where.memberId = memberId;
  }

  // Filter specific Admin ID
  if (adminId && adminId !== 'semua') {
    where.adminId = adminId;
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

  // Filter Berat Range
  if (minBerat || maxBerat) {
    where.beratKg = {};
    if (minBerat) where.beratKg.gte = parseFloat(minBerat);
    if (maxBerat) where.beratKg.lte = parseFloat(maxBerat);
  }

  // Search keyword (nama, noHp, uid, catatan, rak)
  if (search) {
    const clean = search.trim();
    where.OR = [
      { catatan: { contains: clean } },
      { rakPenyimpanan: { contains: clean } },
      { member: { nama: { contains: clean } } },
      { member: { noHp: { contains: clean } } },
      { member: { uidKartu: { contains: clean.toUpperCase() } } },
    ];
  }

  const [total, items, statsAgg, statusCounts] = await Promise.all([
    prisma.transaksi.count({ where }),
    prisma.transaksi.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        member: { select: { nama: true, noHp: true, uidKartu: true } },
        admin: { select: { nama: true } },
        perusahaan: { select: { namaPerusahaan: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaksi.findMany({
      where,
      select: { beratKg: true, memberId: true },
    }),
    prisma.transaksi.groupBy({
      by: ['statusCucian'],
      _count: { id: true },
    }),
  ]);

  const totalKg = statsAgg.reduce((acc, curr) => acc + parseFloat(curr.beratKg || 0), 0);
  const uniqueMemberCount = new Set(statsAgg.map((s) => s.memberId)).size;
  const avgKg = statsAgg.length > 0 ? (totalKg / statsAgg.length).toFixed(2) : 0;

  const countByStatus = {
    ANTRIAN: 0,
    PROSES: 0,
    SIAP_AMBIL: 0,
    SELESAI: 0,
  };
  statusCounts.forEach((s) => {
    if (countByStatus[s.statusCucian] !== undefined) {
      countByStatus[s.statusCucian] = s._count.id;
    }
  });

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
    ringkasan: {
      totalTransaksi: total,
      totalKg: +totalKg.toFixed(2),
      rataRataKg: parseFloat(avgKg),
      memberUnik: uniqueMemberCount,
      countByStatus,
    },
  };
};
