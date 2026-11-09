import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  Scale,
  RefreshCw,
  History,
  Calendar,
  Wifi,
  Phone,
  AlertCircle,
  CheckCircle2,
  Package,
  CreditCard,
  Edit2,
} from "lucide-react";
import { memberApi, paketApi } from "../../api";
import KartuKuota from "../../components/KartuKuota";
import ModalScanKartu from "../../components/ModalScanKartu";
import {
  formatTanggal,
  formatTanggalWaktu,
  formatRupiah,
} from "../../utils/nfcHelper";
import showAlert from "../../utils/sweetalert";

const MemberDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [member, setMember] = useState(null);
  const [transaksiList, setTransaksiList] = useState([]);
  const [pakets, setPakets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Tab aktif: 'riwayat' atau 'perpanjang'
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "perpanjang" ? "perpanjang" : "riwayat",
  );

  // Form Perpanjang Paket
  const [selectedPaketId, setSelectedPaketId] = useState("");
  const [customHarga, setCustomHarga] = useState("");
  const [submittingPerpanjang, setSubmittingPerpanjang] = useState(false);
  const [successPerpanjangMsg, setSuccessPerpanjangMsg] = useState("");

  // Modal Ganti Kartu
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
        setTransaksiList(resTransaksi.data);
      }
      if (resPaket.success) {
        setPakets(resPaket.data);
        if (resPaket.data.length > 0) {
          setSelectedPaketId(resPaket.data[0].id);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Gagal mengambil data member");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const handleCustomHargaChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setCustomHarga('');
      return;
    }
    const formatted = new Intl.NumberFormat('id-ID').format(rawVal);
    setCustomHarga(formatted);
  };

  const handlePerpanjangSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessPerpanjangMsg("");
    setSubmittingPerpanjang(true);

    try {
      const cleanHarga = customHarga ? parseInt(customHarga.replace(/\D/g, ''), 10) : undefined;
      const res = await memberApi.perpanjang(id, {
        paketId: selectedPaketId,
        hargaDibayar: cleanHarga,
      });

      if (res.success) {
        showAlert.success("Berhasil!", "Paket member berhasil diperpanjang");
        setSuccessPerpanjangMsg("Paket member berhasil diperpanjang!");
        fetchMemberData();
        setActiveTab("riwayat");
      }
    } catch (err) {
      setErrorMsg(err.message || "Gagal memperpanjang paket");
      showAlert.error("Gagal Perpanjang", err.message);
    } finally {
      setSubmittingPerpanjang(false);
    }
  };

  const handleGantiKartu = async (uidBaru) => {
    try {
      await memberApi.gantiKartu(id, uidBaru);
      showAlert.success("Kartu Terhubung!", `Kartu member berhasil diganti ke UID: ${uidBaru}`);
      setIsModalGantiOpen(false);
      fetchMemberData();
    } catch (err) {
      showAlert.error("Gagal Mengganti Kartu", err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-xs font-semibold">Memuat profil member...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 bg-white rounded-2xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">
          Member Tidak Ditemukan
        </h3>
        <Link
          to="/members"
          className="text-xs text-sky-600 font-bold hover:underline"
        >
          Kembali ke Daftar Member
        </Link>
      </div>
    );
  }

  const selectedPaketInfo = pakets.find((p) => p.id === selectedPaketId);

  return (
    <div className="space-y-3 w-full">
      {/* Header Banner Compact */}
      <div className="bg-[#0284c7] text-white rounded-lg p-3 sm:p-3.5 shadow-sm flex items-center justify-between flex-wrap gap-2.5 w-full">
        <div className="flex items-center gap-2.5">
          <Link
            to="/members"
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition"
            title="Kembali ke Daftar Member"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight leading-tight">
              Detail Member & Kuota
            </h1>
            <p className="text-[11px] text-sky-100 font-medium leading-tight">
              Informasi lengkap kartu, paket aktif, dan transaksi laundry.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Link
            to={
              member.uidKartu
                ? `/scan?uid=${member.uidKartu}`
                : `/scan?memberId=${member.id}`
            }
            className="px-3 py-1.5 bg-white text-sky-700 hover:bg-sky-50 rounded-md text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
          >
            <Scale className="w-3.5 h-3.5" />
            Catat Laundry
          </Link>

          <button
            onClick={() => setIsModalGantiOpen(true)}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-xs font-semibold flex items-center gap-1 transition"
          >
            <Wifi className="w-3.5 h-3.5" />
            Ganti Kartu
          </button>

          <Link
            to={`/members/${member.id}/edit`}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-xs font-semibold flex items-center gap-1 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Ubah
          </Link>
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

      {/* Grid 2 Kolom Full Width 100% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full items-start">
        {/* Kolom Kiri: Kartu Kuota & Informasi Cepat (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-3">
          <KartuKuota member={member} />

          {/* Card Info Member Singkat */}
          <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-sm space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block border-b border-slate-100 pb-1.5">
              Identitas Pemegang Kartu
            </span>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Nama Pelanggan:</span>
              <strong className="text-slate-800">{member.nama}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">No WhatsApp:</span>
              <span className="font-semibold text-sky-700">{member.noHp}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Nomor NFC UID:</span>
              <span className="font-mono text-[11px] font-bold text-slate-700">
                {member.uidKartu || "Tanpa Kartu Fisik"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Status Langganan:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${member.status === "AKTIF" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
              >
                {member.status}
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Tab Riwayat Transaksi & Perpanjang Paket (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
            <button
              onClick={() => setActiveTab("riwayat")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "riwayat"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Riwayat Transaksi Cucian ({transaksiList.length})
            </button>

            <button
              onClick={() => setActiveTab("perpanjang")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "perpanjang"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Perpanjang / Isi Kuota
            </button>
          </div>

          {/* Tab 1: Tabel Riwayat Transaksi Member */}
          {activeTab === "riwayat" && (
            <div className="p-4 sm:p-6">
              {transaksiList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Belum ada transaksi laundry yang tercatat untuk member ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                        <th className="py-3 px-3">TANGGAL & WAKTU</th>
                        <th className="py-3 px-3">BERAT CUCIAN</th>
                        <th className="py-3 px-3">SISA SEBELUM</th>
                        <th className="py-3 px-3">SISA SESUDAH</th>
                        <th className="py-3 px-3">CATATAN</th>
                        <th className="py-3 px-3">ADMIN PENCATAT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {transaksiList.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {formatTanggalWaktu(t.createdAt)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-sky-600 text-sm">
                              {parseFloat(t.beratKg).toFixed(2)} kg
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {parseFloat(t.sisaSebelum).toFixed(2)} kg
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-600">
                            {parseFloat(t.sisaSesudah).toFixed(2)} kg
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {t.catatan || "-"}
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {t.admin?.nama || "Admin"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Form Perpanjang Paket */}
          {activeTab === "perpanjang" && (
            <div className="p-4 sm:p-5 w-full">
              <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                Perpanjang Masa Aktif atau Ubah Paket
              </h4>
              <p className="text-[11px] text-slate-500 mb-3.5">
                Kebijakan kuota lama: sisa kuota yang belum terpakai akan
                otomatis digabungkan atau dihanguskan sesuai pengaturan sistem.
              </p>

              <form onSubmit={handlePerpanjangSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pilih Paket Baru *
                  </label>
                  <select
                    required
                    value={selectedPaketId}
                    onChange={(e) => setSelectedPaketId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {pakets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.namaPaket} — Kuota {p.kuotaKg} kg, Masa Aktif{" "}
                        {p.durasiHari} Hari ({formatRupiah(p.harga)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPaketInfo && (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs space-y-1 text-sky-900">
                    <div className="flex justify-between font-bold">
                      <span>Harga Paket:</span>
                      <span className="text-sm font-black text-sky-800">
                        {formatRupiah(selectedPaketInfo.harga)}
                      </span>
                    </div>
                    <div className="text-[11px]">
                      Durasi Tambahan:{" "}
                      <strong>+{selectedPaketInfo.durasiHari} Hari</strong>
                    </div>
                    <div className="text-[11px]">
                      Kuota Tambahan:{" "}
                      <strong>+{selectedPaketInfo.kuotaKg} kg</strong>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nominal Dibayar (Opsional jika ada diskon)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customHarga}
                      onChange={handleCustomHargaChange}
                      placeholder={`Default: ${selectedPaketInfo ? new Intl.NumberFormat('id-ID').format(selectedPaketInfo.harga) : 0}`}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingPerpanjang}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {submittingPerpanjang
                    ? "Memproses Perpanjangan..."
                    : "Simpan & Aktifkan Paket"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ganti Kartu NFC */}
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
