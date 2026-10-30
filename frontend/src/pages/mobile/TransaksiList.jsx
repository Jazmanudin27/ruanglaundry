import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  RotateCw,
  Scale,
  Clock,
  CheckCircle2,
  X,
  ShoppingBag,
  Loader2,
  Sparkles,
  Share2,
  Copy,
  Check,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { transaksiApi } from '../../api';
import { formatTanggalWaktu } from '../../utils/nfcHelper';

const TransaksiList = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [ringkasan, setRingkasan] = useState({
    totalTransaksi: 0,
    totalKg: 0,
    rataRataKg: 0,
    memberUnik: 0,
    countByStatus: {
      ANTRIAN: 0,
      PROSES: 0,
      SIAP_AMBIL: 0,
      SELESAI: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatusCucian, setFilterStatusCucian] = useState('semua');
  const [filterPeriode, setFilterPeriode] = useState('semua');

  // Bottom sheet detail & update status
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('ANTRIAN');
  const [modalRak, setModalRak] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [copiedResi, setCopiedResi] = useState(false);

  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      let start = '';
      let end = '';
      const today = new Date();

      if (filterPeriode === 'hari-ini') {
        start = today.toISOString().split('T')[0];
        end = start;
      } else if (filterPeriode === '7-hari') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = d.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
      }

      const res = await transaksiApi.getAll({
        search,
        statusCucian: filterStatusCucian !== 'semua' ? filterStatusCucian : '',
        startDate: start,
        endDate: end,
        limit: 100,
      });

      if (res.success) {
        setTransaksi(res.data.items || []);
        if (res.data.ringkasan) {
          setRingkasan(res.data.ringkasan);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil transaksi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaksi();
  }, [filterStatusCucian, filterPeriode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransaksi();
  };

  const handleUpdateStatus = async (transaksiId, newStatus, rakVal = null) => {
    try {
      const payload = { statusCucian: newStatus };
      if (rakVal !== null) {
        payload.rakPenyimpanan = rakVal;
      }
      const res = await transaksiApi.updateStatus(transaksiId, payload);
      if (res.success) {
        setTransaksi((prev) =>
          prev.map((item) => (item.id === transaksiId ? res.data : item))
        );
        if (selectedTransaksi && selectedTransaksi.id === transaksiId) {
          setSelectedTransaksi(res.data);
          setModalStatus(res.data.statusCucian);
          setModalRak(res.data.rakPenyimpanan || '');
        }
      }
    } catch (err) {
      alert(err.message || 'Gagal mengubah status cucian');
    }
  };

  const handleSimpanStatusModal = async () => {
    if (!selectedTransaksi) return;
    setSavingStatus(true);
    try {
      await handleUpdateStatus(selectedTransaksi.id, modalStatus, modalRak);
      setIsDetailModalOpen(false);
    } finally {
      setSavingStatus(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'ANTRIAN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" /> Antrian
          </span>
        );
      case 'PROSES':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
            <Sparkles className="w-3 h-3" /> Dicuci & Setrika
          </span>
        );
      case 'SIAP_AMBIL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShoppingBag className="w-3 h-3" /> Siap Diambil
          </span>
        );
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-3 h-3" /> Selesai
          </span>
        );
      default:
        return <span className="text-[10px] font-bold">{status}</span>;
    }
  };

  const getNextStatusAction = (t) => {
    if (t.statusCucian === 'ANTRIAN') {
      return { label: 'Mulai Cuci', next: 'PROSES', cls: 'bg-sky-600 text-white' };
    }
    if (t.statusCucian === 'PROSES') {
      return {
        label: 'Siap Ambil',
        next: 'SIAP_AMBIL',
        cls: 'bg-emerald-600 text-white',
      };
    }
    if (t.statusCucian === 'SIAP_AMBIL') {
      return {
        label: 'Serahkan / Selesai',
        next: 'SELESAI',
        cls: 'bg-slate-800 text-white',
      };
    }
    return null;
  };

  const statusTabs = [
    { key: 'semua', label: 'Semua', count: ringkasan.totalTransaksi },
    {
      key: 'ANTRIAN',
      label: 'Antrian',
      count: ringkasan.countByStatus?.ANTRIAN || 0,
    },
    {
      key: 'PROSES',
      label: 'Dicuci',
      count: ringkasan.countByStatus?.PROSES || 0,
    },
    {
      key: 'SIAP_AMBIL',
      label: 'Siap Ambil',
      count: ringkasan.countByStatus?.SIAP_AMBIL || 0,
    },
    {
      key: 'SELESAI',
      label: 'Selesai',
      count: ringkasan.countByStatus?.SELESAI || 0,
    },
  ];

  return (
    <div className="space-y-3 w-full">
      {/* 1. Ringkasan Mini */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-sky-600 to-sky-700 text-white rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-sky-100 uppercase block">
              Total Transaksi
            </span>
            <span className="text-lg font-black">{ringkasan.totalTransaksi}</span>
          </div>
          <History className="w-5 h-5 text-sky-200" />
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-100 uppercase block">
              Total Berat
            </span>
            <span className="text-lg font-black">{ringkasan.totalKg} kg</span>
          </div>
          <Scale className="w-5 h-5 text-emerald-200" />
        </div>
      </div>

      {/* 2. Search & Periode */}
      <div className="bg-white rounded-xl p-2.5 border border-slate-300 shadow-md space-y-2">
        <form onSubmit={handleSearchSubmit} className="flex gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama member, kode resi, catatan..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            type="button"
            onClick={fetchTransaksi}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </form>

        {/* Filter Periode */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {[
            { k: 'semua', l: 'Semua Waktu' },
            { k: 'hari-ini', l: 'Hari Ini' },
            { k: '7-hari', l: '7 Hari Terakhir' },
          ].map((p) => (
            <button
              key={p.k}
              type="button"
              onClick={() => setFilterPeriode(p.k)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filterPeriode === p.k
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Horizontal Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterStatusCucian(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition shrink-0 ${
              filterStatusCucian === tab.key
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatusCucian === tab.key
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 4. Daftar Kartu Cucian Mobile */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-500 border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            Memuat daftar cucian...
          </div>
        ) : transaksi.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
            Tidak ada data cucian yang sesuai filter.
          </div>
        ) : (
          transaksi.map((t) => {
            const nextAction = getNextStatusAction(t);
            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-300 shadow-md space-y-2.5"
              >
                {/* Baris Atas: Nama & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-900">
                        {t.member?.nama || 'Member'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatTanggalWaktu(t.createdAt)}
                    </div>
                  </div>
                  {renderStatusBadge(t.statusCucian)}
                </div>

                {/* Baris Tengah: Info Berat, Sisa Kuota & Rak */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">
                      Berat Cucian
                    </span>
                    <strong className="text-xs font-black text-rose-600">
                      -{parseFloat(t.beratKg).toFixed(2)} kg
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">
                      Sisa Kuota
                    </span>
                    <strong className="text-xs font-black text-emerald-600">
                      {parseFloat(t.sisaSesudah).toFixed(2)} kg
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">
                      Posisi Rak
                    </span>
                    <strong className="text-xs font-bold text-slate-700 truncate block">
                      {t.rakPenyimpanan || '-'}
                    </strong>
                  </div>
                </div>

                {t.catatan && (
                  <div className="text-[11px] text-slate-600 bg-amber-50/60 px-2.5 py-1.5 rounded-lg border border-amber-200/60">
                    Catatan: <strong>{t.catatan}</strong>
                  </div>
                )}

                {/* Baris Bawah: Tombol Cepat Update Status & Atur Rak */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTransaksi(t);
                      setModalStatus(t.statusCucian || 'ANTRIAN');
                      setModalRak(t.rakPenyimpanan || '');
                      setIsDetailModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition"
                  >
                    Atur Status & Rak
                  </button>

                  {nextAction && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(t.id, nextAction.next)}
                      className={`px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 shadow-xs active:scale-95 transition ${nextAction.cls}`}
                    >
                      <span>{nextAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Bottom Sheet Detail & Update Status / Rak / Kirim WA */}
      {isDetailModalOpen && selectedTransaksi && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-2xl p-4 space-y-3.5 shadow-2xl border-t border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Update Status & Rak Cucian
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedTransaksi.member?.nama}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Pilih Status Cucian
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { k: 'ANTRIAN', l: '⏳ Antrian' },
                    { k: 'PROSES', l: '🌀 Dicuci & Setrika' },
                    { k: 'SIAP_AMBIL', l: '✨ Siap Diambil' },
                    { k: 'SELESAI', l: '✅ Sudah Diambil' },
                  ].map((st) => (
                    <button
                      key={st.k}
                      type="button"
                      onClick={() => setModalStatus(st.k)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-left transition ${
                        modalStatus === st.k
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {st.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Lokasi Rak Penyimpanan
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={modalRak}
                    onChange={(e) => setModalRak(e.target.value)}
                    placeholder="Contoh: Rak B-04"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={savingStatus}
                onClick={handleSimpanStatusModal}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold shadow-md transition"
              >
                {savingStatus ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaksiList;

