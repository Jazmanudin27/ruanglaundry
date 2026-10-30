import prisma from '../config/db.js';

export const getAllPaket = async (includeNonAktif = false) => {
  return await prisma.paket.findMany({
    where: includeNonAktif ? {} : { aktif: true },
    orderBy: { harga: 'asc' },
  });
};

export const getPaketById = async (id) => {
  const paket = await prisma.paket.findUnique({
    where: { id },
  });
  if (!paket) {
    throw new Error('Paket tidak ditemukan');
  }
  return paket;
};

export const createPaket = async (data) => {
  return await prisma.paket.create({
    data: {
      namaPaket: data.namaPaket,
      kuotaKg: data.kuotaKg,
      durasiHari: data.durasiHari,
      harga: data.harga,
      aktif: data.aktif !== undefined ? data.aktif : true,
    },
  });
};

export const updatePaket = async (id, data) => {
  await getPaketById(id);
  return await prisma.paket.update({
    where: { id },
    data,
  });
};

export const deletePaket = async (id) => {
  await getPaketById(id);
  // Cek apakah paket sudah dipakai member
  const memberCount = await prisma.member.count({
    where: { paketId: id },
  });
  if (memberCount > 0) {
    // Soft delete: nonaktifkan paket agar riwayat member tidak rusak
    return await prisma.paket.update({
      where: { id },
      data: { aktif: false },
    });
  }
  return await prisma.paket.delete({
    where: { id },
  });
};
