import React from 'react';

export default function ThermalReceipt({
  transaksi,
  member,
  kasirNama = 'Kasir',
  perusahaanNoHp = '0812 1404 6587',
}) {
  if (!transaksi) return null;

  // Format ID Transaksi
  const noTransaksi = transaksi.id
    ? `TRX-${String(transaksi.id).replace(/-/g, '').substring(0, 6).toUpperCase()}`
    : 'TRX-000125';

  // Format No Pelanggan
  const noPelanggan = member?.id
    ? `MB-${String(member.id).replace(/-/g, '').substring(0, 6).toUpperCase()}`
    : (transaksi.memberId ? `MB-${String(transaksi.memberId).replace(/-/g, '').substring(0, 6).toUpperCase()}` : 'NON-MEMBER');

  // Format Tanggal
  const tgl = transaksi.createdAt ? new Date(transaksi.createdAt) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formattedDate = `${pad(tgl.getDate())}-${pad(tgl.getMonth() + 1)}-${tgl.getFullYear()} ${pad(tgl.getHours())}:${pad(tgl.getMinutes())}`;

  const namaPelanggan = member?.nama || transaksi.member?.nama || transaksi.namaPelanggan || 'Pelanggan';
  const noHpPelanggan = member?.noHp || transaksi.member?.noHp || transaksi.noHpPelanggan || '-';
  const isMember = transaksi.jenisPelanggan !== 'NON_MEMBER' && (member || transaksi.member || transaksi.memberId);

  // Paket & Kuota
  const namaPaket = member?.paket?.namaPaket || transaksi.member?.paket?.namaPaket || 'Reguler';
  const berat = parseFloat(transaksi.beratKg || 0);
  const sisaSebelum = parseFloat(transaksi.sisaSebelum ?? member?.sisaKuota ?? 0);
  const sisaSesudah = parseFloat(transaksi.sisaSesudah ?? (sisaSebelum - berat));

  // Parse rincian pakaian dari catatan jika ada format baris atau koma
  const parseCatatanItems = (catatanText) => {
    if (!catatanText || !catatanText.trim()) return null;
    const lines = catatanText.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) return null;
    return lines;
  };

  const catatanItems = parseCatatanItems(transaksi.catatan);

  return (
    <div
      id="printable-thermal-receipt"
      className="receipt-thermal-container bg-white text-black font-sans leading-tight mx-auto select-text"
      style={{
        width: '58mm',
        maxWidth: '58mm',
        padding: '3mm 2mm',
        fontSize: '11px',
        color: '#000',
        backgroundColor: '#fff',
      }}
    >
      <style orientation="portrait">
        {`
          @media print {
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff !important;
              color: #000 !important;
            }
            #printable-thermal-receipt {
              width: 58mm !important;
              max-width: 58mm !important;
              padding: 2mm 1.5mm !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}
      </style>

      {/* 1. HEADER LOGO & NAMA BRAND */}
      <div className="text-center pb-1">
        {/* SVG Washing Machine Icon persis desain */}
        <div className="flex justify-center mb-1">
          <svg
            className="w-12 h-12 text-black"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Sparkles */}
            <path d="M48 6 L49 10 L53 11 L49 12 L48 16 L47 12 L43 11 L47 10 Z" fill="black" stroke="none" />
            <path d="M42 16 L42.5 18 L44.5 18.5 L42.5 19 L42 21 L41.5 19 L39.5 18.5 L41.5 18 Z" fill="black" stroke="none" />

            {/* Mesin Cuci Body */}
            <rect x="12" y="10" width="40" height="46" rx="8" strokeWidth="3" />
            {/* Controls */}
            <circle cx="20" cy="18" r="2.5" fill="black" />
            <circle cx="28" cy="18" r="2.5" fill="black" />
            {/* Round Door */}
            <circle cx="32" cy="38" r="14" strokeWidth="3" />
            {/* Wave inside door */}
            <path d="M24 38 Q 28 32, 32 38 T 40 38" strokeWidth="2.5" />
            {/* Water bubbles */}
            <circle cx="10" cy="46" r="2" fill="black" />
            <circle cx="8" cy="52" r="3" fill="black" />
          </svg>
        </div>

        {/* Brand Name */}
        <div className="font-black text-xl tracking-tight leading-none uppercase italic" style={{ fontFamily: 'Arial, sans-serif' }}>
          Basmalah
        </div>
        <div className="font-black text-2xl tracking-tight leading-none uppercase italic -mt-1" style={{ fontFamily: 'Arial, sans-serif' }}>
          Wash
        </div>

        {/* Decorative Slogan */}
        <div className="flex items-center justify-center gap-1.5 my-1.5">
          <div className="h-[1px] bg-black flex-1" />
          <span className="text-[9.5px] font-bold tracking-tight italic whitespace-nowrap">
            Bersih • Rapi • Penuh Berkah
          </span>
          <div className="h-[1px] bg-black flex-1" />
        </div>

        {/* Pill Badge Layanan */}
        <div className="inline-block bg-black text-white px-3.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider my-1">
          {isMember ? 'Layanan Laundry Member' : 'Layanan Laundry Kiloan'}
        </div>
      </div>

      {/* 2. NO TRANSAKSI & TANGGAL */}
      <div className="space-y-0.5 py-1 text-[10.5px]">
        <div className="flex justify-between">
          <span>No. Transaksi</span>
          <span>:</span>
          <strong className="flex-1 text-right font-mono">{noTransaksi}</strong>
        </div>
        <div className="flex justify-between">
          <span>No. Pelanggan</span>
          <span>:</span>
          <span className="flex-1 text-right font-mono">{noPelanggan}</span>
        </div>
        <div className="flex justify-between">
          <span>Tanggal</span>
          <span>:</span>
          <span className="flex-1 text-right">{formattedDate}</span>
        </div>
      </div>

      {/* DASHED LINE */}
      <div className="border-t-[1.5px] border-dashed border-black my-1.5" />

      {/* 3. INFO PELANGGAN & KASIR */}
      <div className="space-y-0.5 py-0.5 text-[10.5px]">
        <div className="flex justify-between">
          <span>Nama Pelanggan</span>
          <span>:</span>
          <strong className="flex-1 text-right truncate max-w-[150px]">{namaPelanggan}</strong>
        </div>
        <div className="flex justify-between">
          <span>Nama Kasir</span>
          <span>:</span>
          <span className="flex-1 text-right">{kasirNama}</span>
        </div>
        <div className="flex justify-between">
          <span>No. HP</span>
          <span>:</span>
          <span className="flex-1 text-right font-mono">{noHpPelanggan}</span>
        </div>

        {/* WhatsApp Kontak Toko */}
        <div className="flex items-center justify-center gap-1.5 pt-1.5 text-[10px] font-bold">
          {/* WA Icon */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span className="border-l border-black pl-1.5 whitespace-nowrap">
            Basmalah Wash : {perusahaanNoHp}
          </span>
        </div>
      </div>

      {/* DASHED LINE */}
      <div className="border-t-[1.5px] border-dashed border-black my-1.5" />

      {/* 4. DETAIL LAUNDRY BADGE */}
      <div className="text-center my-1">
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <div className="h-[1px] bg-black flex-1" />
          <span className="bg-black text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
            Detail Laundry
          </span>
          <div className="h-[1px] bg-black flex-1" />
        </div>

        {/* Tabel Rincian Pakaian / Berat */}
        <div className="space-y-1 text-[11px] text-left px-1">
          {catatanItems ? (
            catatanItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="font-medium truncate max-w-[160px]">{item}</span>
                <span className="font-bold whitespace-nowrap">✓</span>
              </div>
            ))
          ) : null}

          {/* Berat Cucian */}
          <div className="flex justify-between items-center pt-0.5 font-bold">
            <span>Total Berat</span>
            <span className="font-extrabold text-[12px]">{berat.toFixed(2)} Kg</span>
          </div>

          {transaksi.rakPenyimpanan && (
            <div className="flex justify-between items-center text-[10px]">
              <span>Posisi Rak</span>
              <span className="font-bold uppercase">{transaksi.rakPenyimpanan}</span>
            </div>
          )}
        </div>
      </div>

      {/* DASHED LINE */}
      <div className="border-t-[1.5px] border-dashed border-black my-1.5" />

      {/* 5. INFORMASI MEMBER / BAYAR */}
      {isMember ? (
        <div className="text-center my-1">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="h-[1px] bg-black flex-1" />
            <span className="bg-black text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
              Informasi Member
            </span>
            <div className="h-[1px] bg-black flex-1" />
          </div>

          <div className="space-y-1 text-[11px] px-1 text-left">
            <div className="flex justify-between">
              <span>Paket</span>
              <span>:</span>
              <strong className="flex-1 text-right">{namaPaket}</strong>
            </div>
            <div className="flex justify-between">
              <span>Kuota Awal</span>
              <span>:</span>
              <span className="flex-1 text-right">{sisaSebelum.toFixed(2)} Kg</span>
            </div>
            <div className="flex justify-between">
              <span>Terpakai</span>
              <span>:</span>
              <span className="flex-1 text-right">{berat.toFixed(2)} Kg</span>
            </div>

            {/* Sisa Kuota Kotak Tebal Persis Desain */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold">Sisa Kuota</span>
              <span>:</span>
              <div className="flex-1 flex justify-end">
                <div className="border-[2px] border-black rounded-lg px-3 py-0.5 text-center font-black text-sm tracking-tight">
                  {sisaSesudah.toFixed(2)} Kg
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center my-1">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="h-[1px] bg-black flex-1" />
            <span className="bg-black text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
              Pembayaran Kiloan
            </span>
            <div className="h-[1px] bg-black flex-1" />
          </div>

          <div className="space-y-1 text-[11px] px-1 text-left">
            <div className="flex justify-between">
              <span>Tarif per Kg</span>
              <span>:</span>
              <span className="flex-1 text-right">Rp {(transaksi.tarifPerKg || 7000).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Bayar</span>
              <span>:</span>
              <strong className="flex-1 text-right text-xs">
                Rp {(transaksi.totalBayar || 0).toLocaleString('id-ID')}
              </strong>
            </div>
            <div className="flex justify-between font-bold">
              <span>Status Bayar</span>
              <span>:</span>
              <div className="flex-1 flex justify-end">
                <div className="border-[2px] border-black rounded-md px-2 py-0.5 text-xs font-black uppercase">
                  {transaksi.statusBayar || 'LUNAS'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHED LINE */}
      <div className="border-t-[1.5px] border-dashed border-black my-1.5" />

      {/* 6. FOOTER UCAPAN & SLOGAN SANTRI */}
      <div className="text-center pt-1 text-[10px]">
        <p className="italic leading-normal px-1 font-serif">
          Terima kasih telah mempercayakan laundry Anda kepada Basmalah Wash.
        </p>

        <div className="flex items-center justify-center gap-1 mt-2 mb-1">
          <div className="h-[1px] bg-black flex-1" />
          <span className="font-bold text-[10px] tracking-tight italic whitespace-nowrap">
            Dari Santri untuk Negeri
          </span>
          <div className="h-[1px] bg-black flex-1" />
        </div>
      </div>
    </div>
  );
}

