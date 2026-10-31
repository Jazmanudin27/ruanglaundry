import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Memulai Seeding Data Multi-Tenant SaaS ---');

  // Bersihkan data lama
  await prisma.transaksi.deleteMany();
  await prisma.perpanjangan.deleteMany();
  await prisma.member.deleteMany();
  await prisma.paket.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.perusahaan.deleteMany();

  const now = new Date();
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  // 1. Buat Perusahaan Laundry Basmalah Wash
  const p1 = await prisma.perusahaan.create({
    data: {
      namaPerusahaan: 'Basmalah Wash',
      kodePerusahaan: 'BW-01',
      namaOwner: 'Owner Basmalah Wash',
      noHpOwner: '081234567890',
      alamat: 'Jl. Utama Basmalah Wash No. 1',
      tglMulaiLangganan: now,
      tglBerakhirLangganan: addDays(now, 365), // Aktif 1 tahun
      statusLangganan: 'AKTIF',
      tarifBulanan: 200000,
    },
  });

  const p2 = await prisma.perusahaan.create({
    data: {
      namaPerusahaan: 'Berkah Laundry Syariah',
      kodePerusahaan: 'BERKAH-02',
      namaOwner: 'Ustadz Ahmad Fauzi',
      noHpOwner: '085711223344',
      alamat: 'Kawasan Pesantren Cibiru, Tasikmalaya',
      tglMulaiLangganan: addDays(now, -10),
      tglBerakhirLangganan: addDays(now, 20), // Aktif 20 hari ke depan
      statusLangganan: 'AKTIF',
      tarifBulanan: 200000,
    },
  });

  const p3 = await prisma.perusahaan.create({
    data: {
      namaPerusahaan: 'Melati Fresh Laundry',
      kodePerusahaan: 'MELATI-03',
      namaOwner: 'Ibu Ratna Sari',
      noHpOwner: '087899887766',
      alamat: 'Jl. Merdeka No. 12, Surabaya',
      tglMulaiLangganan: addDays(now, -40),
      tglBerakhirLangganan: addDays(now, -10), // Kedaluwarsa 10 hari lalu (perlu bayar 200rb)
      statusLangganan: 'EXPIRED',
      tarifBulanan: 200000,
    },
  });
  console.log('3 Perusahaan Laundry Berhasil Didaftarkan');

  // 2. Buat Admin (Super Owner & Admin Outlet)
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Super Owner SaaS (Pemilik Sistem)
  await prisma.admin.create({
    data: {
      nama: 'Super Owner SaaS',
      username: 'superowner',
      passwordHash,
      role: 'SUPER_OWNER',
      perusahaanId: null, // Akses global seluruh perusahaan
    },
  });

  // Admin Outlet 1 (Basmalah Wash)
  const admin1 = await prisma.admin.create({
    data: {
      nama: 'Admin Basmalah Wash',
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      perusahaanId: p1.id,
    },
  });

  // Admin Outlet 2 (Berkah Laundry)
  await prisma.admin.create({
    data: {
      nama: 'Admin Berkah',
      username: 'admin_berkah',
      passwordHash,
      role: 'ADMIN',
      perusahaanId: p2.id,
    },
  });
  console.log('Akun Super Owner & Admin Outlet Berhasil Dibuat');

  // 3. Buat 3 Paket Bulanan Resmi Basmalah Wash
  const paketBasic = await prisma.paket.create({
    data: {
      namaPaket: 'Basic',
      kuotaKg: 15.0,
      durasiHari: 30,
      harga: 100000,
      aktif: true,
      perusahaanId: p1.id,
    },
  });

  const paketReguler = await prisma.paket.create({
    data: {
      namaPaket: 'Reguler',
      kuotaKg: 25.0,
      durasiHari: 30,
      harga: 160000,
      aktif: true,
      perusahaanId: p1.id,
    },
  });

  const paketPremium = await prisma.paket.create({
    data: {
      namaPaket: 'Premium',
      kuotaKg: 30.0,
      durasiHari: 30,
      harga: 200000,
      aktif: true,
      perusahaanId: p1.id,
    },
  });

  // 4. Buat Member Contoh untuk Basmalah Wash
  // Member 1: Baru mendaftar (belum cuci pertama, masa aktif belum berjalan)
  const m1 = await prisma.member.create({
    data: {
      nama: 'Salmah Khairani Nasution',
      noHp: '081234567890',
      uidKartu: '04A1B2C3D4E5F6',
      paketId: paketBasic.id,
      kuotaAwal: 15.0,
      sisaKuota: 15.0,
      tglMulai: null,
      tglBerakhir: null,
      status: 'AKTIF',
      perusahaanId: p1.id,
    },
  });

  // Member 2: Paket Reguler 25 kg, sudah cuci (Aktif Hijau, sisa 20 hari)
  const m2 = await prisma.member.create({
    data: {
      nama: 'Budi Santoso',
      noHp: '085712349988',
      uidKartu: 'E2806894000050',
      paketId: paketReguler.id,
      kuotaAwal: 25.0,
      sisaKuota: 20.0,
      tglMulai: addDays(now, -10),
      tglBerakhir: addDays(now, 20),
      status: 'AKTIF',
      perusahaanId: p1.id,
    },
  });

  // Member 3: Indikator KUNING (Tersisa 4 hari)
  const m3 = await prisma.member.create({
    data: {
      nama: 'Siti Rahmawati',
      noHp: '081399887766',
      uidKartu: '04556677889900',
      paketId: paketPremium.id,
      kuotaAwal: 30.0,
      sisaKuota: 12.0,
      tglMulai: addDays(now, -26),
      tglBerakhir: addDays(now, 4), // Kuning: 3-5 hari
      status: 'AKTIF',
      perusahaanId: p1.id,
    },
  });

  // Member 4: Indikator MERAH (Tersisa 1 hari)
  const m4 = await prisma.member.create({
    data: {
      nama: 'Ahmad Fauzi',
      noHp: '082188776655',
      uidKartu: 'A1B2C3D4001122',
      paketId: paketBasic.id,
      kuotaAwal: 15.0,
      sisaKuota: 3.5,
      tglMulai: addDays(now, -29),
      tglBerakhir: addDays(now, 1), // Merah: 1 hari
      status: 'AKTIF',
      perusahaanId: p1.id,
    },
  });

  // Member 5: Indikator MERAH (Expired / 0 hari)
  const m5 = await prisma.member.create({
    data: {
      nama: 'Dewi Lestari',
      noHp: '087811223344',
      uidKartu: null,
      paketId: paketReguler.id,
      kuotaAwal: 25.0,
      sisaKuota: 0.0,
      tglMulai: addDays(now, -35),
      tglBerakhir: addDays(now, -5), // Merah: expired
      status: 'AKTIF',
      perusahaanId: p1.id,
    },
  });

  // 5. Buat Riwayat Transaksi Cucian Contoh
  await prisma.transaksi.create({
    data: {
      memberId: m2.id,
      beratKg: 5.0,
      sisaSebelum: 25.0,
      sisaSesudah: 20.0,
      catatan: 'Cuci kemeja & sprei',
      adminId: admin1.id,
      perusahaanId: p1.id,
      createdAt: addDays(now, -10),
    },
  });

  // 6. Buat Riwayat Pembelian / Perpanjangan Paket (Histori Pembelian)
  await prisma.perpanjangan.create({
    data: {
      memberId: m2.id,
      paketId: paketReguler.id,
      tglMulai: addDays(now, -10),
      tglBerakhir: addDays(now, 20),
      hargaDibayar: 160000,
      adminId: admin1.id,
      perusahaanId: p1.id,
      createdAt: addDays(now, -10),
    },
  });

  await prisma.perpanjangan.create({
    data: {
      memberId: m3.id,
      paketId: paketPremium.id,
      tglMulai: addDays(now, -26),
      tglBerakhir: addDays(now, 4),
      hargaDibayar: 200000,
      adminId: admin1.id,
      perusahaanId: p1.id,
      createdAt: addDays(now, -26),
    },
  });

  await prisma.perpanjangan.create({
    data: {
      memberId: m4.id,
      paketId: paketBasic.id,
      tglMulai: addDays(now, -29),
      tglBerakhir: addDays(now, 1),
      hargaDibayar: 100000,
      adminId: admin1.id,
      perusahaanId: p1.id,
      createdAt: addDays(now, -29),
    },
  });

  console.log('Riwayat Pembelian & Perpanjangan Paket Berhasil Dibuat');
  console.log('--- Selesai Seeding Data Multi-Tenant ---');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
