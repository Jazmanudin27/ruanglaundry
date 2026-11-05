import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rawData = [
  { no: 1, nama: 'Adinda', paket: 'Premium', sisaKuota: 30.77, berakhir: '2026-12-02' },
  { no: 2, nama: 'Alvin Prasetya', paket: 'Reguler', sisaKuota: 23.41, berakhir: '2026-11-22' },
  { no: 3, nama: 'Alifa', paket: 'Premium', sisaKuota: 26.11, berakhir: '2026-11-23' },
  { no: 4, nama: 'Ayla Nurita', paket: 'Basic', sisaKuota: 12.83, berakhir: '2026-11-30' },
  { no: 5, nama: 'Dinar Fadilah', paket: 'Reguler', sisaKuota: 21.45, berakhir: '2026-12-02' },
  { no: 6, nama: 'Dira Nurazmi', paket: 'Premium', sisaKuota: 32.84, berakhir: '2026-11-27' },
  { no: 7, nama: 'Fathir', paket: 'Reguler', sisaKuota: 23.19, berakhir: '2026-11-30' },
  { no: 8, nama: 'Hasbina', paket: 'Reguler', sisaKuota: 22.22, berakhir: '2026-12-02' },
  { no: 9, nama: 'Kayla Nazila Rahma', paket: 'Premium', sisaKuota: 33.14, berakhir: '2026-11-30' },
  { no: 10, nama: 'Lulu Maklumi', paket: 'Basic', sisaKuota: 8.84, berakhir: '2026-11-07' },
  { no: 11, nama: 'Lena Rahmawati', paket: 'Basic', sisaKuota: 12.11, berakhir: '2026-11-30' },
  { no: 12, nama: 'Liana Jahira', paket: 'Premium', sisaKuota: 15.93, berakhir: '2026-11-20' },
  { no: 13, nama: 'Ibran Mahardika', paket: 'Premium', sisaKuota: 23.00, berakhir: '2026-11-27' },
  { no: 14, nama: 'Naila Fatimah Az-Zahra', paket: 'Reguler', sisaKuota: 21.20, berakhir: '2026-12-04' },
  { no: 15, nama: 'Novianti Kartika', paket: 'Premium', sisaKuota: 32.13, berakhir: '2026-12-02' },
  { no: 16, nama: 'Ufairah Nur Sharifah', paket: 'Reguler', sisaKuota: 8.70, berakhir: '2026-11-27' },
];

async function main() {
  console.log('\n🚀 Memulai Proses Import 16 Anggota Basmalah Wash...');

  // 1. Dapatkan atau buat perusahaan Basmalah Wash
  let perusahaan = await prisma.perusahaan.findFirst({
    where: { namaPerusahaan: 'Basmalah Wash' },
  });

  if (!perusahaan) {
    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 2);

    perusahaan = await prisma.perusahaan.create({
      data: {
        namaPerusahaan: 'Basmalah Wash',
        kodePerusahaan: 'BW-01',
        namaOwner: 'Admin Basmalah Wash',
        noHpOwner: '081234567890',
        alamat: 'Jl. Utama Basmalah Wash No. 1',
        tglMulaiLangganan: now,
        tglBerakhirLangganan: nextYear,
        statusLangganan: 'AKTIF',
        tarifBulanan: 200000,
      },
    });
    console.log('✅ Perusahaan Basmalah Wash dibuat.');
  }

  // 2. Pastikan 3 Paket Resmi Ada
  const defaultPakets = [
    { namaPaket: 'Basic', kuotaKg: 15.0, durasiHari: 30, harga: 100000 },
    { namaPaket: 'Reguler', kuotaKg: 25.0, durasiHari: 30, harga: 160000 },
    { namaPaket: 'Premium', kuotaKg: 30.0, durasiHari: 30, harga: 200000 },
  ];

  const paketMap = {};
  for (const dp of defaultPakets) {
    let paket = await prisma.paket.findFirst({
      where: {
        namaPaket: dp.namaPaket,
        perusahaanId: perusahaan.id,
      },
    });

    if (!paket) {
      paket = await prisma.paket.create({
        data: {
          ...dp,
          aktif: true,
          perusahaanId: perusahaan.id,
        },
      });
    }
    paketMap[dp.namaPaket.toLowerCase()] = paket;
  }
  console.log('✅ Paket Basic, Reguler, Premium siap.');

  // 3. Kosongkan / Bersihkan Data Member & Transaksi Lama
  console.log('🧹 Mengosongkan transaksi & data member lama...');
  await prisma.transaksi.deleteMany();
  await prisma.perpanjangan.deleteMany();
  await prisma.member.deleteMany();
  console.log('✅ Data lama berhasil dikosongkan.');

  // 4. Masukkan 16 Data Anggota Baru
  console.log('📥 Memasukkan 16 data anggota baru...');

  for (const item of rawData) {
    const paket = paketMap[item.paket.toLowerCase()];
    if (!paket) {
      console.warn(`⚠️ Paket ${item.paket} tidak ditemukan untuk ${item.nama}`);
      continue;
    }

    const tglBerakhir = new Date(`${item.berakhir}T23:59:59`);
    const tglMulai = new Date(tglBerakhir.getTime() - (paket.durasiHari || 30) * 24 * 60 * 60 * 1000);
    const kuotaAwal = Math.max(paket.kuotaKg, item.sisaKuota);

    // Dummy nomor HP unik
    const noHp = `08${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    await prisma.member.create({
      data: {
        nama: item.nama,
        noHp: noHp,
        uidKartu: null, // Member tanpa kartu fisik (bisa disambungkan via NFC kapan saja)
        paketId: paket.id,
        kuotaAwal: kuotaAwal,
        sisaKuota: item.sisaKuota,
        tglMulai: tglMulai,
        tglBerakhir: tglBerakhir,
        status: 'AKTIF',
        perusahaanId: perusahaan.id,
      },
    });

    console.log(`  + [${item.no}] ${item.nama} | ${item.paket} | Sisa: ${item.sisaKuota} kg | Berakhir: ${item.berakhir}`);
  }

  console.log('\n🎉 Selesai! Sebanyak 16 anggota resmi Basmalah Wash telah tersimpan ke database.');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

