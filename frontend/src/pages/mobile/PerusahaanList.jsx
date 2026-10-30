import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  RotateCw,
  Search,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  X,
  Loader2,
} from 'lucide-react';
import { perusahaanApi } from '../../api';
import { formatTanggal, formatRupiah } from '../../utils/nfcHelper';

const PerusahaanList = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    namaPerusahaan: '',
    kodePerusahaan: '',
    namaOwner: '',
    noHpOwner: '',
    alamat: '',
    tarifBulanan: '200000',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPerusahaan = async () => {
    setLoading(true);
    try {
      const res = await perusahaanApi.getAll();
      if (res.success) {
        setList(res.data || []);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar perusahaan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const handlePerpanjangLisensi = async (p) => {
    if (
      window.confirm(
        `Perpanjang lisensi SaaS +30 hari untuk "${p.namaPerusahaan}"?`
      )
    ) {
      try {
        const res = await perusahaanApi.perpanjangLangganan(p.id, {
          tambahanHari: 30,
        });
        alert(res.message || 'Langganan berhasil diperpanjang!');
        fetchPerusahaan();
      } catch (err) {
        alert(err.message || 'Gagal memperpanjang langganan');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await perusahaanApi.create({
        ...formData,
        tarifBulanan: parseInt(formData.tarifBulanan),
      });
      alert('Outlet baru berhasil didaftarkan!');
      setIsModalOpen(false);
      setFormData({
        namaPerusahaan: '',
        kodePerusahaan: '',
        namaOwner: '',
        noHpOwner: '',
        alamat: '',
        tarifBulanan: '200000',
      });
      fetchPerusahaan();
    } catch (err) {
      alert(err.message || 'Gagal mendaftarkan perusahaan');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = list.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.namaPerusahaan.toLowerCase().includes(q) ||
      p.kodePerusahaan.toLowerCase().includes(q) ||
      p.namaOwner.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3 w-full">
      <div className="bg-white rounded-2xl p-3.5 border border-slate-300 shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-sm font-extrabold text-slate-900">
            Kelola Outlet (SaaS)
          </h1>
          <p className="text-[11px] text-slate-500">
            Total {list.length} outlet terdaftar
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={fetchPerusahaan}
            className="p-2 bg-slate-100 rounded-xl text-slate-700"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Outlet</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama outlet, kode, owner..."
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs shadow-xs"
        />
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-500 border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            Memuat daftar outlet...
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-300 shadow-md space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block">
                    {p.namaPerusahaan}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Owner: {p.namaOwner} • {p.noHpOwner}
                  </span>
                </div>
                {p.isExpired ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Expired
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Aktif
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span>
                  s/d <strong>{formatTanggal(p.tglBerakhirLangganan)}</strong>
                </span>
                <strong className="text-sky-700">
                  {formatRupiah(p.tarifBulanan)}/bln
                </strong>
              </div>

              <button
                type="button"
                onClick={() => handlePerpanjangLisensi(p)}
                className="w-full py-2 bg-sky-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Perpanjang Lisensi (+30 Hari)
              </button>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-2xl p-4 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Daftarkan Outlet Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
              <input
                type="text"
                required
                placeholder="Nama Outlet / Perusahaan *"
                value={formData.namaPerusahaan}
                onChange={(e) =>
                  setFormData({ ...formData, namaPerusahaan: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                required
                placeholder="Kode Unik Outlet (misal: RL-02) *"
                value={formData.kodePerusahaan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kodePerusahaan: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
              <input
                type="text"
                required
                placeholder="Nama Owner *"
                value={formData.namaOwner}
                onChange={(e) =>
                  setFormData({ ...formData, namaOwner: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
              <input
                type="tel"
                required
                placeholder="No WhatsApp Owner *"
                value={formData.noHpOwner}
                onChange={(e) =>
                  setFormData({ ...formData, noHpOwner: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-sky-600 text-white rounded-xl font-extrabold"
              >
                {submitting ? 'Menyimpan...' : 'Daftarkan Outlet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerusahaanList;

