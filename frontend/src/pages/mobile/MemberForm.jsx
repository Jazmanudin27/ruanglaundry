import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Users,
  Wifi,
  ArrowLeft,
  Save,
  AlertCircle,
} from 'lucide-react';
import { memberApi, paketApi } from '../../api';
import ModalScanKartu from '../../components/ModalScanKartu';
import { formatRupiah } from '../../utils/nfcHelper';

const MemberForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [uidKartu, setUidKartu] = useState('');
  const [paketId, setPaketId] = useState('');
  const [status, setStatus] = useState('AKTIF');

  const [pakets, setPakets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalScanOpen, setIsModalScanOpen] = useState(false);

  useEffect(() => {
    paketApi.getAll(false).then((res) => {
      if (res.success && res.data.length > 0) {
        setPakets(res.data);
        if (!isEdit) {
          setPaketId(res.data[0].id);
        }
      }
    });

    if (isEdit) {
      setLoading(true);
      memberApi
        .getById(id)
        .then((res) => {
          if (res.success) {
            const m = res.data;
            setNama(m.nama);
            setNoHp(m.noHp);
            setUidKartu(m.uidKartu || '');
            setPaketId(m.paketId);
            setStatus(m.status);
          }
        })
        .catch((err) => {
          setErrorMsg(err.message || 'Gagal mengambil data member');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isEdit) {
        await memberApi.update(id, {
          nama,
          noHp,
          uidKartu: uidKartu || null,
          status,
        });
        alert('Data member berhasil diperbarui!');
      } else {
        await memberApi.create({
          nama,
          noHp,
          uidKartu: uidKartu || null,
          paketId,
        });
        alert('Member baru berhasil didaftarkan!');
      }
      navigate('/members');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const selectedPaket = pakets.find((p) => p.id === paketId);

  return (
    <div className="space-y-3 w-full">
      {/* Header */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-300 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            to="/members"
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900">
              {isEdit ? 'Ubah Data Member' : 'Daftar Member Baru'}
            </h1>
            <p className="text-[11px] text-slate-500">
              Isi identitas & hubungkan kartu NFC
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preview Kartu Mini */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-4 shadow-md border border-slate-700/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
            {uidKartu ? `NFC: ${uidKartu}` : 'TANPA KARTU FISIK'}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
            {status}
          </span>
        </div>
        <h3 className="text-base font-black text-white truncate">
          {nama || 'Nama Pelanggan'}
        </h3>
        <p className="text-xs text-slate-400">{noHp || '08xxxxxxxxxx'}</p>
      </div>

      {/* Form Input */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-4 shadow-md border border-slate-300 space-y-3.5"
      >
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Nama Lengkap Pelanggan *
          </label>
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Dewi Lestari"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Nomor WhatsApp / HP *
          </label>
          <input
            type="tel"
            inputMode="tel"
            required
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            placeholder="Contoh: 087811223344"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            UID Kartu NFC (Opsional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={uidKartu}
              onChange={(e) => setUidKartu(e.target.value.toUpperCase())}
              placeholder="Tap NFC HP / ketik UID..."
              className="flex-1 px-3.5 py-2.5 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={() => setIsModalScanOpen(true)}
              className="px-3.5 py-2.5 bg-sky-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shrink-0"
            >
              <Wifi className="w-3.5 h-3.5" />
              Scan HP
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Bisa dikosongkan jika kartu NFC fisik belum tersedia saat pendaftaran.
          </p>
        </div>

        {!isEdit && (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Pilih Paket Laundry Awal *
            </label>
            <select
              required
              value={paketId}
              onChange={(e) => setPaketId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {pakets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaPaket} — {p.kuotaKg} kg / {p.durasiHari} Hari ({formatRupiah(p.harga)})
                </option>
              ))}
            </select>

            {selectedPaket && (
              <div className="mt-2 p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-center justify-between">
                <span>
                  Kuota: <strong>{selectedPaket.kuotaKg} kg</strong> ({selectedPaket.durasiHari} hari)
                </span>
                <strong className="text-sky-800 font-black">
                  {formatRupiah(selectedPaket.harga)}
                </strong>
              </div>
            )}
          </div>
        )}

        {isEdit && (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Status Member
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="AKTIF">AKTIF</option>
              <option value="NONAKTIF">NONAKTIF</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
        >
          <Save className="w-4 h-4" />
          <span>
            {loading
              ? 'Menyimpan...'
              : isEdit
              ? 'Simpan Perubahan'
              : 'Daftarkan Member'}
          </span>
        </button>
      </form>

      <ModalScanKartu
        isOpen={isModalScanOpen}
        onClose={() => setIsModalScanOpen(false)}
        onSelectUid={(uid) => setUidKartu(uid)}
        currentUid={uidKartu}
      />
    </div>
  );
};

export default MemberForm;

