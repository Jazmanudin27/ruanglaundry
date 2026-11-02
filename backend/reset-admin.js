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
        namaOwner: 'Owner Basmalah Wash',
        noHpOwner: '081234567890',
        alamat: 'Jl. Utama Basmalah Wash No. 1',
        tglMulaiLangganan: now,
        tglBerakhirLangganan: nextYear,
        statusLangganan: 'AKTIF',
        tarifBulanan: 200000,
      },
    });
    console.log('✅ Perusahaan "Basmalah Wash" berhasil disiapkan.');
  } else {
    // Pastikan status langganan aktif
    await prisma.perusahaan.update({
      where: { id: perusahaan.id },
      data: {
        statusLangganan: 'AKTIF',
        tglBerakhirLangganan: nextYear,
      },
    });
  }

  // 2. Hash Password Default: admin123
  const passwordHash = await bcrypt.hash('admin123', 10);

  // 3. Upsert Akun Admin Outlet
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash,
      role: 'ADMIN',
      perusahaanId: perusahaan.id,
    },
    create: {
      nama: 'Admin Basmalah Wash',
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      perusahaanId: perusahaan.id,
    },
  });

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
  console.log('       KREDENSIAL LOGIN BASMALAH WASH         ');
  console.log('==============================================');
  console.log('1. Akun Admin Outlet:');
  console.log('   Username : admin');
  console.log('   Password : admin123');
  console.log('   Role     : ADMIN');
  console.log('----------------------------------------------');
  console.log('2. Akun Super Owner SaaS:');
  console.log('   Username : superowner');
  console.log('   Password : admin123');
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

