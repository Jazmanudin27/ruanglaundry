import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔄 Memeriksa & Mengatur Ulang Akun Admin...\n');

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 2);

  // 1. Pastikan Perusahaan Default Ada
  let perusahaan = await prisma.perusahaan.findFirst({
    where: { namaPerusahaan: 'Basmalah Wash' },
  });

  if (!perusahaan) {
    perusahaan = await prisma.perusahaan.create({
      data: {
        namaPerusahaan: 'Basmalah Wash',
        kodePerusahaan: 'BW-01',
        namaOwner: 'Muqodas',
        noHpOwner: '081234567890',
        alamat: 'Jl. Utama Basmalah Wash No. 1',
        tglMulaiLangganan: now,
        tglBerakhirLangganan: nextYear,
        statusLangganan: 'AKTIF',
        tarifBulanan: 200000,
      },
    });
    console.log('✅ Perusahaan "Basmalah Wash" berhasil disiapkan (Owner: Muqodas).');
  } else {
    // Pastikan status langganan aktif dan update owner
    await prisma.perusahaan.update({
      where: { id: perusahaan.id },
      data: {
        namaOwner: 'Muqodas',
        statusLangganan: 'AKTIF',
        tglBerakhirLangganan: nextYear,
      },
    });
  }

  // 2. Hash Password Default: 123456
  const passwordHash = await bcrypt.hash('123456', 10);

  // 3. User List
  const userList = [
    { nama: 'Muqodas', username: 'muqodas', role: 'ADMIN' },
    { nama: 'Reva', username: 'reva', role: 'KASIR' },
    { nama: 'Ulul', username: 'ulul', role: 'KASIR' },
    { nama: 'Admin Basmalah Wash', username: 'admin', role: 'ADMIN' },
  ];

  for (const u of userList) {
    await prisma.admin.upsert({
      where: { username: u.username },
      update: {
        nama: u.nama,
        passwordHash,
        role: u.role,
        perusahaanId: perusahaan.id,
      },
      create: {
        nama: u.nama,
        username: u.username,
        passwordHash,
        role: u.role,
        perusahaanId: perusahaan.id,
      },
    });
  }

  // 4. Upsert Akun Super Owner
  const superowner = await prisma.admin.upsert({
    where: { username: 'superowner' },
    update: {
      passwordHash,
      role: 'SUPER_OWNER',
    },
    create: {
      nama: 'Super Owner SaaS',
      username: 'superowner',
      passwordHash,
      role: 'SUPER_OWNER',
      perusahaanId: null,
    },
  });

  console.log('==============================================');
  console.log('       DAFTAR LOGIN USER BASMALAH WASH        ');
  console.log('==============================================');
  console.log('1. Owner (Admin Utama):');
  console.log('   Nama     : Muqodas');
  console.log('   Username : muqodas');
  console.log('   Password : 123456');
  console.log('   Role     : ADMIN');
  console.log('----------------------------------------------');
  console.log('2. Kasir 1:');
  console.log('   Nama     : Reva');
  console.log('   Username : reva');
  console.log('   Password : 123456');
  console.log('   Role     : KASIR');
  console.log('----------------------------------------------');
  console.log('3. Kasir 2:');
  console.log('   Nama     : Ulul');
  console.log('   Username : ulul');
  console.log('   Password : 123456');
  console.log('   Role     : KASIR');
  console.log('----------------------------------------------');
  console.log('4. Admin Backup:');
  console.log('   Username : admin');
  console.log('   Password : 123456');
  console.log('   Role     : ADMIN');
  console.log('----------------------------------------------');
  console.log('5. Super Owner SaaS:');
  console.log('   Username : superowner');
  console.log('   Password : 123456');
  console.log('   Role     : SUPER_OWNER');
  console.log('==============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat reset admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

