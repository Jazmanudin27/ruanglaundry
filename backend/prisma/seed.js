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
      nama: 'Muqodas',
      username: 'muqodas',
      passwordHash,
      role: 'ADMIN',
      perusahaanId: p1.id,
    },
  });

  await prisma.admin.create({
    data: {
      nama: 'Reva',
      username: 'reva',
      passwordHash,
      role: 'KASIR',
      perusahaanId: p1.id,
    },
  });

  await prisma.admin.create({
    data: {
      nama: 'Ulul',
      username: 'ulul',
      passwordHash,
      role: 'KASIR',
      perusahaanId: p1.id,
    },
  });

  await prisma.admin.create({
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

  // 4. Buat 16 Member Resmi Basmalah Wash
  const memberData = [
    { no: 1, nama: 'Adinda', paketId: paketPremium.id, sisaKuota: 30.77, kuotaAwal: 30.77, berakhir: '2026-12-02' },
    { no: 2, nama: 'Alvin Prasetya', paketId: paketReguler.id, sisaKuota: 23.41, kuotaAwal: 25.0, berakhir: '2026-11-22' },
    { no: 3, nama: 'Alifa', paketId: paketPremium.id, sisaKuota: 26.11, kuotaAwal: 30.0, berakhir: '2026-11-23' },
    { no: 4, nama: 'Ayla Nurita', paketId: paketBasic.id, sisaKuota: 12.83, kuotaAwal: 15.0, berakhir: '2026-11-30' },
    { no: 5, nama: 'Dinar Fadilah', paketId: paketReguler.id, sisaKuota: 21.45, kuotaAwal: 25.0, berakhir: '2026-12-02' },
    { no: 6, nama: 'Dira Nurazmi', paketId: paketPremium.id, sisaKuota: 32.84, kuotaAwal: 32.84, berakhir: '2026-11-27' },
    { no: 7, nama: 'Fathir', paketId: paketReguler.id, sisaKuota: 23.19, kuotaAwal: 25.0, berakhir: '2026-11-30' },
    { no: 8, nama: 'Hasbina', paketId: paketReguler.id, sisaKuota: 22.22, kuotaAwal: 25.0, berakhir: '2026-12-02' },
    { no: 9, nama: 'Kayla Nazila Rahma', paketId: paketPremium.id, sisaKuota: 33.14, kuotaAwal: 33.14, berakhir: '2026-11-30' },
    { no: 10, nama: 'Lulu Maklumi', paketId: paketBasic.id, sisaKuota: 8.84, kuotaAwal: 15.0, berakhir: '2026-11-07' },
    { no: 11, nama: 'Lena Rahmawati', paketId: paketBasic.id, sisaKuota: 12.11, kuotaAwal: 15.0, berakhir: '2026-11-30' },
    { no: 12, nama: 'Liana Jahira', paketId: paketPremium.id, sisaKuota: 15.93, kuotaAwal: 30.0, berakhir: '2026-11-20' },
    { no: 13, nama: 'Ibran Mahardika', paketId: paketPremium.id, sisaKuota: 23.00, kuotaAwal: 30.0, berakhir: '2026-11-27' },
    { no: 14, nama: 'Naila Fatimah Az-Zahra', paketId: paketReguler.id, sisaKuota: 21.20, kuotaAwal: 25.0, berakhir: '2026-12-04' },
    { no: 15, nama: 'Novianti Kartika', paketId: paketPremium.id, sisaKuota: 32.13, kuotaAwal: 32.13, berakhir: '2026-12-02' },
    { no: 16, nama: 'Ufairah Nur Sharifah', paketId: paketReguler.id, sisaKuota: 8.70, kuotaAwal: 25.0, berakhir: '2026-11-27' },
  ];

  for (const m of memberData) {
    const tglBerakhir = new Date(`${m.berakhir}T23:59:59`);
    const tglMulai = new Date(tglBerakhir.getTime() - 30 * 24 * 60 * 60 * 1000);
    const noHp = `08${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    await prisma.member.create({
      data: {
        nama: m.nama,
        noHp,
        uidKartu: null,
        paketId: m.paketId,
        kuotaAwal: m.kuotaAwal,
        sisaKuota: m.sisaKuota,
        tglMulai,
        tglBerakhir,
        status: 'AKTIF',
        perusahaanId: p1.id,
      },
    });
  }
  console.log('16 Member Resmi Basmalah Wash Berhasil Dibuat');
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
