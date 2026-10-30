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

  // 1. Buat 3 Perusahaan Laundry Contoh (SaaS 200rb/bulan)
  const p1 = await prisma.perusahaan.create({
    data: {
      namaPerusahaan: 'Ruang Laundry Express',
      kodePerusahaan: 'RL-01',
      namaOwner: 'Bapak H. Hendra Saputra',
      noHpOwner: '081234567890',
      alamat: 'Jl. Pemuda No. 45, Bandung',
      tglMulaiLangganan: now,
      tglBerakhirLangganan: addDays(now, 30), // Aktif 30 hari ke depan
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

  // Admin Outlet 1 (Ruang Laundry Express)
  const admin1 = await prisma.admin.create({
    data: {
      nama: 'Admin Ruang Laundry',
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

  // 3. Buat Paket Laundry untuk Perusahaan 1
  const paketHemat = await prisma.paket.create({
    data: {
      namaPaket: 'Paket Hemat',
      kuotaKg: 10.0,
      durasiHari: 30,
      harga: 70000,
      aktif: true,
      perusahaanId: p1.id,
    },
  });

  const paketReguler = await prisma.paket.create({
    data: {
      namaPaket: 'Paket Reguler',
      kuotaKg: 25.0,
      durasiHari: 30,
      harga: 160000,
      aktif: true,
      perusahaanId: p1.id,
    },
  });

  const paketFamily = await prisma.paket.create({
    data: {
      namaPaket: 'Paket Family',
      kuotaKg: 50.0,
      durasiHari: 60,
      harga: 300000,
      aktif: true,
      perusahaanId: p1.id,
    },
  });

  // 4. Buat Member untuk Perusahaan 1
  const m1 = await prisma.member.create({
    data: {
      nama: 'Salmah Khairani Nasution',
      noHp: '081234567890',
      uidKartu: '04A1B2C3D4E5F6',
      paketId: paketReguler.id,
      kuotaAwal: 25.0,
      sisaKuota: 20.5,
      tglMulai: addDays(now, -5),
      tglBerakhir: addDays(now, 25),
      status: 'AKTIF',
      perusahaanId: p1.id,
    },
  });

  const m2 = await prisma.member.create({
    data: {
      nama: 'Budi Santoso',
      noHp: '085712349988',
      uidKartu: 'E2806894000050',
      paketId: paketHemat.id,
      kuotaAwal: 10.0,
      sisaKuota: 0.8,
      tglMulai: addDays(now, -15),
      tglBerakhir: addDays(now, 15),
      status: 'AKTIF',
      perusahaanId: p1.id,
    },
  });

  const m3 = await prisma.member.create({
    data: {
      nama: 'Siti Rahmawati',
      noHp: '081399887766',
      uidKartu: '04556677889900',
      paketId: paketFamily.id,
      kuotaAwal: 50.0,
      sisaKuota: 28.0,
      tglMulai: addDays(now, -57),
      tglBerakhir: addDays(now, 3),
      status: 'AKTIF',
      perusahaanId: p1.id,
    },
  });

  const m4 = await prisma.member.create({
    data: {
      nama: 'Ahmad Fauzi',
      noHp: '082188776655',
      uidKartu: 'A1B2C3D4001122',
      paketId: paketHemat.id,
      kuotaAwal: 10.0,
      sisaKuota: 3.5,
      tglMulai: addDays(now, -40),
      tglBerakhir: addDays(now, -10),
      status: 'AKTIF',
      perusahaanId: p1.id,
    },
  });

  const m5 = await prisma.member.create({
    data: {
      nama: 'Dewi Lestari',
      noHp: '087811223344',
      uidKartu: null,
      paketId: paketReguler.id,
      kuotaAwal: 25.0,
      sisaKuota: 25.0,
      tglMulai: now,
      tglBerakhir: addDays(now, 30),
      status: 'AKTIF',
      perusahaanId: p1.id,
    },
  });

  // 5. Buat Riwayat Transaksi Cucian
  await prisma.transaksi.create({
    data: {
      memberId: m1.id,
      beratKg: 4.5,
      sisaSebelum: 25.0,
      sisaSesudah: 20.5,
      catatan: 'Cuci kemeja & sprei kasur',
      adminId: admin1.id,
      perusahaanId: p1.id,
      createdAt: addDays(now, -2),
    },
  });

  // 6. Buat Riwayat Pembelian / Perpanjangan Paket (Histori Pembelian)
  await prisma.perpanjangan.create({
    data: {
      memberId: m1.id,
      paketId: paketReguler.id,
      tglMulai: addDays(now, -5),
      tglBerakhir: addDays(now, 25),
      hargaDibayar: 160000,
      adminId: admin1.id,
      perusahaanId: p1.id,
      createdAt: addDays(now, -5),
    },
  });

  await prisma.perpanjangan.create({
    data: {
      memberId: m3.id,
      paketId: paketFamily.id,
      tglMulai: addDays(now, -57),
      tglBerakhir: addDays(now, 3),
      hargaDibayar: 300000,
      adminId: admin1.id,
      perusahaanId: p1.id,
      createdAt: addDays(now, -57),
    },
  });

  await prisma.perpanjangan.create({
    data: {
      memberId: m2.id,
      paketId: paketHemat.id,
      tglMulai: addDays(now, -15),
      tglBerakhir: addDays(now, 15),
      hargaDibayar: 70000,
      adminId: admin1.id,
      perusahaanId: p1.id,
      createdAt: addDays(now, -15),
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
