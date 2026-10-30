/**
 * Normalisasi format UID NFC:
 * - Ubah ke huruf kapital
 * - Hapus karakter pemisah seperti spasi, titik dua, tanda minus (misal: "04:a1:b2" -> "04A1B2")
 */
export const normalizeNfcUid = (uid) => {
  if (!uid) return '';
  return uid.toString().trim().toUpperCase().replace(/[^0-9A-F]/g, '');
};

/**
 * Cek apakah browser mendukung Web NFC API (NDEFReader)
 */
export const isWebNfcSupported = () => {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
};

/**
 * Format mata uang Rupiah
 */
export const formatRupiah = (nominal) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(nominal || 0);
};

/**
 * Format tanggal Indonesia
 */
export const formatTanggal = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format tanggal dan waktu Indonesia
 */
export const formatTanggalWaktu = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
