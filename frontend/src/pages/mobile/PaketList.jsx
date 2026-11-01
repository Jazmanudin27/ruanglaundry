import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  RotateCw,
  AlertCircle,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { paketApi } from '../../api';
import { formatRupiah } from '../../utils/nfcHelper';
import showAlert from '../../utils/sweetalert';

const PaketList = () => {
  const [pakets, setPakets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPaketId, setEditPaketId] = useState(null);
  const [formData, setFormData] = useState({
    namaPaket: '',
    kuotaKg: '',
    durasiHari: '',
    harga: '',
    aktif: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPakets = async () => {
    setLoading(true);
    try {
      const res = await paketApi.getAll(true);
      if (res.success) {
        setPakets(res.data || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat paket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPakets();
  }, []);

  const handleOpenAdd = () => {
    setEditPaketId(null);
    setFormData({
      namaPaket: '',
      kuotaKg: '',
      durasiHari: '',
      harga: '',
      aktif: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditPaketId(p.id);
    setFormData({
      namaPaket: p.namaPaket,
      kuotaKg: p.kuotaKg.toString(),
      durasiHari: p.durasiHari.toString(),
      harga: p.harga.toString(),
      aktif: p.aktif,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        namaPaket: formData.namaPaket,
        kuotaKg: parseFloat(formData.kuotaKg),
        durasiHari: parseInt(formData.durasiHari),
        harga: parseInt(formData.harga),
        aktif: formData.aktif,
      };

      if (editPaketId) {
        await paketApi.update(editPaketId, payload);
        showAlert.success('Paket Diperbarui');
      } else {
        await paketApi.create(payload);
        showAlert.success('Paket Dibuat');
      }

      setIsModalOpen(false);
      fetchPakets();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan paket');
      showAlert.error('Gagal Menyimpan', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    const yakin = await showAlert.confirm('Hapus Paket?', `Hapus / nonaktifkan paket "${nama}"?`, 'Ya, Hapus');
    if (yakin) {
      try {
        await paketApi.delete(id);
        showAlert.success('Paket Dihapus');
        fetchPakets();
      } catch (err) {
        showAlert.error('Gagal Menghapus', err.message);
      }
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* Header */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-300 shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-sm font-extrabold text-slate-900">
            Master Paket Laundry
          </h1>
          <p className="text-[11px] text-slate-500">
            Atur kuota kg, masa aktif & harga
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={fetchPakets}
            className="p-2 bg-slate-100 rounded-xl text-slate-700"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Paket</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Daftar Paket */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-500 border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            Memuat daftar paket...
          </div>
        ) : pakets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
            Belum ada paket laundry.
          </div>
        ) : (
          pakets.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-300 shadow-md flex items-center justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900">
                    {p.namaPaket}
                  </span>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      p.aktif
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {p.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <strong className="text-sky-700">{p.kuotaKg} kg</strong>
                  <span>•</span>
                  <span>{p.durasiHari} Hari</span>
                  <span>•</span>
                  <strong className="text-slate-900">
                    {formatRupiah(p.harga)}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(p)}
                  className="p-2 bg-slate-100 text-slate-700 rounded-xl"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.namaPaket)}
                  className="p-2 bg-rose-50 text-rose-600 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah / Edit Paket */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-2xl p-4 space-y-3.5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editPaketId ? 'Edit Paket Laundry' : 'Tambah Paket Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nama Paket *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaPaket}
                  onChange={(e) =>
                    setFormData({ ...formData, namaPaket: e.target.value })
                  }
                  placeholder="Contoh: Paket Keluarga 30 Kg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Kuota (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.kuotaKg}
                    onChange={(e) =>
                      setFormData({ ...formData, kuotaKg: e.target.value })
                    }
                    placeholder="30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Masa Aktif (Hari) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.durasiHari}
                    onChange={(e) =>
                      setFormData({ ...formData, durasiHari: e.target.value })
                    }
                    placeholder="30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Harga Paket (Rp) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.harga}
                  onChange={(e) =>
                    setFormData({ ...formData, harga: e.target.value })
                  }
                  placeholder="180000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              {editPaketId && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="aktifMobile"
                    checked={formData.aktif}
                    onChange={(e) =>
                      setFormData({ ...formData, aktif: e.target.checked })
                    }
                  />
                  <label htmlFor="aktifMobile" className="text-xs font-bold text-slate-700">
                    Paket Aktif
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-sky-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan...' : 'Simpan Paket'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaketList;

