# Sistem Member Laundry Berbasis Kartu NFC 🧺💳

Aplikasi sistem kasir dan manajemen member laundry berbasis kartu NFC untuk satu outlet laundry express. Admin cukup melakukan **Tap kartu NFC -> Input berat cucian -> Simpan**. Sistem secara otomatis mengelola kuota, tanggal kedaluwarsa, pemotongan berat, serta pencatatan riwayat transaksi dengan proteksi race condition.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite) + React Router v6 + Tailwind CSS + Axios + Lucide React
- **Backend**: Node.js + Express (ES Modules)
- **Database & ORM**: PostgreSQL + Prisma ORM (Tipe Decimal untuk kuota & berat)
- **Keamanan**: JWT, Bcrypt, Helmet, CORS terproteksi, Rate Limiting login
- **Validasi**: Zod Schema Validator
- **Unit Testing**: Jest (Mendukung pengujian logika transaksi & pencegahan konkurensi)

---

## 📋 Fitur Utama

1. **Autentikasi Admin**: Login berbasis JWT dengan rate limiter, session management terproteksi, auto logout jika token kedaluwarsa.
2. **Scanner NFC Reusable 3-in-1 (`<NfcScanner />`)**:
   - **Web NFC API (`NDEFReader`)**: Untuk smartphone Chrome Android (menggunakan HTTPS / Ngrok). Membaca `serialNumber` kartu.
   - **USB NFC Reader (Keyboard Wedge Mode)**: Auto-focus otomatis membaca UID dari tap reader USB di PC/Laptop/Mesin Kasir.
   - **Pencarian Manual**: Pencarian darurat berdasarkan Nama atau No. HP jika kartu tertinggal/hilang.
   - **Normalisasi UID**: Otomatis membersihkan spasi, tanda hubung, titik dua, dan mengubah ke format huruf kapital konsisten.
3. **Pencatatan Laundry Cepat (Mobile-First)**:
   - Input berat cucian (kg, mendukung desimal contoh 3.5 kg) dengan tombol cepat preset berat.
   - Validasi ketat kuota & masa aktif.
   - Update atomik dalam `prisma.$transaction` untuk mencegah race condition (kuota tidak bisa minus meskipun ada 2 request bersamaan).
4. **Data Master Member**:
   - Filter status: Semua, Aktif, Hampir Habis (kuota ≤ 10% atau sisa masa aktif ≤ 7 hari), dan Kedaluwarsa.
   - Tampilan visual tabel identik dengan antarmuka Ruang Market.
5. **Perpanjang & Ganti Kartu NFC**:
   - Ganti kartu jika hilang atau rusak tanpa menghilangkan kuota dan data lama.
   - Perpanjangan paket dengan kebijakan sisa kuota lama yang dapat diatur lewat `.env` (`DIGABUNG` atau `HANGUS`).
6. **Kelola Paket**: CRUD paket laundry (nama paket, kuota kg, durasi hari, harga).
7. **Riwayat Lengkap**: Log transaksi per member maupun seluruh outlet lengkap dengan pencatat admin dan selisih kuota.

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Prasyarat Sistem
- **Node.js**: v18+ atau v20+
- **PostgreSQL**: Pastikan database server aktif di port 5432 (atau gunakan cloud PostgreSQL seperti Neon/Supabase).

---

### 2. Setup Backend

1. Buka terminal di folder `backend`:
   ```bash
   cd backend
   ```
2. Salin file environment:
   ```bash
   cp .env.example .env
   ```
3. Sesuaikan koneksi database di file `.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:password_kamu@localhost:5432/ruang_laundry?schema=public"
   JWT_SECRET="kunci_rahasia_jwt_ruang_laundry_super_aman_2026_xyz"
   JWT_EXPIRES_IN="1d"
   CORS_ORIGIN="http://localhost:5173"
   KEBIJAKAN_SISA_KUOTA="DIGABUNG" # Opsi: DIGABUNG atau HANGUS
   ```
4. Install dependensi (jika belum):
   ```bash
   npm install
   ```
5. Generate Prisma Client dan Push Schema ke PostgreSQL:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
6. Jalankan Seeding Data Awal (1 Admin, 3 Paket, 5 Member Contoh):
   ```bash
   npm run prisma:seed
   ```
7. Jalankan Server Backend:
   ```bash
   npm run dev
   ```
   Server aktif di `http://localhost:5000`

---

### 3. Setup Frontend

1. Buka terminal baru di folder `frontend`:
   ```bash
   cd frontend
   ```
2. Salin file environment:
   ```bash
   cp .env.example .env
   ```
   Pastikan mengarah ke server backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Install dependensi (jika belum):
   ```bash
   npm install
   ```
4. Jalankan Frontend Vite:
   ```bash
   npm run dev
   ```
   Aplikasi dapat dibuka di browser: `http://localhost:5173`

---

## 🔑 Kredensial Login Default (Seed)

| Role | Username | Password |
|---|---|---|
| **Super Admin** | `admin` | `admin123` |

---

## 📱 Cara Mengetes Web NFC di Android (Chrome)

Web NFC API (`NDEFReader`) mewajibkan **koneksi HTTPS aman** dan hanya berjalan di **Google Chrome Android**:

### Menggunakan Ngrok (Gratis & Cepat)
1. Jalankan backend dan frontend secara lokal.
2. Forward port frontend (5173) menggunakan ngrok:
   ```bash
   ngrok http 5173
   ```
3. Buka URL HTTPS yang diberikan oleh ngrok (contoh: `https://xxxx.ngrok-free.app`) di **Google Chrome ponsel Android**.
4. Masuk ke halaman **Scan NFC** atau klik tombol **Scan Kartu**.
5. Dekatkan kartu NFC (Mifare, NTAG, kartu e-toll/e-money) ke bagian sensor NFC di punggung ponsel Android Anda.
6. UID kartu akan terbaca seketika dan menampilkan data member!

---

## 🧪 Menjalankan Unit Test

Unit test memvalidasi:
- Normalisasi format UID NFC
- Validasi input berat cucian (angka desimal > 0)
- Logika transaksi (kuota cukup, kuota kurang, masa aktif kedaluwarsa)
- Pencegahan race condition (transaksi atomik konkuren)

Jalankan perintah berikut di folder `backend`:
```bash
cd backend
npm test
```

---

## 📂 Struktur Proyek

```
g:/Ruang Laundry/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Skema database PostgreSQL
│   │   └── seed.js            # Seed data admin, paket & member
│   ├── src/
│   │   ├── config/            # Konfigurasi db & env
│   │   ├── controllers/       # Controller auth, member, paket, transaksi, dashboard
│   │   ├── middlewares/       # JWT auth, central error handler, rate limiter
│   │   ├── routes/            # Express router endpoint prefix /api
│   │   ├── services/          # Logika bisnis transaksi atomik & perpanjangan
│   │   ├── utils/             # Format response & normalisasi UID
│   │   ├── validators/        # Zod validator schema
│   │   ├── app.js             # Setup express & middleware
│   │   └── server.js          # Entrypoint server
│   ├── tests/
│   │   └── transaksiLogic.test.js # Unit test Jest
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/               # Axios instance & API wrapper
    │   ├── components/        # NfcScanner, KartuKuota, ModalScanKartu, Navbar, Layout, ProtectedRoute
    │   ├── context/           # AuthContext (login state & JWT token)
    │   ├── pages/             # Login, Dashboard, ScanMember, Members, MemberForm, MemberDetail, PaketList, TransaksiList
    │   ├── utils/             # Helper NFC & tanggal
    │   ├── App.jsx            # React Router
    │   └── index.css          # Tailwind CSS styling
    ├── .env.example
    └── package.json
```
