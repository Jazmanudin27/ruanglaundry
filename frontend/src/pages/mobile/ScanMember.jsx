import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Wifi,
  Scale,
  CheckCircle2,
  AlertCircle,
  History,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  Share2,
} from 'lucide-react';
import NfcScanner from '../../components/NfcScanner';
import KartuKuota from '../../components/KartuKuota';
import { memberApi, transaksiApi } from '../../api';
import { formatTanggalWaktu } from '../../utils/nfcHelper';

const ScanMember = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [scannedUid, setScannedUid] = useState('');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [beratKg, setBeratKg] = useState('');
  const [catatan, setCatatan] = useState('');
  const [rakPenyimpanan, setRakPenyimpanan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [transaksiSuccess, setTransaksiSuccess] = useState(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    const uidFromUrl = searchParams.get('uid');
    if (uidFromUrl) {
      handleScan(uidFromUrl);
    }
  }, [searchParams]);

  const handleScan = async (uid) => {
    setScannedUid(uid);
    setMember(null);
    setErrorMsg('');
    setTransaksiSuccess(null);
    setBeratKg('');
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
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await memberApi.getAll({ search: query, limit: 1 });
      if (res.success && res.data.members.length > 0) {
        const found = res.data.members[0];
        setMember(found);
        setScannedUid(found.uidKartu || 'MANUAL');
      } else {
        setErrorMsg(`Tidak ditemukan member dengan kata kunci "${query}"`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Pencarian gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleSimpanTransaksi = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const berat = parseFloat(beratKg);
    if (!berat || berat <= 0) {
      setErrorMsg('Berat cucian harus lebih dari 0 kg');
      return;
    }

    if (member && berat > member.sisaKuota) {
      setErrorMsg(
        `Sisa kuota hanya ${member.sisaKuota} kg. Kuota tidak cukup untuk ${berat} kg.`
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
        const updatedRes = await memberApi.getById(member.id);
        if (updatedRes.success) {
          setMember(updatedRes.data);
        }
        setBeratKg('');
        setCatatan('');
        setRakPenyimpanan('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setSubmitting(false);
    }
  };

  const presetWeights = [1.0, 2.0, 3.0, 3.5, 5.0, 7.0, 10.0];

  return (
    <div className="space-y-3 w-full">
      {/* Header Strip Mobile */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold leading-tight">
              Scan Kartu NFC & Timbang Cucian
            </h1>
            <p className="text-[11px] text-sky-100 leading-tight">
              Web NFC • USB Reader • Cari Nama
            </p>
          </div>
        </div>

        {member && (
          <button
            type="button"
            onClick={() => {
              setMember(null);
              setScannedUid('');
              setTransaksiSuccess(null);
            }}
            className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ulang
          </button>
        )}
      </div>

      {/* Scanner NFC / Manual */}
      {!member && (
        <NfcScanner
          onScan={handleScan}
          onManualSearch={handleManualSearch}
          placeholder="Ketik UID kartu..."
          defaultMobileMode={true}
        />
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
          <div className="inline-block w-7 h-7 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold text-slate-600">
            Mencari data member...
          </p>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Perhatian:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Nota Transaksi Berhasil */}
      {transaksiSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-md text-emerald-950 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-extrabold text-emerald-800">
                Transaksi Berhasil Dicatat!
              </h4>
              <p className="text-[11px] text-emerald-700">
                Kuota santri telah otomatis dikurangi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Berat Cucian
              </span>
              <strong className="text-sm font-black text-slate-800">
                {parseFloat(transaksiSuccess.transaksi.beratKg).toFixed(2)} kg
              </strong>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Sisa Kuota Baru
              </span>
              <strong className="text-sm font-black text-emerald-600">
                {transaksiSuccess.sisaKuotaBaru} kg
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Detail Kartu & Form Input Timbangan */}
      {member && (
        <div className="space-y-3">
          <KartuKuota member={member} />

          {/* Form Input Berat */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-300 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Input Timbangan Cucian
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Maksimal potong:{' '}
                    <strong className="text-sky-700">{member.sisaKuota} kg</strong>
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Siap Pakai
              </span>
            </div>

            {member.isExpired ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-2">
                <p>Masa aktif paket member sudah berakhir. Perpanjang paket dulu.</p>
                <button
                  type="button"
                  onClick={() => navigate(`/members/${member.id}?tab=perpanjang`)}
                  className="w-full py-2 bg-amber-600 text-white font-bold rounded-xl text-xs"
                >
                  Perpanjang Paket Sekarang
                </button>
              </div>
            ) : member.sisaKuota <= 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2">
                <p>Sisa kuota habis (0 kg). Silakan isi ulang paket member.</p>
                <button
                  type="button"
                  onClick={() => navigate(`/members/${member.id}?tab=perpanjang`)}
                  className="w-full py-2 bg-rose-600 text-white font-bold rounded-xl text-xs"
                >
                  Isi Ulang / Perpanjang Paket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSimpanTransaksi} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Berat Cucian (kg) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.1"
                      max={member.sisaKuota}
                      required
                      value={beratKg}
                      onChange={(e) => setBeratKg(e.target.value)}
                      placeholder="0.0"
                      className="w-full text-2xl font-black px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 focus:border-sky-500 rounded-xl focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-3 text-sm font-bold text-slate-400">
                      kg
                    </span>
                  </div>

                  {/* Preset Tombol Cepat */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {presetWeights.map((w) => (
                      <button
                        key={w}
                        type="button"
                        disabled={w > member.sisaKuota}
                        onClick={() => setBeratKg(w.toString())}
                        className={`px-2.5 py-1.5 text-xs font-extrabold rounded-xl border transition ${
                          beratKg === w.toString()
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 disabled:opacity-30'
                        }`}
                      >
                        {w} kg
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Lokasi Rak / Keranjang (Opsional)
                    </label>
                    <input
                      type="text"
                      value={rakPenyimpanan}
                      onChange={(e) => setRakPenyimpanan(e.target.value)}
                      placeholder="Contoh: Rak A-02"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Catatan Pakaian (Opsional)
                    </label>
                    <input
                      type="text"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Contoh: Bedcover 1, Kemeja putih"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Estimasi Sisa Kuota:
                  </span>
                  <strong className="text-sky-700 font-black text-sm">
                    {beratKg && parseFloat(beratKg) > 0
                      ? Math.max(0, member.sisaKuota - parseFloat(beratKg)).toFixed(2)
                      : member.sisaKuota.toFixed(2)}{' '}
                    kg
                  </strong>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !beratKg || parseFloat(beratKg) <= 0}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:scale-98 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Menyimpan Transaksi...'
                      : 'Simpan & Potong Kuota Member'}
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Riwayat Terakhir Member */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-300 overflow-hidden">
            <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-sky-600" />
                5 Transaksi Terakhir Member Ini
              </span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {member.transaksi && member.transaksi.length > 0 ? (
                member.transaksi.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {formatTanggalWaktu(t.createdAt)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {t.catatan || 'Cucian rutin'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-rose-600">
                        -{parseFloat(t.beratKg).toFixed(1)} kg
                      </span>
                      <div className="text-[10px] text-slate-400">
                        Sisa: {parseFloat(t.sisaSesudah).toFixed(1)} kg
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  Belum ada riwayat cucian
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanMember;

