import prisma from '../config/db.js';
import { ENV } from '../config/env.js';
import { normalizeUid } from '../utils/response.js';

// Helper hitung sisa hari
const calculateDaysLeft = (tglBerakhir) => {
  if (!tglBerakhir) return null;
  const now = new Date();
  const diffTime = new Date(tglBerakhir).getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format detail member untuk frontend sesuai alur Basmalah Wash
export const formatMemberDetail = (m) => {
  const kuotaAwal = parseFloat(m.kuotaAwal || 0);
  const sisaKuota = parseFloat(m.sisaKuota || 0);
  const totalPemakaian = Math.max(0, +(kuotaAwal - sisaKuota).toFixed(2));

  let daysLeft = null;
  let isExpired = false;
  let statusBadge = 'HIJAU'; // 'HIJAU' | 'KUNING' | 'MERAH' | 'BELUM_MULAI'
  let masaAktifLabel = 'Belum Mulai (30 hari sejak cuci pertama)';

  if (!m.tglMulai || !m.tglBerakhir) {
    statusBadge = 'BELUM_MULAI';
    masaAktifLabel = 'Belum Aktif (Tercatat 30 hari saat penyerahan pakaian pertama)';
  } else {
    daysLeft = calculateDaysLeft(m.tglBerakhir);
    isExpired = daysLeft < 0;

    if (isExpired) {
      statusBadge = 'MERAH'; // Merah: Masa aktif sudah berakhir
      masaAktifLabel = 'Masa aktif sudah berakhir';
    } else if (daysLeft <= 1) {
      statusBadge = 'MERAH'; // Merah: Tersisa 1 hari atau berakhir hari ini
      masaAktifLabel = daysLeft === 0 ? 'Berakhir Hari Ini' : `Kritis (Tersisa ${daysLeft} hari)`;
    } else if (daysLeft >= 2 && daysLeft <= 5) {
      statusBadge = 'KUNING'; // Kuning: Masa aktif tersisa 3–5 hari
      masaAktifLabel = `Perhatian (Tersisa ${daysLeft} hari)`;
    } else {
      statusBadge = 'HIJAU'; // Hijau: Paket masih aktif
      masaAktifLabel = `Aktif (${daysLeft} hari tersisa)`;
    }
  }

  // Jika kuota habis, tandai
  const isZeroQuota = sisaKuota <= 0;

  return {
    ...m,
    kuotaAwal,
    sisaKuota,
    totalPemakaian,
    daysLeft,
    isExpired,
    isZeroQuota,
    statusBadge,
    masaAktifLabel,
    statusDisplay: isExpired
      ? 'KEDALUWARSA'
      : statusBadge === 'MERAH'
      ? 'HABIS_HARI_INI'
      : statusBadge === 'KUNING'
      ? 'HAMPIR_HABIS'
      : statusBadge === 'BELUM_MULAI'
      ? 'MENUNGGU_CUCI_PERTAMA'
      : m.status,
  };
};

export const getMembers = async ({ search = '', filter = 'semua', page = 1, limit = 100 }) => {
  const skip = (page - 1) * limit;
  let where = {};

  if (search) {
    const cleanSearch = search.trim();
    where.OR = [
      { nama: { contains: cleanSearch } },
      { noHp: { contains: cleanSearch } },
      { uidKartu: { contains: cleanSearch.toUpperCase() } },
    ];
  }

  const rawMembers = await prisma.member.findMany({
    where,
    include: {
      paket: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  let formatted = rawMembers.map(formatMemberDetail);

  // Filter memori berbasis status indikator Basmalah Wash
  if (filter === 'aktif') {
    formatted = formatted.filter((m) => m.statusBadge === 'HIJAU' || m.statusBadge === 'BELUM_MULAI');
  } else if (filter === 'kuning') {
    formatted = formatted.filter((m) => m.statusBadge === 'KUNING');
  } else if (filter === 'merah') {
    formatted = formatted.filter((m) => m.statusBadge === 'MERAH');
  } else if (filter === 'belum-mulai') {
    formatted = formatted.filter((m) => m.statusBadge === 'BELUM_MULAI');
  } else if (filter === 'kedaluwarsa') {
    formatted = formatted.filter((m) => m.isExpired);
  } else if (filter === 'hampir-habis') {
    formatted = formatted.filter((m) => m.statusBadge === 'KUNING' || m.statusBadge === 'MERAH');
  }

  const total = formatted.length;
  const paginated = formatted.slice(skip, skip + limit);

  return {
    members: paginated,
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

export const getMemberById = async (id) => {
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      paket: true,
      transaksi: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { admin: { select: { nama: true } } },
      },
    },
  });

  if (!member) {
    throw new Error('Member tidak ditemukan');
  }

  return formatMemberDetail(member);
};

export const getMemberByUid = async (uid) => {
  const cleanUid = normalizeUid(uid);
  if (!cleanUid) {
    throw new Error('UID kartu tidak valid');
  }

  const member = await prisma.member.findUnique({
    where: { uidKartu: cleanUid },
    include: {
      paket: true,
      transaksi: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { admin: { select: { nama: true } } },
      },
    },
  });

  if (!member) {
    throw new Error(`Member dengan UID kartu [${cleanUid}] tidak ditemukan`);
  }

  return formatMemberDetail(member);
};

export const createMember = async (data) => {
  const cleanUid = normalizeUid(data.uidKartu);

  // Jika UID ada, cek duplikasi
  if (cleanUid) {
    const existing = await prisma.member.findUnique({
      where: { uidKartu: cleanUid },
    });
    if (existing) {
      throw new Error(`Kartu RFID dengan UID ${cleanUid} sudah digunakan oleh member: ${existing.nama}`);
    }
  }

  // Ambil data paket untuk inisialisasi kuota
  const paket = await prisma.paket.findUnique({
    where: { id: data.paketId },
  });
  if (!paket || !paket.aktif) {
    throw new Error('Paket tidak ditemukan atau sudah tidak aktif');
  }

  // Masa aktif 30 hari tercatat otomatis sejak penyerahan pakaian pertama, bukan pendaftaran
  return await prisma.member.create({
    data: {
      nama: data.nama,
      noHp: data.noHp,
      uidKartu: cleanUid,
      paketId: data.paketId,
      kuotaAwal: paket.kuotaKg,
      sisaKuota: paket.kuotaKg,
      tglMulai: null,
      tglBerakhir: null,
      status: 'AKTIF',
    },
    include: {
      paket: true,
    },
  });
};

export const updateMember = async (id, data) => {
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) throw new Error('Member tidak ditemukan');

  let cleanUid = undefined;
  if (data.uidKartu !== undefined) {
    cleanUid = normalizeUid(data.uidKartu);
    if (cleanUid && cleanUid !== member.uidKartu) {
      const existing = await prisma.member.findUnique({
        where: { uidKartu: cleanUid },
      });
      if (existing) {
        throw new Error(`Kartu NFC dengan UID ${cleanUid} sudah dipakai oleh member: ${existing.nama}`);
      }
    }
  }

  return await prisma.member.update({
    where: { id },
    data: {
      nama: data.nama !== undefined ? data.nama : undefined,
      noHp: data.noHp !== undefined ? data.noHp : undefined,
      uidKartu: cleanUid !== undefined ? cleanUid : undefined,
      status: data.status !== undefined ? data.status : undefined,
    },
    include: { paket: true },
  });
};

export const deleteMember = async (id) => {
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) throw new Error('Member tidak ditemukan');

  return await prisma.member.delete({
    where: { id },
  });
};

export const gantiKartu = async (memberId, uidBaru) => {
  const cleanUid = normalizeUid(uidBaru);
  if (!cleanUid) {
    throw new Error('UID kartu baru tidak boleh kosong');
  }

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new Error('Member tidak ditemukan');

  // Cek apakah UID kartu baru sudah dipakai orang lain
  const existing = await prisma.member.findUnique({
    where: { uidKartu: cleanUid },
  });
  if (existing && existing.id !== memberId) {
    throw new Error(`Kartu NFC dengan UID ${cleanUid} sudah digunakan oleh member: ${existing.nama}`);
  }

  return await prisma.member.update({
    where: { id: memberId },
    data: { uidKartu: cleanUid },
    include: { paket: true },
  });
};

export const perpanjangMember = async (memberId, paketId, hargaDibayar, adminId) => {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { paket: true },
  });
  if (!member) throw new Error('Member tidak ditemukan');

  const paketBaru = await prisma.paket.findUnique({
    where: { id: paketId },
  });
  if (!paketBaru || !paketBaru.aktif) {
    throw new Error('Paket perpanjangan tidak ditemukan atau tidak aktif');
  }

  // Sisa kuota lama hangus dan tidak diakumulasikan. Kuota kembali sesuai kapasitas paket baru.
  const newSisaKuota = parseFloat(paketBaru.kuotaKg);
  const biaya = hargaDibayar !== undefined ? hargaDibayar : paketBaru.harga;

  // Jalankan dalam transaksi Prisma: Masa aktif diperbarui menjadi 30 hari sejak cuci pertama pada periode baru
  return await prisma.$transaction(async (tx) => {
    // 1. Catat riwayat perpanjangan
    const perpanjanganRecord = await tx.perpanjangan.create({
      data: {
        memberId: member.id,
        paketId: paketBaru.id,
        tglMulai: null,
        tglBerakhir: null,
        hargaDibayar: biaya,
        adminId,
      },
    });

    // 2. Update member: kuota di-reset ke paket baru, tglMulai & tglBerakhir null menunggu cuci pertama
    const updatedMember = await tx.member.update({
      where: { id: member.id },
      data: {
        paketId: paketBaru.id,
        kuotaAwal: newSisaKuota,
        sisaKuota: newSisaKuota,
        tglMulai: null,
        tglBerakhir: null,
        status: 'AKTIF',
      },
      include: { paket: true },
    });

    return {
      member: formatMemberDetail(updatedMember),
      perpanjangan: perpanjanganRecord,
    };
  });
};

export const getMembersHampirHabis = async () => {
  const res = await getMembers({ filter: 'hampir-habis', limit: 10 });
  return res.members;
};
