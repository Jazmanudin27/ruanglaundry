import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Wifi,
  Scale,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  RotateCcw,
  Sparkles,
  ArrowRight,
  UserCheck,
  Copy,
  Check,
  ExternalLink,
  Share2,
  ShoppingBag,
} from "lucide-react";
import NfcScanner from "../../components/NfcScanner";
import KartuKuota from "../../components/KartuKuota";
import { memberApi, transaksiApi } from "../../api";
import { formatTanggalWaktu } from "../../utils/nfcHelper";

const ScanMember = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [scannedUid, setScannedUid] = useState("");
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form input transaksi
  const [beratKg, setBeratKg] = useState("");
  const [catatan, setCatatan] = useState("");
  const [rakPenyimpanan, setRakPenyimpanan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transaksiSuccess, setTransaksiSuccess] = useState(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Jika ada query param ?uid=... dari navigasi lain
  useEffect(() => {
    const uidFromUrl = searchParams.get("uid");
    if (uidFromUrl) {
      handleScan(uidFromUrl);
    }
  }, [searchParams]);

  const handleScan = async (uid) => {
    setScannedUid(uid);
    setMember(null);
    setErrorMsg("");
    setTransaksiSuccess(null);
    setBeratKg("");
    setLoading(true);

    try {
      const res = await memberApi.getByUid(uid);
      if (res.success && res.data) {
        setMember(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || `Member dengan UID [${uid}] tidak ditemukan`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async (query) => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await memberApi.getAll({ search: query, limit: 1 });
      if (res.success && res.data.members.length > 0) {
        const found = res.data.members[0];
        setMember(found);
        setScannedUid(found.uidKartu || "MANUAL");
      } else {
        setErrorMsg(`Tidak ditemukan member dengan kata kunci "${query}"`);
      }
    } catch (err) {
      setErrorMsg(err.message || "Pencarian gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleSimpanTransaksi = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const berat = parseFloat(beratKg);
    if (!berat || berat <= 0) {
      setErrorMsg("Berat cucian harus lebih dari 0 kg");
      return;
    }

    if (member && berat > member.sisaKuota) {
      setErrorMsg(
        `Sisa kuota hanya ${member.sisaKuota} kg. Kuota tidak mencukupi untuk ${berat} kg.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await transaksiApi.create({
        memberId: member.id,
        beratKg: berat,
        catatan,
        rakPenyimpanan: rakPenyimpanan || null,
      });

      if (res.success && res.data) {
        setTransaksiSuccess(res.data);
        // Refresh data member setelah transaksi
        const updatedRes = await memberApi.getById(member.id);
        if (updatedRes.success) {
          setMember(updatedRes.data);
        }
        setBeratKg("");
        setCatatan("");
        setRakPenyimpanan("");
      }
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  // Tombol cepat berat kg untuk layar sentuh
  const presetWeights = [1.0, 2.0, 3.5, 5.0, 7.0, 10.0];

  return (
    <div className="space-y-3 w-full">
      {/* Banner Header Compact E-Pesantren Style */}
      <div className="bg-[#0284c7] text-white rounded-lg p-3 sm:p-3.5 shadow-sm flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight leading-tight">
              Scan Kartu NFC & Input Cucian
            </h1>
            <p className="text-[11px] text-sky-100 leading-tight">
              Tap kartu member, masukkan timbangan berat cucian, kuota berkurang
              otomatis.
            </p>
          </div>
        </div>

        {member && (
          <button
            onClick={() => {
              setMember(null);
              setScannedUid("");
              setTransaksiSuccess(null);
            }}
            className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Scan Ulang
          </button>
        )}
      </div>

      {/* Komponen Scanner NFC */}
      {!member && (
        <NfcScanner
          onScan={handleScan}
          onManualSearch={handleManualSearch}
          title="Tempelkan Kartu NFC Member"
          placeholder="Dekatkan kartu ke USB NFC Reader atau ketik UID..."
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs font-semibold text-slate-600">
            Mencari data member di server...
          </p>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold">Peringatan Transaksi:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Hasil Transaksi Berhasil (Popup Nota) */}
      {transaksiSuccess && (
        <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-sm text-emerald-900 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-base font-bold text-emerald-800">
                Transaksi Laundry Berhasil Disimpan!
              </h4>
              <p className="text-xs text-emerald-700">
                Kuota member telah otomatis dikurangi dan dicatat ke sistem.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-slate-500 block">Berat Cucian</span>
              <strong className="text-base text-slate-800 font-extrabold">
                {parseFloat(transaksiSuccess.transaksi.beratKg).toFixed(2)} kg
              </strong>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-slate-500 block">Sisa Sebelumnya</span>
              <strong className="text-base text-slate-600 font-bold">
                {parseFloat(transaksiSuccess.transaksi.sisaSebelum).toFixed(2)}{" "}
                kg
              </strong>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-slate-500 block">Sisa Sekarang</span>
              <strong className="text-base text-emerald-600 font-extrabold">
                {transaksiSuccess.sisaKuotaBaru} kg
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* DATA MEMBER & FORM INPUT BERAT FULL WIDTH 100% */}
      {member && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full items-start">
          {/* Kolom Kiri: Visual Kartu Kuota + Info Member (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            <KartuKuota member={member} />

            {/* Riwayat Transaksi Member Terakhir (Tabel Compact) */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                  <History className="w-3.5 h-3.5 text-sky-600" />
                  Riwayat Laundry Member Ini
                </span>
                <span className="text-[10px] text-slate-400">5 Terakhir</span>
              </div>
              <div className="divide-y divide-slate-100 text-[11px]">
                {member.transaksi && member.transaksi.length > 0 ? (
                  member.transaksi.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">
                          {formatTanggalWaktu(t.createdAt)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {t.catatan || "Cucian rutin"} • Kasir:{" "}
                          {t.admin?.nama || "Admin"}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-rose-600 text-xs">
                          -{parseFloat(t.beratKg).toFixed(1)} kg
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Sisa: {parseFloat(t.sisaSesudah).toFixed(1)} kg
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-slate-400 text-xs">
                    Belum ada riwayat cucian untuk member ini
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Form Input Berat Cucian (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-100 text-sky-700 rounded-md">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      Input Berat Cucian Hari Ini
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Maksimal potong:{" "}
                      <strong className="text-sky-700">
                        {member.sisaKuota} kg
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Status Kartu
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Siap Digunakan
                  </span>
                </div>
              </div>

              {/* Info penyerahan cucian pertama */}
              {!member.tglMulai && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-md text-sky-800 text-xs flex items-center gap-2">
                  <span className="text-base">ℹ️</span>
                  <span>
                    <strong>Penyerahan Pakaian Pertama:</strong> Masa aktif 30 hari paket member ini akan otomatis mulai dihitung sejak transaksi penimbangan ini disimpan!
                  </span>
                </div>
              )}

              {/* Jika masa aktif kedaluwarsa atau kuota 0 */}
              {member.isExpired ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex items-center justify-between">
                  <span>
                    Masa aktif paket member telah berakhir. Silakan perpanjang
                    paket terlebih dahulu.
                  </span>
                  <button
                    onClick={() =>
                      navigate(`/members/${member.id}?tab=perpanjang`)
                    }
                    className="px-3 py-1 bg-amber-600 text-white font-bold rounded shadow-sm text-xs"
                  >
                    Perpanjang
                  </button>
                </div>
              ) : member.sisaKuota <= 0 ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-800 text-xs flex items-center justify-between">
                  <span>
                    Sisa kuota habis (0 kg). Silakan lakukan perpanjangan paket.
                  </span>
                  <button
                    onClick={() =>
                      navigate(`/members/${member.id}?tab=perpanjang`)
                    }
                    className="px-3 py-1 bg-rose-600 text-white font-bold rounded shadow-sm text-xs"
                  >
                    Perpanjang Paket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSimpanTransaksi} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Timbangan Berat Cucian (kg) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        max={member.sisaKuota}
                        required
                        autoFocus
                        value={beratKg}
                        onChange={(e) => setBeratKg(e.target.value)}
                        placeholder="0.0"
                        className="w-full text-2xl font-black px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 focus:border-sky-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
                      />
                      <span className="absolute right-3.5 top-3 text-sm font-bold text-slate-400">
                        kg
                      </span>
                    </div>

                    {/* Tombol Cepat Pilihan Berat */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        Pintasan:
                      </span>
                      {presetWeights.map((w) => (
                        <button
                          key={w}
                          type="button"
                          disabled={w > member.sisaKuota}
                          onClick={() => setBeratKg(w.toString())}
                          className={`px-2.5 py-1 text-xs font-bold rounded border transition ${
                            beratKg === w.toString()
                              ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                          }`}
                        >
                          {w} kg
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Posisi Rak / Lokasi (Opsional)
                      </label>
                      <input
                        type="text"
                        value={rakPenyimpanan}
                        onChange={(e) => setRakPenyimpanan(e.target.value)}
                        placeholder="Misal: Rak A-02, Gantungan 3"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Catatan Cucian / Keterangan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Misal: Sprei 1 pcs, kemeja putih"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      Perkiraan Sisa Kuota Nanti:
                    </span>
                    <strong className="text-sky-700 font-extrabold text-sm">
                      {beratKg && parseFloat(beratKg) > 0
                        ? Math.max(
                            0,
                            member.sisaKuota - parseFloat(beratKg),
                          ).toFixed(2)
                        : member.sisaKuota.toFixed(2)}{" "}
                      kg
                    </strong>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      submitting || !beratKg || parseFloat(beratKg) <= 0
                    }
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] disabled:bg-slate-300 text-white font-extrabold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    {submitting ? (
                      <span>Menyimpan Transaksi...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simpan Transaksi & Potong Kuota</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanMember;
