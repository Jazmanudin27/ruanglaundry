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
  ChevronDown,
  User,
  Phone,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { memberApi, paketApi } from '../../api';
import KartuKuota from '../../components/KartuKuota';
import ModalScanKartu from '../../components/ModalScanKartu';
import ThermalReceipt from '../../components/ThermalReceipt';
import { formatTanggalWaktu, formatRupiah } from '../../utils/nfcHelper';
import showAlert from '../../utils/sweetalert';

export default function MobileHistoriMember() {
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

  // Pencarian Cepat Member
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Thermal print state
  const [printTransaksi, setPrintTransaksi] = useState(null);

  // 1. Ambil daftar member dan paket
  useEffect(() => {
    const initData = async () => {
      setLoadingMembers(true);
      try {
        const [resMembers, resPaket] = await Promise.all([
          memberApi.getAll({ limit: 300 }),
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
        console.error('Gagal memuat data awal:', err);
      } finally {
        setLoadingMembers(false);
      }
    };

    initData();
  }, []);

  // 2. Ambil detail member & transaksi
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
    setIsSearchOpen(false);
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

  // Filter member untuk selector & search
  const filteredMembers = members.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.nama?.toLowerCase().includes(q) ||
      m.noHp?.includes(q) ||
      m.uidKartu?.toLowerCase().includes(q)
    );
  });

  const selectedPaketInfo = pakets.find((p) => p.id === selectedPaketId);

  // Hitung total berat yang sudah dicuci
  const totalBeratKg = transaksiList.reduce(
    (acc, t) => acc + parseFloat(t.beratKg || 0),
    0
  );

  return (
    <div className="w-full space-y-3 pb-6">
      {/* 1. SELECTOR MEMBER CARD - MODERN & ELEGAN */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-300/80 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <History className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 tracking-tight leading-tight">
                Histori Cucian Member
              </h2>
              <p className="text-[10px] text-slate-500">
                Pilih member untuk pantau kuota & transaksi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              isSearchOpen
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[10px]">{isSearchOpen ? 'Tutup' : 'Cari'}</span>
          </button>
        </div>

        {/* Input Pencarian Cepat jika tombol Cari ditekan */}
        {isSearchOpen && (
          <div className="relative pt-1 animate-fade-in">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama pelanggan, no HP, atau RFID..."
              autoFocus
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        )}

        {/* Dropdown Select Member */}
        <div className="relative">
          <select
            value={selectedMemberId}
            onChange={(e) => handleSelectMember(e.target.value)}
            disabled={loadingMembers}
            className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 text-slate-800 font-extrabold text-xs rounded-xl px-3 py-2.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 transition appearance-none cursor-pointer"
          >
            <option value="">-- Pilih Nama Pelanggan ({members.length} Member) --</option>
            {filteredMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} — Sisa: {parseFloat(m.sisaKuota || 0).toFixed(1)} kg ({m.paket?.namaPaket || 'Paket'})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
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

      {loadingDetail ? (
        <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="inline-block w-7 h-7 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold">Memuat profil & riwayat member...</p>
        </div>
      ) : !selectedMember ? (
        <div className="p-8 bg-white rounded-2xl text-center space-y-2 border border-slate-200 shadow-sm">
          <AlertCircle className="w-9 h-9 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Silakan Pilih Member</h3>
          <p className="text-xs text-slate-500">
            Pilih salah satu member di atas untuk memantau kuota dan histori transaksi cuciannya.
          </p>
        </div>
      ) : (
        /* KONTEN DETAIL MEMBER TERPILIH (SINGLE-COLUMN MOBILE OPTIMIZED) */
        <div className="space-y-3">
          {/* 2. KARTU KUOTA RFID (FULL WIDTH - TIDAK AKAN KEPENGGEL) */}
          <div className="w-full">
            <KartuKuota member={selectedMember} />
          </div>

          {/* 3. TOMBOL AKSI CEPAT (ELEGANT BUTTONS) */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={
                selectedMember.uidKartu
                  ? `/scan?uid=${selectedMember.uidKartu}`
                  : `/scan?memberId=${selectedMember.id}`
              }
              className="py-2.5 px-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-[0.98] transition"
            >
              <Scale className="w-3.5 h-3.5 text-amber-300" />
              <span>Catat Timbangan</span>
            </Link>

            <Link
              to={`/members/${selectedMember.id}`}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition"
            >
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span>Detail Penuh</span>
            </Link>
          </div>

          {/* 4. STATISTIK RINGKAS PEMAKAIAN (3 MINI CARDS) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Cuci</span>
              <span className="text-sm font-black text-slate-800">
                {transaksiList.length}{' '}
                <span className="text-[10px] font-normal text-slate-500">kali</span>
              </span>
            </div>

            <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Dicuci</span>
              <span className="text-sm font-black text-rose-600">
                {totalBeratKg.toFixed(1)}{' '}
                <span className="text-[10px] font-normal text-slate-500">kg</span>
              </span>
            </div>

            <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Sisa Kuota</span>
              <span className="text-sm font-black text-emerald-600">
                {parseFloat(selectedMember.sisaKuota || 0).toFixed(1)}{' '}
                <span className="text-[10px] font-normal text-slate-500">kg</span>
              </span>
            </div>
          </div>

          {/* 5. TABS SEGMENTED CONTROL: RIWAYAT & ISI KUOTA */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 p-1 bg-slate-100 gap-1 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('riwayat')}
                className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'riwayat'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Isi / Top Up</span>
              </button>
            </div>

            {/* Konten Tab Riwayat */}
            {activeTab === 'riwayat' ? (
              <div className="divide-y divide-slate-100">
                {transaksiList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                    <History className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <p className="font-semibold text-slate-600">Belum Ada Riwayat Cucian</p>
                    <p className="text-[11px] text-slate-400">
                      Member ini belum pernah melakukan penimbangan cucian.
                    </p>
                  </div>
                ) : (
                  transaksiList.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition"
                    >
                      <div className="space-y-0.5 flex-1 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-slate-900">
                            {formatTanggalWaktu(t.createdAt)}
                          </span>
                          {t.rakPenyimpanan && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              Rak {t.rakPenyimpanan}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.catatan || 'Cucian rutin'} • {t.admin?.nama || 'Kasir'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <span className="font-black text-rose-600 text-sm block leading-tight">
                            -{parseFloat(t.beratKg).toFixed(2)} kg
                          </span>
                          <div className="text-[10px] text-emerald-600 font-bold leading-tight">
                            Sisa: {parseFloat(t.sisaSesudah).toFixed(2)} kg
                          </div>
                        </div>

                        {/* Tombol Cetak Faktur Thermal */}
                        <button
                          type="button"
                          onClick={() => handlePrint(t)}
                          title="Cetak Faktur Basmalah Wash"
                          className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 flex items-center justify-center shadow-xs transition active:scale-95"
                        >
                          <Printer className="w-3.5 h-3.5" />
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                      Tambahan: <strong>+{selectedPaketInfo.kuotaKg} kg</strong> • Durasi: <strong>+{selectedPaketInfo.durasiHari} Hari</strong>
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Kosongkan jika nominal sama dengan harga paket resmi di atas.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submittingPerpanjang}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                  >
                    {submittingPerpanjang ? 'Memproses...' : 'Konfirmasi Top Up Kuota'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Scan Ganti Kartu */}
      {selectedMember && (
        <ModalScanKartu
          isOpen={isModalGantiOpen}
          onClose={() => setIsModalGantiOpen(false)}
          onCardDetected={handleGantiKartu}
          title={`Ganti Kartu: ${selectedMember.nama}`}
          description="Tempelkan kartu RFID baru untuk dihubungkan ke member ini."
        />
      )}

      {/* Container Print Struk Thermal */}
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

