import prisma from '../config/db.js';
import { ENV } from '../config/env.js';
import { normalizeUid } from '../utils/response.js';

// Helper hitung sisa hari
const calculateDaysLeft = (tglBerakhir) => {
  const now = new Date();
  const diffTime = new Date(tglBerakhir).getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format detail member untuk frontend
export const formatMemberDetail = (m) => {
  const kuotaAwal = parseFloat(m.kuotaAwal);
  const sisaKuota = parseFloat(m.sisaKuota);
  const totalPemakaian = Math.max(0, +(kuotaAwal - sisaKuota).toFixed(2));
  const daysLeft = calculateDaysLeft(m.tglBerakhir);
  const isExpired = daysLeft < 0;
  const isLowQuota = kuotaAwal > 0 && sisaKuota <= +(kuotaAwal * 0.1).toFixed(2);
  const isExpiringSoon = !isExpired && (daysLeft <= 7 || isLowQuota);

  return {
    ...m,
    kuotaAwal,
    sisaKuota,
    totalPemakaian,
    daysLeft,
    isExpired,
    isExpiringSoon,
    statusDisplay: isExpired ? 'KEDALUWARSA' : isExpiringSoon ? 'HAMPIR_HABIS' : m.status,
  };
};

export const getMembers = async ({ search = '', filter = 'semua', page = 1, limit = 50 }) => {
  const now = new Date();
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

  if (filter === 'aktif') {
    where.status = 'AKTIF';
    where.tglBerakhir = { gte: now };
  } else if (filter === 'kedaluwarsa') {
    where.tglBerakhir = { lt: now };
  } else if (filter === 'hampir-habis') {
    // Kurang dari sama dengan 7 hari kedepan ATAU sisa kuota <= 10%
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    where.status = 'AKTIF';
    where.tglBerakhir = { gte: now };
    // Catatan: filter sisa kuota <= 10% juga disaring di memori jika query SQL kompleks
  }

  const rawMembers = await prisma.member.findMany({
    where,
    include: {
      paket: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  let formatted = rawMembers.map(formatMemberDetail);

  if (filter === 'hampir-habis') {
    formatted = formatted.filter((m) => m.isExpiringSoon);
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
      throw new Error(`Kartu NFC dengan UID ${cleanUid} sudah digunakan oleh member: ${existing.nama}`);
    }
  }

  // Ambil data paket untuk inisialisasi kuota dan masa aktif
  const paket = await prisma.paket.findUnique({
    where: { id: data.paketId },
  });
  if (!paket || !paket.aktif) {
    throw new Error('Paket tidak ditemukan atau sudah tidak aktif');
  }

  const now = new Date();
  const tglBerakhir = new Date(now);
  tglBerakhir.setDate(tglBerakhir.getDate() + paket.durasiHari);

  return await prisma.member.create({
    data: {
      nama: data.nama,
      noHp: data.noHp,
      uidKartu: cleanUid,
      paketId: data.paketId,
      kuotaAwal: paket.kuotaKg,
      sisaKuota: paket.kuotaKg,
      tglMulai: now,
      tglBerakhir,
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

  const now = new Date();
  const currentExpiry = new Date(member.tglBerakhir);
  // Tanggal mulai perpanjangan: jika belum expired pakai currentExpiry, jika sudah expired pakai now
  const baseDate = currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseDate);
  newExpiry.setDate(newExpiry.getDate() + paketBaru.durasiHari);

  // Kebijakan kuota lama: HANGUS atau DIGABUNG (dari .env)
  const sisaLama = parseFloat(member.sisaKuota);
  const kuotaPaketBaru = parseFloat(paketBaru.kuotaKg);

  let newSisaKuota = kuotaPaketBaru;
  if (ENV.KEBIJAKAN_SISA_KUOTA === 'DIGABUNG' && sisaLama > 0) {
    newSisaKuota = +(kuotaPaketBaru + sisaLama).toFixed(2);
  }

  const biaya = hargaDibayar !== undefined ? hargaDibayar : paketBaru.harga;

  // Jalankan dalam transaksi Prisma
  return await prisma.$transaction(async (tx) => {
    // 1. Catat riwayat perpanjangan
    const perpanjanganRecord = await tx.perpanjangan.create({
      data: {
        memberId: member.id,
        paketId: paketBaru.id,
        tglMulai: baseDate,
        tglBerakhir: newExpiry,
        hargaDibayar: biaya,
        adminId,
      },
    });

    // 2. Update member
    const updatedMember = await tx.member.update({
      where: { id: member.id },
      data: {
        paketId: paketBaru.id,
        kuotaAwal: newSisaKuota,
        sisaKuota: newSisaKuota,
        tglBerakhir: newExpiry,
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
