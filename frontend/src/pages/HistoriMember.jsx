import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Users,
  Scale,
  Calendar,
  Clock,
  Printer,
  ChevronRight,
  Package,
  Phone,
  Wifi,
  Sparkles,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { memberApi, transaksiApi } from '../api';
import { formatTanggal, formatTanggalWaktu } from '../utils/nfcHelper';
import ThermalReceipt from '../components/ThermalReceipt';
import showAlert from '../utils/sweetalert';

export default function HistoriMember() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(searchParams.get('memberId') || '');
  const [selectedMember, setSelectedMember] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Untuk cetak faktur thermal
  const [printTransaksi, setPrintTransaksi] = useState(null);

  // 1. Ambil daftar semua member untuk dropdown select
  useEffect(() => {
    const fetchAllMembers = async () => {
      setLoading(true);
      try {
        const res = await memberApi.getAll({ limit: 200 });
        if (res.success && res.data) {
          const list = res.data.members || [];
          setMembers(list);

          // Jika ada query param memberId di URL, pilih langsung
          const paramId = searchParams.get('memberId');
          if (paramId) {
            setSelectedMemberId(paramId);
          } else if (list.length > 0 && !selectedMemberId) {
            // Default pilih member pertama jika belum ada yang dipilih
            setSelectedMemberId(list[0].id);
          }
        }
      } catch (err) {
        console.error('Gagal memuat member:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMembers();
  }, []);

  // 2. Setiap kali selectedMemberId berubah, load riwayat cuciannya
  useEffect(() => {
    if (!selectedMemberId) {
      setSelectedMember(null);
      setHistoryList([]);
      return;
    }

    const loadMemberHistory = async () => {
      setLoadingHistory(true);
      try {
        const [resMember, resHistory] = await Promise.all([
          memberApi.getById(selectedMemberId),
          memberApi.getTransaksi(selectedMemberId),
        ]);

        if (resMember.success) {
          setSelectedMember(resMember.data);
        }

        if (resHistory.success) {
          setHistoryList(resHistory.data || []);
        }
      } catch (err) {
        console.error('Gagal memuat riwayat:', err);
        showAlert.error('Gagal', 'Tidak dapat mengambil riwayat pemakaian');
      } finally {
        setLoadingHistory(false);
      }
    };

    loadMemberHistory();
  }, [selectedMemberId]);

  const handleSelectMember = (id) => {
    setSelectedMemberId(id);
    setSearchParams(id ? { memberId: id } : {});
  };

  const handlePrint = (transaksiItem) => {
    setPrintTransaksi(transaksiItem);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Filter daftar member di search jika user mencari di dropdown
  const filteredMembers = members.filter((m) =>
    m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.noHp && m.noHp.includes(searchQuery))
  );

  // Statistik cucian member yang dipilih
  const totalKgDicuci = historyList.reduce(
    (acc, curr) => acc + parseFloat(curr.beratKg || 0),
    0
  );

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-16">
      {/* 1. HEADER SECTION */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <History className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                Histori Pemakaian Member
              </h1>
              <p className="text-xs text-sky-100 mt-0.5">
                Pilih member untuk melihat riwayat cucian & sisa kuota paket
              </p>
            </div>
          </div>

          {/* Quick Count Total Member */}
          <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5 self-start sm:self-auto text-xs">
            <Users className="w-4 h-4 text-sky-300" />
            <span className="font-bold">{members.length} Member Terdaftar</span>
          </div>
        </div>

        {/* 2. SELECTOR PILIH MEMBER */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <label className="block text-xs font-bold text-sky-100 mb-1.5 uppercase tracking-wider">
            Pilih Nama Member:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2 relative">
              <select
                value={selectedMemberId}
                onChange={(e) => handleSelectMember(e.target.value)}
                className="w-full bg-white text-slate-800 font-extrabold text-sm rounded-xl px-3.5 py-2.5 shadow-md border-0 focus:ring-2 focus:ring-amber-300 transition"
              >
                <option value="">-- Pilih Member Laundry --</option>
                {filteredMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} — Sisa: {parseFloat(m.sisaKuota || 0).toFixed(1)} kg ({m.paket?.namaPaket || 'Paket'})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama / no HP..."
                className="w-full pl-9 pr-3 py-2.5 bg-white/90 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. KARTU INFORMASI MEMBER YANG DIPILIH */}
      {selectedMember && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 border border-sky-200 font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
                {selectedMember.nama ? selectedMember.nama.charAt(0).toUpperCase() : 'M'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    {selectedMember.nama}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 uppercase">
                    {selectedMember.paket?.namaPaket || 'Paket'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedMember.noHp || '-'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Wifi className="w-3.5 h-3.5 text-slate-400" />
                    {selectedMember.uidKartu || 'Belum pasang RFID'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/scan?memberId=${selectedMember.id}`)}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Input Timbangan Baru</span>
              </button>
            </div>
          </div>

          {/* Grid Stat Kuota */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Sisa Kuota
              </span>
              <div className="text-lg font-black text-emerald-600">
                {parseFloat(selectedMember.sisaKuota || 0).toFixed(2)}{' '}
                <span className="text-xs font-semibold text-slate-500">kg</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Kuota Awal Paket
              </span>
              <div className="text-lg font-black text-slate-800">
                {parseFloat(selectedMember.kuotaAwal || 0).toFixed(1)}{' '}
                <span className="text-xs font-semibold text-slate-500">kg</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Total Cuci
              </span>
              <div className="text-lg font-black text-sky-700">
                {historyList.length}{' '}
                <span className="text-xs font-semibold text-slate-500">kali</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Total Berat Dicuci
              </span>
              <div className="text-lg font-black text-indigo-700">
                {totalKgDicuci.toFixed(2)}{' '}
                <span className="text-xs font-semibold text-slate-500">kg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DAFTAR RIWAYAT TRANSAKSI / PEMAKAIAN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide">
              Riwayat Transaksi & Timbangan ({historyList.length})
            </h3>
          </div>
          {selectedMember && (
            <span className="text-xs font-bold text-slate-500">
              Member: <strong className="text-slate-800">{selectedMember.nama}</strong>
            </span>
          )}
        </div>

        {loadingHistory ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Memuat riwayat pemakaian...</p>
          </div>
        ) : historyList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>Belum ada riwayat cucian untuk member ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {historyList.map((t, idx) => {
              const berat = parseFloat(t.beratKg || 0);
              const sisaAwal = parseFloat(t.sisaSebelum || 0);
              const sisaAkhir = parseFloat(t.sisaSesudah || 0);

              return (
                <div
                  key={t.id || idx}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Kolom Kiri: Waktu & Kasir */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800">
                        {formatTanggalWaktu(t.createdAt)}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {t.statusCucian || 'SELESAI'}
                      </span>
                      {t.rakPenyimpanan && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {t.rakPenyimpanan}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Kasir: <strong className="text-slate-700">{t.admin?.nama || 'Kasir'}</strong></span>
                      {t.catatan && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-600 font-medium">"{t.catatan}"</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Kolom Kanan: Rincian Kuota & Tombol Cetak Faktur */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-black text-rose-600">
                        -{berat.toFixed(2)} kg
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Sisa:{' '}
                        <strong className="text-emerald-700 font-black">
                          {sisaAkhir.toFixed(2)} kg
                        </strong>
                      </div>
                    </div>

                    {/* Tombol Cetak Struk Format Baru */}
                    <button
                      type="button"
                      onClick={() => handlePrint(t)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
                      title="Cetak Faktur Thermal"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Cetak Faktur</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. HIDDEN PRINTABLE CONTAINER UNTUK CETAK FAKTUR */}
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

