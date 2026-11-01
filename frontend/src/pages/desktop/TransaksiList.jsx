import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  RotateCw,
  Wifi,
  Scale,
  User,
  Clock,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  X,
  FileSpreadsheet,
  ArrowUpDown,
  ShoppingBag,
  Users,
  Loader2,
  ExternalLink,
  Sparkles,
  Share2,
  Copy,
  Check,
  MapPin,
  Tag,
} from "lucide-react";
import { transaksiApi, memberApi } from "../../api";
import { formatTanggal, formatTanggalWaktu } from "../../utils/nfcHelper";
import showAlert from "../../utils/sweetalert";

const TransaksiList = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
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

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("semua");
  const [filterPeriode, setFilterPeriode] = useState("semua"); // 'semua', 'hari-ini', '7-hari', 'bulan-ini', 'custom'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterBerat, setFilterBerat] = useState("semua"); // 'semua', 'ringan', 'sedang', 'berat'
  const [filterStatusCucian, setFilterStatusCucian] = useState("semua"); // 'semua', 'ANTRIAN', 'PROSES', 'SIAP_AMBIL', 'SELESAI'

  // Modal Detail & Cetak Struk
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("ANTRIAN");
  const [modalRak, setModalRak] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [copiedResi, setCopiedResi] = useState(false);

  // Ambil data list member untuk select option
  useEffect(() => {
    memberApi
      .getAll({ limit: 200 })
      .then((res) => {
        if (res.success && res.data.members) {
          setMembers(res.data.members);
        }
      })
      .catch(() => {});
  }, []);

  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      // Hitung startDate & endDate berdasarkan filterPeriode
      let start = startDate;
      let end = endDate;
      const today = new Date();

      if (filterPeriode === "hari-ini") {
        start = today.toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
      } else if (filterPeriode === "7-hari") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = d.toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
      } else if (filterPeriode === "bulan-ini") {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        start = firstDay.toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
      }

      // Hitung minBerat & maxBerat
      let minBerat = "";
      let maxBerat = "";
      if (filterBerat === "ringan") {
        maxBerat = "2.99";
      } else if (filterBerat === "sedang") {
        minBerat = "3.0";
        maxBerat = "5.0";
      } else if (filterBerat === "berat") {
        minBerat = "5.01";
      }

      const res = await transaksiApi.getAll({
        search,
        memberId: selectedMemberId !== "semua" ? selectedMemberId : "",
        statusCucian: filterStatusCucian !== "semua" ? filterStatusCucian : "",
        startDate: start,
        endDate: end,
        minBerat,
        maxBerat,
        limit: 200,
      });

      if (res.success) {
        setTransaksi(res.data.items);
        setTotal(res.data.total);
        if (res.data.ringkasan) {
          setRingkasan(res.data.ringkasan);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat transaksi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaksi();
  }, [selectedMemberId, filterPeriode, filterBerat, filterStatusCucian]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransaksi();
  };

  const handleResetFilter = () => {
    setSearch("");
    setSelectedMemberId("semua");
    setFilterPeriode("semua");
    setStartDate("");
    setEndDate("");
    setFilterBerat("semua");
    setFilterStatusCucian("semua");
  };

  const handlePrintRekap = () => {
    window.print();
  };

  const handleOpenDetailModal = (t) => {
    setSelectedTransaksi(t);
    setModalStatus(t.statusCucian || "ANTRIAN");
    setModalRak(t.rakPenyimpanan || "");
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (transaksiId, newStatus, rakVal = null) => {
    try {
      const payload = {
        statusCucian: newStatus,
      };
      if (rakVal !== null) {
        payload.rakPenyimpanan = rakVal;
      }
      const res = await transaksiApi.updateStatus(transaksiId, payload);
      if (res.success) {
        // Update local state
        setTransaksi((prev) =>
          prev.map((item) => (item.id === transaksiId ? res.data : item)),
        );
        if (selectedTransaksi && selectedTransaksi.id === transaksiId) {
          setSelectedTransaksi(res.data);
          setModalStatus(res.data.statusCucian);
          setModalRak(res.data.rakPenyimpanan || "");
        }
        showAlert.toast("Status cucian diperbarui");
      }
    } catch (err) {
      showAlert.error("Gagal Mengubah Status", err.message);
    }
  };

  const handleSimpanStatusModal = async () => {
    if (!selectedTransaksi) return;
    setSavingStatus(true);
    try {
      await handleUpdateStatus(selectedTransaksi.id, modalStatus, modalRak);
      showAlert.success("Berhasil!", "Status cucian berhasil diperbarui");
    } finally {
      setSavingStatus(false);
    }
  };

  // Helper render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "ANTRIAN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" /> Antrian
          </span>
        );
      case "PROSES":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
            <Sparkles className="w-3 h-3" /> Dicuci & Setrika
          </span>
        );
      case "SIAP_AMBIL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShoppingBag className="w-3 h-3" /> Siap Diambil
          </span>
        );
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-3 h-3" /> Selesai
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-slate-500">{status}</span>
        );
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* 1. TOP STATS CARDS COMPACT */}
      <div className="top-stats-grid">
        <div className="stat-card-colored stat-card-blue">
          <div>
            <div className="stat-colored-title">TOTAL TRANSAKSI</div>
            <div className="stat-colored-number">
              {ringkasan.totalTransaksi}
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <ShoppingBag size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-green">
          <div>
            <div className="stat-colored-title">TOTAL CUCIAN TERPOTONG</div>
            <div className="stat-colored-number">
              {ringkasan.totalKg}{" "}
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>kg</span>
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <Scale size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-amber">
          <div>
            <div className="stat-colored-title">RATA-RATA / TRANSAKSI</div>
            <div className="stat-colored-number">
              {ringkasan.rataRataKg}{" "}
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>kg</span>
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <Scale size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-purple">
          <div>
            <div className="stat-colored-title">MEMBER TRANSAKSI</div>
            <div className="stat-colored-number">
              {ringkasan.memberUnik}{" "}
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Orang</span>
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <Users size={16} />
          </div>
        </div>
      </div>

      {/* 2. TAB TRACKING STATUS CUCIAN QUICK FILTER */}
      <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Status Cucian:
          </span>

          <button
            type="button"
            onClick={() => setFilterStatusCucian("semua")}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
              filterStatusCucian === "semua"
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Semua ({total})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatusCucian("ANTRIAN")}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
              filterStatusCucian === "ANTRIAN"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            <Clock className="w-3 h-3" />
            Antrian ({ringkasan.countByStatus?.ANTRIAN || 0})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatusCucian("PROSES")}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
              filterStatusCucian === "PROSES"
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Sedang Dicuci ({ringkasan.countByStatus?.PROSES || 0})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatusCucian("SIAP_AMBIL")}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
              filterStatusCucian === "SIAP_AMBIL"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            Siap Diambil ({ringkasan.countByStatus?.SIAP_AMBIL || 0})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatusCucian("SELESAI")}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
              filterStatusCucian === "SELESAI"
                ? "bg-slate-600 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Selesai ({ringkasan.countByStatus?.SELESAI || 0})
          </button>
        </div>
      </div>

      {/* 3. FILTER SEARCH & MEMBER BOX */}
      <div className="filter-search-box" style={{ gap: "6px" }}>
        {/* Search Keyword Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="filter-search-input"
          style={{ minWidth: "180px" }}
        >
          <Search size={13} color="#94a3b8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama santri, UID, rak..."
          />
        </form>

        {/* SELECT OPTION MEMBER */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
            }}
          >
            Member:
          </label>
          <select
            className="filter-select"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            style={{ maxWidth: "240px" }}
          >
            <option value="semua">Semua Member ({members.length})</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} {m.uidKartu ? `[NFC: ${m.uidKartu}]` : `(${m.noHp})`}
              </option>
            ))}
          </select>
        </div>

        {/* SELECT OPTION PERIODE */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
            }}
          >
            Periode:
          </label>
          <select
            className="filter-select"
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
          >
            <option value="semua">Semua Waktu</option>
            <option value="hari-ini">Hari Ini</option>
            <option value="7-hari">7 Hari Terakhir</option>
            <option value="bulan-ini">Bulan Ini</option>
            <option value="custom">Pilih Tanggal...</option>
          </select>
        </div>

        {/* CUSTOM DATE PICKER */}
        {filterPeriode === "custom" && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="date"
              className="filter-select"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: "3px 6px" }}
            />
            <span style={{ fontSize: "0.68rem", color: "#64748b" }}>s/d</span>
            <input
              type="date"
              className="filter-select"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: "3px 6px" }}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: "3px 8px", fontSize: "0.68rem" }}
              onClick={fetchTransaksi}
            >
              Filter
            </button>
          </div>
        )}

        {/* SELECT OPTION BERAT CUCIAN */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
            }}
          >
            Berat:
          </label>
          <select
            className="filter-select"
            value={filterBerat}
            onChange={(e) => setFilterBerat(e.target.value)}
          >
            <option value="semua">Semua Berat</option>
            <option value="ringan">Ringan (&lt; 3 kg)</option>
            <option value="sedang">Sedang (3 - 5 kg)</option>
            <option value="berat">Berat (&gt; 5 kg)</option>
          </select>
        </div>

        {/* TOMBOL RESET FILTER */}
        {(selectedMemberId !== "semua" ||
          filterPeriode !== "semua" ||
          filterBerat !== "semua" ||
          filterStatusCucian !== "semua" ||
          search) && (
          <button
            type="button"
            className="btn btn-outline"
            style={{
              padding: "3px 8px",
              fontSize: "0.66rem",
              color: "#ef4444",
              borderColor: "#fca5a5",
            }}
            onClick={handleResetFilter}
          >
            Reset
          </button>
        )}

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={fetchTransaksi}
          >
            <RotateCw size={11} /> Refresh
          </button>
        </div>
      </div>

      {/* 4. TABEL TRANSAKSI BORDERED COMPACT */}
      <div className="table-container-card">
        {loading ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "0.74rem",
            }}
          >
            <Loader2
              size={18}
              className="animate-spin inline mr-1.5 text-sky-600"
            />{" "}
            Memuat data transaksi...
          </div>
        ) : transaksi.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "0.74rem",
            }}
          >
            Tidak ada riwayat transaksi yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="td-center" style={{ width: "30px" }}>
                  NO
                </th>
                <th>TANGGAL & WAKTU</th>
                <th>NAMA MEMBER</th>
                <th className="td-center">STATUS CUCIAN</th>
                <th>LOKASI RAK</th>
                <th className="td-center">BERAT</th>
                <th className="td-center">SISA SEBELUM</th>
                <th className="td-center">SISA SESUDAH</th>
                <th>CATATAN</th>
                <th>KASIR</th>
                <th className="td-center" style={{ width: "70px" }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {transaksi.map((t, idx) => (
                <tr key={t.id}>
                  <td
                    className="td-center"
                    style={{
                      fontWeight: 600,
                      color: "#64748b",
                      fontSize: "0.7rem",
                    }}
                  >
                    {idx + 1}
                  </td>

                  <td
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      fontSize: "0.7rem",
                    }}
                  >
                    {formatTanggalWaktu(t.createdAt)}
                  </td>

                  <td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <strong
                        style={{
                          color: "#0f172a",
                          fontSize: "0.76rem",
                          cursor: "pointer",
                        }}
                        className="hover:text-sky-600"
                        onClick={() => handleOpenDetailModal(t)}
                      >
                        {t.member?.nama || t.namaPelanggan || "-"}
                      </strong>
                      {t.jenisPelanggan === "NON_MEMBER" ? (
                        <span className="badge badge-warning">Non-Member</span>
                      ) : (
                        <span className="badge badge-info">Member</span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.64rem", color: "#64748b" }}>
                      {t.member?.noHp || t.noHpPelanggan || "-"}
                    </div>
                  </td>

                  {/* Status Cucian Dropdown Cepat */}
                  <td className="td-center">
                    <select
                      value={t.statusCucian || "ANTRIAN"}
                      onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                      className={`text-[11px] font-extrabold px-2 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                        t.statusCucian === "ANTRIAN"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : t.statusCucian === "PROSES"
                            ? "bg-sky-50 text-sky-800 border-sky-300"
                            : t.statusCucian === "SIAP_AMBIL"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                      }`}
                    >
                      <option value="ANTRIAN">⏳ Antrian</option>
                      <option value="PROSES">🌀 Dicuci & Setrika</option>
                      <option value="SIAP_AMBIL">✨ Siap Diambil</option>
                      <option value="SELESAI">✅ Sudah Diambil</option>
                    </select>
                  </td>

                  {/* Lokasi Rak */}
                  <td>
                    {t.rakPenyimpanan ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-bold">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {t.rakPenyimpanan}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        -
                      </span>
                    )}
                  </td>

                  <td className="td-center">
                    <span
                      style={{
                        fontWeight: 800,
                        color: "#0284c7",
                        fontSize: "0.78rem",
                      }}
                    >
                      -{parseFloat(t.beratKg).toFixed(2)} kg
                    </span>
                  </td>
                  <td
                    className="td-center"
                    style={{ color: "#64748b", fontSize: "0.7rem" }}
                  >
                    {t.jenisPelanggan === "NON_MEMBER"
                      ? `@ Rp ${(t.tarifPerKg || 7000).toLocaleString('id-ID')}`
                      : `${parseFloat(t.sisaSebelum || 0).toFixed(2)} kg`}
                  </td>
                  <td className="td-center">
                    <strong style={{ color: "#059669", fontSize: "0.74rem" }}>
                      {t.jenisPelanggan === "NON_MEMBER"
                        ? `Rp ${(t.totalBayar || 0).toLocaleString('id-ID')}`
                        : `${parseFloat(t.sisaSesudah || 0).toFixed(2)} kg`}
                    </strong>
                  </td>
                  <td style={{ fontSize: "0.68rem", color: "#475569" }}>
                    {t.catatan || "-"}
                  </td>
                  <td style={{ fontSize: "0.68rem", color: "#64748b" }}>
                    {t.admin?.nama || "Admin"}
                  </td>
                  <td className="td-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="btn-action btn-action-view"
                        onClick={() => handleOpenDetailModal(t)}
                        title="Lihat Detail, Ubah Rak & Cetak Struk"
                      >
                        <Printer size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 5. MODAL STRUK BUKTI TRANSAKSI & STATUS MANAGEMENT */}
      {isDetailModalOpen && selectedTransaksi && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "10px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Printer size={15} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800 }}>
                  Detail & Struk Cucian NFC
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              {/* Form Ubah Status & Rak di dalam modal */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Update Status & Posisi Rak
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Kasir Outlet
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">
                      Status Cucian:
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      className="w-full p-1.5 text-xs font-bold border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="ANTRIAN">⏳ Antrian</option>
                      <option value="PROSES">🌀 Dicuci & Setrika</option>
                      <option value="SIAP_AMBIL">✨ Siap Diambil</option>
                      <option value="SELESAI">✅ Sudah Diambil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">
                      Nomor/Posisi Rak:
                    </label>
                    <input
                      type="text"
                      value={modalRak}
                      onChange={(e) => setModalRak(e.target.value)}
                      placeholder="Misal: Rak A-02"
                      className="w-full p-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    disabled={savingStatus}
                    onClick={handleSimpanStatusModal}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold text-xs disabled:opacity-50"
                  >
                    {savingStatus ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>

              {/* Printable Receipt Paper Style */}
              <div
                id="printable-receipt"
                style={{
                  padding: "14px",
                  fontFamily: "monospace",
                  fontSize: "0.74rem",
                  color: "#0f172a",
                  lineHeight: 1.4,
                  background: "#ffffff",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    borderBottom: "1px dashed #cbd5e1",
                    paddingBottom: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                    RUANG LAUNDRY EXPRESS
                  </div>
                  <div style={{ fontSize: "0.66rem", color: "#64748b" }}>
                    Sistem Member Kartu NFC Outlet
                  </div>
                  <div style={{ fontSize: "0.64rem", color: "#64748b" }}>
                    {formatTanggalWaktu(selectedTransaksi.createdAt)}
                  </div>
                </div>

                <div style={{ marginBottom: "8px", spaceY: "3px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Pelanggan:</span>
                    <strong>
                      {selectedTransaksi.member?.nama || selectedTransaksi.namaPelanggan || "Pelanggan"}
                      {selectedTransaksi.jenisPelanggan === "NON_MEMBER" ? " (Non-Member)" : ""}
                    </strong>
                  </div>
                  {selectedTransaksi.jenisPelanggan !== "NON_MEMBER" && (
                    <div
                      style={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <span>UID Kartu:</span>
                      <span>{selectedTransaksi.member?.uidKartu || "-"}</span>
                    </div>
                  )}
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>No. HP:</span>
                    <span>{selectedTransaksi.member?.noHp || selectedTransaksi.noHpPelanggan || "-"}</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Status Cucian:</span>
                    <strong>{modalStatus}</strong>
                  </div>
                  {modalRak && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Posisi Rak:</span>
                      <strong>{modalRak}</strong>
                    </div>
                  )}
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Kasir:</span>
                    <span>{selectedTransaksi.admin?.nama || "Admin"}</span>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px dashed #cbd5e1",
                    borderBottom: "1px dashed #cbd5e1",
                    padding: "6px 0",
                    margin: "8px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                    }}
                  >
                    <span>Berat Cucian:</span>
                    <span style={{ color: "#0284c7" }}>
                      {parseFloat(selectedTransaksi.beratKg).toFixed(2)} kg
                    </span>
                  </div>

                  {selectedTransaksi.jenisPelanggan === "NON_MEMBER" ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "3px",
                        }}
                      >
                        <span>Tarif per Kg:</span>
                        <span>Rp {(selectedTransaksi.tarifPerKg || 7000).toLocaleString('id-ID')}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "3px",
                          fontWeight: 800,
                        }}
                      >
                        <span>Total Bayar:</span>
                        <strong style={{ color: "#059669" }}>
                          Rp {(selectedTransaksi.totalBayar || 0).toLocaleString('id-ID')} ({selectedTransaksi.statusBayar || "LUNAS"})
                        </strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "3px",
                        }}
                      >
                        <span>Sisa Sebelum:</span>
                        <span>
                          {parseFloat(selectedTransaksi.sisaSebelum || 0).toFixed(2)} kg
                        </span>
                      </div>
                      <div
                        style={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <span>Sisa Sesudah:</span>
                        <strong style={{ color: "#059669" }}>
                          {parseFloat(selectedTransaksi.sisaSesudah || 0).toFixed(2)} kg
                        </strong>
                      </div>
                    </>
                  )}
                </div>

                {selectedTransaksi.catatan && (
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "#475569",
                      marginBottom: "8px",
                    }}
                  >
                    Catatan: {selectedTransaksi.catatan}
                  </div>
                )}

                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.64rem",
                    color: "#94a3b8",
                    marginTop: "10px",
                  }}
                >
                  Terima kasih atas kunjungan Anda!
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div
              style={{
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                padding: "8px 14px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "6px",
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <Printer size={11} /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaksiList;
