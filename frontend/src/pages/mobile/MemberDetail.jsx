import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Scale,
  History,
  Wifi,
  AlertCircle,
  CheckCircle2,
  Package,
  CreditCard,
  Edit2,
  Share2,
} from 'lucide-react';
import { memberApi, paketApi } from '../../api';
import KartuKuota from '../../components/KartuKuota';
import ModalScanKartu from '../../components/ModalScanKartu';
import { formatTanggalWaktu, formatRupiah } from '../../utils/nfcHelper';
import showAlert from '../../utils/sweetalert';

const MemberDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [member, setMember] = useState(null);
  const [transaksiList, setTransaksiList] = useState([]);
  const [pakets, setPakets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'perpanjang' ? 'perpanjang' : 'riwayat'
  );

  const [selectedPaketId, setSelectedPaketId] = useState('');
  const [customHarga, setCustomHarga] = useState('');
  const [submittingPerpanjang, setSubmittingPerpanjang] = useState(false);
  const [successPerpanjangMsg, setSuccessPerpanjangMsg] = useState('');
  const [isModalGantiOpen, setIsModalGantiOpen] = useState(false);

  const fetchMemberData = async () => {
    setLoading(true);
    try {
      const [resMember, resTransaksi, resPaket] = await Promise.all([
        memberApi.getById(id),
        memberApi.getTransaksi(id),
        paketApi.getAll(false),
      ]);

      if (resMember.success) {
        setMember(resMember.data);
      }
      if (resTransaksi.success) {
        setTransaksiList(resTransaksi.data || []);
      }
      if (resPaket.success) {
        setPakets(resPaket.data || []);
        if (resPaket.data.length > 0) {
          setSelectedPaketId(resPaket.data[0].id);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengambil data member');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const handlePerpanjangSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessPerpanjangMsg('');
    setSubmittingPerpanjang(true);

    try {
      const cleanHarga = customHarga ? parseInt(customHarga.replace(/\D/g, ''), 10) : undefined;
      const res = await memberApi.perpanjang(id, {
        paketId: selectedPaketId,
        hargaDibayar: cleanHarga,
      });

      if (res.success) {
        showAlert.success('Berhasil!', 'Paket member berhasil diperpanjang');
        setSuccessPerpanjangMsg('Paket member berhasil diperpanjang!');
        fetchMemberData();
        setActiveTab('riwayat');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memperpanjang paket');
      showAlert.error('Gagal Perpanjang', err.message);
    } finally {
      setSubmittingPerpanjang(false);
    }
  };

  const handleCustomHargaChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setCustomHarga('');
      return;
    }
    const formatted = new Intl.NumberFormat('id-ID').format(rawVal);
    setCustomHarga(formatted);
  };

  const handleGantiKartu = async (uidBaru) => {
    try {
      await memberApi.gantiKartu(id, uidBaru);
      showAlert.success('Kartu Terhubung!', `Kartu member berhasil diganti ke UID: ${uidBaru}`);
      setIsModalGantiOpen(false);
      fetchMemberData();
    } catch (err) {
      showAlert.error('Gagal Mengganti Kartu', err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        <div className="inline-block w-7 h-7 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-semibold">Memuat profil member...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6 bg-white rounded-2xl text-center space-y-3 border border-slate-200">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Member Tidak Ditemukan</h3>
        <Link to="/members" className="text-xs text-sky-600 font-bold block">
          Kembali ke Daftar Member
        </Link>
      </div>
    );
  }

  const selectedPaketInfo = pakets.find((p) => p.id === selectedPaketId);

  return (
    <div className="space-y-3 w-full">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-300 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/members"
            className="p-2 bg-slate-100 rounded-xl text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 leading-tight">
              Detail Member
            </h1>
            <p className="text-[10px] text-slate-500">
              Kuota, kartu NFC & riwayat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsModalGantiOpen(true)}
            className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1"
          >
            <Wifi className="w-3.5 h-3.5 text-sky-600" />
            NFC
          </button>

          <Link
            to={`/members/${member.id}/edit`}
            className="p-2 bg-slate-100 text-slate-700 rounded-xl"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successPerpanjangMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successPerpanjangMsg}</span>
        </div>
      )}

      {/* Kartu Kuota Visual */}
      <KartuKuota member={member} />

      {/* Quick Actions */}
      <div>
        <Link
          to={member.uidKartu ? `/scan?uid=${member.uidKartu}` : `/scan?memberId=${member.id}`}
          className="w-full py-2.5 px-3 bg-sky-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Scale className="w-4 h-4" />
          <span>Catat Timbangan Cucian</span>
        </Link>
      </div>

      {/* Tabs Riwayat & Perpanjang */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden">
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'riwayat'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat ({transaksiList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('perpanjang')}
            className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'perpanjang'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Isi / Perpanjang</span>
          </button>
        </div>

        {activeTab === 'riwayat' ? (
          <div className="divide-y divide-slate-100">
            {transaksiList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada riwayat cucian.
              </div>
            ) : (
              transaksiList.map((t) => (
                <div
                  key={t.id}
                  className="p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">
                      {formatTanggalWaktu(t.createdAt)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {t.catatan || 'Cucian rutin'} • {t.admin?.nama || 'Kasir'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-rose-600">
                      -{parseFloat(t.beratKg).toFixed(2)} kg
                    </span>
                    <div className="text-[10px] text-emerald-600 font-bold">
                      Sisa: {parseFloat(t.sisaSesudah).toFixed(2)} kg
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <form onSubmit={handlePerpanjangSubmit} className="p-4 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Pilih Paket Isi Ulang *
              </label>
              <select
                required
                value={selectedPaketId}
                onChange={(e) => setSelectedPaketId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                {pakets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.namaPaket} — +{p.kuotaKg} kg, +{p.durasiHari} Hari ({formatRupiah(p.harga)})
                  </option>
                ))}
              </select>
            </div>

            {selectedPaketInfo && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-1 text-sky-900">
                <div className="flex justify-between font-bold">
                  <span>Tarif Paket:</span>
                  <strong className="text-sky-800">
                    {formatRupiah(selectedPaketInfo.harga)}
                  </strong>
                </div>
                <div className="text-[11px]">
                  Tambahan Kuota: <strong>+{selectedPaketInfo.kuotaKg} kg</strong> • Durasi: <strong>+{selectedPaketInfo.durasiHari} Hari</strong>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Nominal Dibayar (Opsional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-extrabold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customHarga}
                  onChange={handleCustomHargaChange}
                  placeholder={`Default: ${selectedPaketInfo ? new Intl.NumberFormat('id-ID').format(selectedPaketInfo.harga) : 0}`}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingPerpanjang}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {submittingPerpanjang
                  ? 'Memproses...'
                  : 'Simpan & Aktifkan Paket'}
              </span>
            </button>
          </form>
        )}
      </div>

      <ModalScanKartu
        isOpen={isModalGantiOpen}
        onClose={() => setIsModalGantiOpen(false)}
        onSelectUid={handleGantiKartu}
        currentUid={member.uidKartu}
      />
    </div>
  );
};

export default MemberDetail;

