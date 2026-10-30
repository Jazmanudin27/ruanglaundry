import prisma from '../config/db.js';

export const getAllPerusahaan = async () => {
  const list = await prisma.perusahaan.findMany({
    include: {
      _count: {
        select: {
          members: true,
          transaksi: true,
          admins: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  return list.map((p) => {
    const expiry = new Date(p.tglBerakhirLangganan);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = diffDays <= 0 || p.statusLangganan === 'EXPIRED';

    return {
      ...p,
      daysLeft: diffDays,
      isExpired,
      statusDisplay: isExpired ? 'EXPIRED' : p.statusLangganan,
    };
  });
};

export const getPerusahaanById = async (id) => {
  const p = await prisma.perusahaan.findUnique({
    where: { id },
    include: {
      admins: { select: { id: true, nama: true, username: true, role: true } },
      pakets: true,
      _count: {
        select: {
          members: true,
          transaksi: true,
        },
      },
    },
  });

  if (!p) throw new Error('Perusahaan tidak ditemukan');

  const now = new Date();
  const expiry = new Date(p.tglBerakhirLangganan);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = diffDays <= 0 || p.statusLangganan === 'EXPIRED';

  return {
    ...p,
    daysLeft: diffDays,
    isExpired,
    statusDisplay: isExpired ? 'EXPIRED' : p.statusLangganan,
  };
};

export const createPerusahaan = async (data) => {
  const now = new Date();
  const tglBerakhir = new Date(now);
  tglBerakhir.setDate(tglBerakhir.getDate() + 30); // 30 hari lisensi pertama

  return await prisma.perusahaan.create({
    data: {
      namaPerusahaan: data.namaPerusahaan,
      kodePerusahaan: data.kodePerusahaan.trim().toUpperCase(),
      namaOwner: data.namaOwner,
      noHpOwner: data.noHpOwner,
      alamat: data.alamat || null,
      tglMulaiLangganan: now,
      tglBerakhirLangganan: tglBerakhir,
      statusLangganan: 'AKTIF',
      tarifBulanan: data.tarifBulanan || 200000,
    },
  });
};

export const perpanjangLanggananPerusahaan = async (id, tambahanHari = 30) => {
  const p = await prisma.perusahaan.findUnique({ where: { id } });
  if (!p) throw new Error('Perusahaan tidak ditemukan');

  const now = new Date();
  const currentExpiry = new Date(p.tglBerakhirLangganan);
  // Jika sudah expired, hitung dari hari ini. Jika belum expired, tambahkan ke tglBerakhir lama
  const baseDate = currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseDate);
  newExpiry.setDate(newExpiry.getDate() + tambahanHari);

  return await prisma.perusahaan.update({
    where: { id },
    data: {
      tglBerakhirLangganan: newExpiry,
      statusLangganan: 'AKTIF',
    },
  });
};
