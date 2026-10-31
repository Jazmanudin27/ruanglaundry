import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Wifi,
  Scale,
  CheckCircle2,
  AlertCircle,
  History,
  RotateCcw,
  Printer,
  X,
  CreditCard,
  UserPlus,
  DollarSign,
  Tag,
  Check,
} from 'lucide-react';
import NfcScanner from '../../components/NfcScanner';
import KartuKuota from '../../components/KartuKuota';
import { memberApi, transaksiApi } from '../../api';
import { formatTanggalWaktu, formatRupiah } from '../../utils/nfcHelper';
import { useAuth } from '../../context/AuthContext';

const ScanMember = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mode: 'MEMBER' atau 'NON_MEMBER'
  const [modePelanggan, setModePelanggan] = useState('MEMBER');

  // --- STATE MEMBER ---
  const [scannedUid, setScannedUid] = useState('');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [beratKg, setBeratKg] = useState('');
  const [catatan, setCatatan] = useState('');
  const [rakPenyimpanan, setRakPenyimpanan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- STATE NON-MEMBER ---
  const [namaNonMember, setNamaNonMember] = useState('');
  const [noHpNonMember, setNoHpNonMember] = useState('');
  const [tarifPerKg, setTarifPerKg] = useState(7000);
  const [statusBayar, setStatusBayar] = useState('LUNAS');

  // --- RESULT TRANSAKSI ---
  const [transaksiSuccess, setTransaksiSuccess] = useState(null);

  useEffect(() => {
    const uidFromUrl = searchParams.get('uid');
    const memberIdFromUrl = searchParams.get('memberId');
    if (uidFromUrl) {
      setModePelanggan('MEMBER');
      handleScan(uidFromUrl);
    } else if (memberIdFromUrl) {
      setModePelanggan('MEMBER');
      handleLoadMemberById(memberIdFromUrl);
    }
  }, [searchParams]);

  const handleLoadMemberById = async (id) => {
    setMember(null);
    setErrorMsg('');
    setTransaksiSuccess(null);
    setBeratKg('');
    setLoading(true);

    try {
      const res = await memberApi.getById(id);
      if (res.success && res.data) {
        setMember(res.data);
        setScannedUid(res.data.uidKartu || 'MANUAL');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Member tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  // Scan RFID Member
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
        const fullRes = await memberApi.getById(found.id);
        if (fullRes.success && fullRes.data) {
          setMember(fullRes.data);
          setScannedUid(fullRes.data.uidKartu || 'MANUAL');
        } else {
          setMember(found);
          setScannedUid(found.uidKartu || 'MANUAL');
        }
      } else {
        setErrorMsg(`Tidak ditemukan member dengan kata kunci "${query}"`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Pencarian gagal');
    } finally {
      setLoading(false);
    }
  };

  // Simpan Transaksi Member
  const handleSimpanTransaksiMember = async (e) => {
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
        jenisPelanggan: 'MEMBER',
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
        // Langsung cetak otomatis faktur thermal tanpa modal
        setTimeout(() => {
          window.print();
        }, 300);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan transaksi member');
    } finally {
      setSubmitting(false);
    }
  };

  // Simpan Transaksi Non-Member
  const handleSimpanTransaksiNonMember = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const berat = parseFloat(beratKg);
    if (!berat || berat <= 0) {
      setErrorMsg('Berat cucian harus lebih dari 0 kg');
      return;
    }

    if (!namaNonMember.trim()) {
      setErrorMsg('Nama pelanggan non-member wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await transaksiApi.create({
        jenisPelanggan: 'NON_MEMBER',
        namaPelanggan: namaNonMember.trim(),
        noHpPelanggan: noHpNonMember.trim() || null,
        beratKg: berat,
        tarifPerKg: Number(tarifPerKg) || 7000,
        statusBayar,
        catatan,
        rakPenyimpanan: rakPenyimpanan || null,
      });

      if (res.success && res.data) {
        setTransaksiSuccess(res.data);
        setNamaNonMember('');
        setNoHpNonMember('');
        setBeratKg('');
        setCatatan('');
        setRakPenyimpanan('');
        // Langsung cetak otomatis faktur thermal tanpa modal
        setTimeout(() => {
          window.print();
        }, 300);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan transaksi non-member');
    } finally {
      setSubmitting(false);
    }
  };

  const presetWeights = [1.0, 2.0, 3.0, 3.5, 5.0, 7.0, 10.0];

  // Hitung total bayar non member
  const totalBiayaNonMember = beratKg && parseFloat(beratKg) > 0
    ? Math.round(parseFloat(beratKg) * (Number(tarifPerKg) || 7000))
    : 0;

  return (
    <div className="space-y-3.5 w-full">
      {/* 1. Header Strip Mobile */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold leading-tight">
              Input Timbangan Cucian
            </h1>
            <p className="text-[11px] text-sky-100 leading-tight">
              Basmalah Wash • RFID & Kiloan Reguler
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
            Ganti
          </button>
        )}
      </div>

      {/* 2. TAB PILIHAN: MEMBER RFID vs NON-MEMBER */}
      <div className="grid grid-cols-2 bg-slate-200/90 p-1 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => {
            setModePelanggan('MEMBER');
            setErrorMsg('');
          }}
          className={`py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
            modePelanggan === 'MEMBER'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Member RFID
        </button>

        <button
          type="button"
          onClick={() => {
            setModePelanggan('NON_MEMBER');
            setMember(null);
            setErrorMsg('');
          }}
          className={`py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
            modePelanggan === 'NON_MEMBER'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Non-Member (Kiloan)
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Perhatian:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* 3. NOTA TRANSAKSI BERHASIL + TOMBOL CETAK FAKTUR */}
      {transaksiSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-md text-emerald-950 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-emerald-800">
                  Transaksi Berhasil Dicatat!
                </h4>
                <p className="text-[11px] text-emerald-700">
                  {transaksiSuccess.isNonMember
                    ? 'Cucian non-member telah masuk antrian cuci.'
                    : 'Kuota member telah otomatis dikurangi.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTransaksiSuccess(null);
                setMember(null);
                setScannedUid('');
              }}
              className="text-slate-400 hover:text-slate-700 p-1"
              title="Tutup & Transaksi Baru"
            >
              <X className="w-4 h-4" />
            </button>
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
                {transaksiSuccess.isNonMember ? 'Total Biaya' : 'Sisa Kuota Baru'}
              </span>
              <strong className="text-sm font-black text-emerald-600">
                {transaksiSuccess.isNonMember
                  ? formatRupiah(transaksiSuccess.transaksi.totalBayar)
                  : `${transaksiSuccess.sisaKuotaBaru} kg`}
              </strong>
            </div>
          </div>

          {/* Tombol Cetak Ulang Faktur & Transaksi Baru */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Cetak Ulang Faktur</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTransaksiSuccess(null);
                setMember(null);
                setScannedUid('');
              }}
              className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          A. MODE MEMBER: SCANNER RFID & FORM POTONG KUOTA
          ======================================================== */}
      {modePelanggan === 'MEMBER' && (
        <div className="space-y-3">
          {/* Scanner NFC jika member belum di-tap */}
          {!member && (
            <NfcScanner
              onScan={handleScan}
              onManualSearch={handleManualSearch}
              placeholder="Tap kartu RFID atau ketik..."
              defaultMobileMode={true}
            />
          )}

          {/* Loading data member */}
          {loading && (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-sm">
              <div className="inline-block w-7 h-7 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                Mencari data member...
              </p>
            </div>
          )}

          {/* Jika Member Ditemukan */}
          {member && (
            <div className="space-y-3">
              <KartuKuota member={member} />

              <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-300 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900">
                        Input Berat Cucian Member
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Maksimal potong:{' '}
                        <strong className="text-sky-700">{member.sisaKuota} kg</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Member Aktif
                  </span>
                </div>

                {!member.tglMulai && (
                  <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-[11px] flex items-center gap-2">
                    <span className="text-base">ℹ️</span>
                    <span>
                      <strong>Penyerahan Pakaian Pertama:</strong> Masa aktif 30 hari paket akan otomatis tercatat aktif mulai hari ini!
                    </span>
                  </div>
                )}

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
                  <form onSubmit={handleSimpanTransaksiMember} className="space-y-3">
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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Posisi Rak (Opsional)
                        </label>
                        <input
                          type="text"
                          value={rakPenyimpanan}
                          onChange={(e) => setRakPenyimpanan(e.target.value)}
                          placeholder="Misal: Rak A-01"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Catatan
                        </label>
                        <input
                          type="text"
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          placeholder="Misal: Kemeja 2, Sarung 1"
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
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          B. MODE NON-MEMBER: FORM INPUT KILOAN REGULER
          ======================================================== */}
      {modePelanggan === 'NON_MEMBER' && (
        <form
          onSubmit={handleSimpanTransaksiNonMember}
          className="bg-white rounded-2xl p-4 shadow-md border border-slate-300 space-y-3.5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">
                  Input Cucian Non-Member (Kiloan)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pelanggan umum tanpa paket kartu RFID
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Reguler Kiloan
            </span>
          </div>

          {/* Nama & No WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Nama Pelanggan *
              </label>
              <input
                type="text"
                required
                value={namaNonMember}
                onChange={(e) => setNamaNonMember(e.target.value)}
                placeholder="Contoh: Pak Herman"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                No. WhatsApp / HP (Opsional)
              </label>
              <input
                type="tel"
                value={noHpNonMember}
                onChange={(e) => setNoHpNonMember(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Berat Cucian */}
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
                required
                value={beratKg}
                onChange={(e) => setBeratKg(e.target.value)}
                placeholder="0.0"
                className="w-full text-2xl font-black px-3.5 py-2.5 bg-slate-50 border-2 border-emerald-400 focus:border-emerald-600 rounded-xl focus:outline-none"
              />
              <span className="absolute right-3.5 top-3 text-sm font-bold text-slate-400">
                kg
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetWeights.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setBeratKg(w.toString())}
                  className={`px-2.5 py-1.5 text-xs font-extrabold rounded-xl border transition ${
                    beratKg === w.toString()
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {w} kg
                </button>
              ))}
            </div>
          </div>

          {/* Tarif per Kg & Status Bayar */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Tarif per Kg (Rp)
              </label>
              <input
                type="number"
                step="500"
                value={tarifPerKg}
                onChange={(e) => setTarifPerKg(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Status Pembayaran
              </label>
              <select
                value={statusBayar}
                onChange={(e) => setStatusBayar(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="LUNAS">✅ Lunas</option>
                <option value="BELUM_LUNAS">⏳ Belum Bayar</option>
              </select>
            </div>
          </div>

          {/* Posisi Rak & Catatan */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Posisi Rak
              </label>
              <input
                type="text"
                value={rakPenyimpanan}
                onChange={(e) => setRakPenyimpanan(e.target.value)}
                placeholder="Misal: Rak Non-01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Catatan
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Misal: Selimut tebal"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Rincian Total Bayar Box */}
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] text-emerald-800 font-bold block">
                Total Biaya Cucian:
              </span>
              <span className="text-[10px] text-emerald-600">
                {beratKg ? `${beratKg} kg × ${formatRupiah(tarifPerKg)}` : 'Masukkan berat kg'}
              </span>
            </div>
            <strong className="text-emerald-800 font-black text-base">
              {formatRupiah(totalBiayaNonMember)}
            </strong>
          </div>

          {/* Tombol Simpan Non-Member */}
          <button
            type="submit"
            disabled={submitting || !beratKg || parseFloat(beratKg) <= 0 || !namaNonMember.trim()}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {submitting
                ? 'Menyimpan Transaksi...'
                : `Simpan Transaksi (${formatRupiah(totalBiayaNonMember)})`}
            </span>
          </button>
        </form>
      )}

      {/* ========================================================
          AREA CETAK STRUK / FAKTUR THERMAL (58mm / 80mm)
          Disembunyikan di layar, otomatis dikirim ke printer saat window.print()
          ======================================================== */}
      {transaksiSuccess && (
        <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none print:opacity-100 print:pointer-events-auto print:static print:visible">
          <div
            id="printable-thermal-receipt"
            className="bg-white p-3.5 border border-dashed border-slate-300 rounded-xl font-mono text-[11px] text-slate-900 leading-tight space-y-2 select-text"
          >
            {/* Toko Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-300 space-y-0.5">
              <div className="font-black text-sm text-slate-950 uppercase tracking-wider">
                BASMALAH WASH
              </div>
              <div className="text-[10px] text-slate-500">
                Sistem Laundry Syariah & Modern
              </div>
              <div className="text-[9px] text-slate-400">
                {formatTanggalWaktu(transaksiSuccess.transaksi.createdAt)}
              </div>
            </div>

            {/* Metadata Pelanggan & Kasir */}
            <div className="space-y-1 text-[10px] py-1 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <strong className="text-slate-900 truncate max-w-[170px]">
                  {transaksiSuccess.isNonMember
                    ? transaksiSuccess.transaksi.namaPelanggan
                    : (member?.nama || transaksiSuccess.transaksi.member?.nama || 'Member')}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <strong className="text-slate-800">
                  {transaksiSuccess.isNonMember
                    ? 'Non-Member (Kiloan)'
                    : `Member (${member?.paket?.namaPaket || 'Paket'})`}
                </strong>
              </div>

              {transaksiSuccess.transaksi.rakPenyimpanan && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Posisi Rak:</span>
                  <strong className="text-slate-900">
                    {transaksiSuccess.transaksi.rakPenyimpanan}
                  </strong>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span className="text-slate-700">
                  {user?.nama || 'Admin Basmalah Wash'}
                </span>
              </div>
            </div>

            {/* Rincian Berat & Kuota / Biaya */}
            <div className="space-y-1 py-1.5 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-xs font-black">
                <span>Berat Cucian:</span>
                <span className="text-sky-700">
                  {parseFloat(transaksiSuccess.transaksi.beratKg).toFixed(2)} kg
                </span>
              </div>

              {/* Jika Member */}
              {!transaksiSuccess.isNonMember && (
                <>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Sisa Kuota Awal:</span>
                    <span>
                      {parseFloat(transaksiSuccess.transaksi.sisaSebelum).toFixed(2)} kg
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                    <span>Sisa Kuota Baru:</span>
                    <span>
                      {transaksiSuccess.sisaKuotaBaru} kg
                    </span>
                  </div>
                </>
              )}

              {/* Jika Non Member */}
              {transaksiSuccess.isNonMember && (
                <>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Tarif per Kg:</span>
                    <span>{formatRupiah(transaksiSuccess.transaksi.tarifPerKg || 7000)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-emerald-800 pt-0.5">
                    <span>TOTAL BAYAR:</span>
                    <span>{formatRupiah(transaksiSuccess.transaksi.totalBayar)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Status Pembayaran:</span>
                    <span className={transaksiSuccess.transaksi.statusBayar === 'LUNAS' ? 'text-emerald-700' : 'text-rose-600'}>
                      {transaksiSuccess.transaksi.statusBayar === 'LUNAS' ? 'LUNAS' : 'BELUM BAYAR'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Catatan jika ada */}
            {transaksiSuccess.transaksi.catatan && (
              <div className="text-[10px] text-slate-600 py-1 border-b border-dashed border-slate-300">
                <span className="text-slate-400">Catatan:</span>{' '}
                <span>{transaksiSuccess.transaksi.catatan}</span>
              </div>
            )}

            {/* Footer Struk */}
            <div className="text-center pt-1.5 text-[9px] text-slate-400 space-y-0.5">
              <div>* Simpan struk ini saat pengambilan *</div>
              <div>Terima kasih atas kepercayaan Anda! 🙏</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanMember;
