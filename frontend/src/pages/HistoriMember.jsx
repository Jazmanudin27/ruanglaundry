import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  History,
  Scale,
  Wifi,
  Package,
  Printer,
  Edit2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { memberApi, paketApi } from '../api';
import KartuKuota from '../components/KartuKuota';
import ModalScanKartu from '../components/ModalScanKartu';
import ThermalReceipt from '../components/ThermalReceipt';
import { formatTanggalWaktu, formatRupiah } from '../utils/nfcHelper';
import showAlert from '../utils/sweetalert';

export default function HistoriMember() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(searchParams.get('memberId') || '');
  const [selectedMember, setSelectedMember] = useState(null);
  const [transaksiList, setTransaksiList] = useState([]);
  const [pakets, setPakets] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successPerpanjangMsg, setSuccessPerpanjangMsg] = useState('');

  // Tab aktif: 'riwayat' atau 'perpanjang'
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'perpanjang' ? 'perpanjang' : 'riwayat'
  );

  // Form Perpanjang Paket
  const [selectedPaketId, setSelectedPaketId] = useState('');
  const [customHarga, setCustomHarga] = useState('');
  const [submittingPerpanjang, setSubmittingPerpanjang] = useState(false);

  // Modal Ganti Kartu NFC
  const [isModalGantiOpen, setIsModalGantiOpen] = useState(false);

  // Thermal print state
  const [printTransaksi, setPrintTransaksi] = useState(null);

  // 1. Ambil daftar member dan paket
  useEffect(() => {
    const initData = async () => {
      setLoadingMembers(true);
      try {
        const [resMembers, resPaket] = await Promise.all([
          memberApi.getAll({ limit: 200 }),
          paketApi.getAll(false),
        ]);

        if (resMembers.success && resMembers.data) {
          const list = resMembers.data.members || [];
          setMembers(list);

          const paramId = searchParams.get('memberId');
          if (paramId) {
            setSelectedMemberId(paramId);
          } else if (list.length > 0 && !selectedMemberId) {
            setSelectedMemberId(list[0].id);
          }
        }

        if (resPaket.success) {
          setPakets(resPaket.data || []);
          if (resPaket.data && resPaket.data.length > 0) {
            setSelectedPaketId(resPaket.data[0].id);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data awal:', err);
      } finally {
        setLoadingMembers(false);
      }
    };

    initData();
  }, []);

  // 2. Ambil data member yang dipilih
  const fetchMemberDetail = async (id) => {
    if (!id) {
      setSelectedMember(null);
      setTransaksiList([]);
      return;
    }

    setLoadingDetail(true);
    setErrorMsg('');
    try {
      const [resMember, resTransaksi] = await Promise.all([
        memberApi.getById(id),
        memberApi.getTransaksi(id),
      ]);

      if (resMember.success) {
        setSelectedMember(resMember.data);
      }
      if (resTransaksi.success) {
        setTransaksiList(resTransaksi.data || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat detail member');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedMemberId) {
      fetchMemberDetail(selectedMemberId);
    }
  }, [selectedMemberId]);

  const handleSelectMember = (id) => {
    setSelectedMemberId(id);
    setSearchParams(id ? { memberId: id } : {});
  };

  const handlePerpanjangSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setErrorMsg('');
    setSuccessPerpanjangMsg('');
    setSubmittingPerpanjang(true);

    try {
      const res = await memberApi.perpanjang(selectedMember.id, {
        paketId: selectedPaketId,
        hargaDibayar: customHarga ? parseInt(customHarga) : undefined,
      });

      if (res.success) {
        showAlert.success('Berhasil!', 'Paket member berhasil diperpanjang');
        setSuccessPerpanjangMsg('Paket member berhasil diperpanjang!');
        fetchMemberDetail(selectedMember.id);
        setActiveTab('riwayat');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memperpanjang paket');
      showAlert.error('Gagal Perpanjang', err.message);
    } finally {
      setSubmittingPerpanjang(false);
    }
  };

  const handleGantiKartu = async (uidBaru) => {
    if (!selectedMember) return;
    try {
      await memberApi.gantiKartu(selectedMember.id, uidBaru);
      showAlert.success('Kartu Terhubung!', `Kartu member berhasil diganti ke UID: ${uidBaru}`);
      setIsModalGantiOpen(false);
      fetchMemberDetail(selectedMember.id);
    } catch (err) {
      showAlert.error('Gagal Mengganti Kartu', err.message);
    }
  };

  const handlePrint = (transaksiItem) => {
    setPrintTransaksi(transaksiItem);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const selectedPaketInfo = pakets.find((p) => p.id === selectedPaketId);

  return (
    <div className="space-y-3 w-full">
      {/* 1. TOP BAR DENGAN SELECTOR MEMBER PERSIS GAYA DETAIL MEMBER */}
      <div className="bg-[#0284c7] text-white rounded-lg p-3 sm:p-3.5 shadow-sm flex items-center justify-between flex-wrap gap-2.5 w-full">
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
          <div className="p-1.5 bg-white/10 rounded-md text-white">
            <History className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight leading-tight">
              Histori Pemakaian Member
            </h1>
            <p className="text-[11px] text-sky-100 font-medium leading-tight">
              Pilih member untuk lihat kuota aktif & riwayat transaksi cucian
            </p>
          </div>
        </div>

        {/* Dropdown Select Member */}
        <div className="w-full sm:w-auto min-w-[260px]">
          <select
            value={selectedMemberId}
            onChange={(e) => handleSelectMember(e.target.value)}
            disabled={loadingMembers}
            className="w-full bg-white text-slate-800 font-bold text-xs rounded-lg px-3 py-2 shadow-sm border-0 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <option value="">-- Pilih Member Laundry --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} — Sisa: {parseFloat(m.sisaKuota || 0).toFixed(1)} kg ({m.paket?.namaPaket || 'Paket'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successPerpanjangMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successPerpanjangMsg}</span>
        </div>
      )}

      {loadingDetail ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold">Memuat profil & riwayat member...</p>
        </div>
      ) : !selectedMember ? (
        <div className="p-8 bg-white rounded-2xl text-center space-y-3 border border-slate-200">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Silakan Pilih Member</h3>
          <p className="text-xs text-slate-500">
            Pilih nama member dari dropdown di atas untuk melihat kartu kuota dan riwayat cucian.
          </p>
        </div>
      ) : (
        /* Grid 2 Kolom Layout Persis MemberDetail */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full items-start">
          {/* Kolom Kiri: Kartu Kuota & Ringkasan Info (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Visual Kartu Kuota RFID Holografik */}
            <KartuKuota member={selectedMember} />

            {/* Tombol Aksi Cepat */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={
                  selectedMember.uidKartu
                    ? `/scan?uid=${selectedMember.uidKartu}`
                    : `/scan?memberId=${selectedMember.id}`
                }
                className="py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Catat Laundry</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsModalGantiOpen(true)}
                className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Wifi className="w-3.5 h-3.5 text-sky-600" />
                <span>Ganti Kartu</span>
              </button>
            </div>

            {/* Identitas Pemegang Kartu */}
            <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-sm space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Identitas Pemegang Kartu
                </span>
                <Link
                  to={`/members/${selectedMember.id}`}
                  className="text-[11px] text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                >
                  <span>Detail Penuh</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nama Pelanggan:</span>
                <strong className="text-slate-800">{selectedMember.nama}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">No WhatsApp:</span>
                <span className="font-semibold text-sky-700">{selectedMember.noHp || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nomor NFC UID:</span>
                <span className="font-mono text-[11px] font-bold text-slate-700">
                  {selectedMember.uidKartu || 'Tanpa Kartu Fisik'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Paket Terdaftar:</span>
                <span className="font-bold text-slate-800">
                  {selectedMember.paket?.namaPaket || 'Paket Reguler'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status Langganan:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedMember.status === 'AKTIF'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedMember.status}
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Tab Riwayat & Perpanjang (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('riwayat')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === 'riwayat'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Riwayat Transaksi Cucian ({transaksiList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('perpanjang')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === 'perpanjang'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Perpanjang / Isi Kuota</span>
              </button>
            </div>

            {/* Konten Tab Riwayat */}
            {activeTab === 'riwayat' ? (
              <div className="divide-y divide-slate-100">
                {transaksiList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>Belum ada riwayat transaksi cucian.</p>
                  </div>
                ) : (
                  transaksiList.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {formatTanggalWaktu(t.createdAt)}
                          </span>
                          {t.rakPenyimpanan && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Rak: {t.rakPenyimpanan}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.catatan || 'Cucian rutin'} • {t.admin?.nama || 'Kasir'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-extrabold text-rose-600 text-sm block">
                            -{parseFloat(t.beratKg).toFixed(2)} kg
                          </span>
                          <div className="text-[10px] text-emerald-600 font-bold">
                            Sisa: {parseFloat(t.sisaSesudah).toFixed(2)} kg
                          </div>
                        </div>

                        {/* Tombol Cetak Faktur Thermal 58mm */}
                        <button
                          type="button"
                          onClick={() => handlePrint(t)}
                          title="Cetak Faktur Thermal Basmalah Wash"
                          className="p-2 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 rounded-lg border border-slate-200 transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-700" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Konten Tab Perpanjang */
              <form onSubmit={handlePerpanjangSubmit} className="p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Pilih Paket Isi Ulang *
                  </label>
                  <select
                    required
                    value={selectedPaketId}
                    onChange={(e) => setSelectedPaketId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {pakets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.namaPaket} — +{p.kuotaKg} kg, +{p.durasiHari} Hari ({formatRupiah(p.harga)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPaketInfo && (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs space-y-1 text-sky-900">
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
                  <input
                    type="number"
                    min="0"
                    placeholder={`Default: ${selectedPaketInfo ? selectedPaketInfo.harga : 0}`}
                    value={customHarga}
                    onChange={(e) => setCustomHarga(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Kosongkan jika nominal sesuai harga paket resmi di atas.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingPerpanjang}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {submittingPerpanjang ? 'Memproses...' : 'Konfirmasi Isi Ulang / Perpanjang Kuota'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Scan Kartu Ganti NFC */}
      {selectedMember && (
        <ModalScanKartu
          isOpen={isModalGantiOpen}
          onClose={() => setIsModalGantiOpen(false)}
          onCardDetected={handleGantiKartu}
          title={`Ganti Kartu: ${selectedMember.nama}`}
          description="Tempelkan kartu RFID / NFC baru untuk dihubungkan ke member ini."
        />
      )}

      {/* Container Printable Faktur Thermal Basmalah Wash */}
      {printTransaksi && (
        <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none print:opacity-100 print:pointer-events-auto print:static print:visible">
          <ThermalReceipt
            transaksi={printTransaksi}
            member={selectedMember || printTransaksi.member}
            kasirNama={printTransaksi.admin?.nama || 'Kasir'}
            perusahaanNoHp="0812 1404 6587"
          />
        </div>
      )}
    </div>
  );
}
