import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  RotateCw,
  Printer,
  Calendar,
  X,
  Package,
  Users,
  Wifi,
  Coins,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { perpanjanganApi, memberApi, paketApi } from "../../api";
import {
  formatTanggal,
  formatTanggalWaktu,
  formatRupiah,
} from "../../utils/nfcHelper";

const PerpanjanganList = () => {
  const [dataList, setDataList] = useState([]);
  const [members, setMembers] = useState([]);
  const [pakets, setPakets] = useState([]);
  const [total, setTotal] = useState(0);
  const [ringkasan, setRingkasan] = useState({
    totalPerpanjangan: 0,
    totalPendapatan: 0,
    totalKuotaTerjual: 0,
    memberUnik: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("semua");
  const [selectedPaketId, setSelectedPaketId] = useState("semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal Kwitansi
  const [selectedPerpanjangan, setSelectedPerpanjangan] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    // Ambil list member dan paket untuk dropdown filter
    memberApi
      .getAll({ limit: 200 })
      .then((res) => {
        if (res.success) setMembers(res.data.members || []);
      })
      .catch(() => {});

    paketApi
      .getAll(true)
      .then((res) => {
        if (res.success) setPakets(res.data || []);
      })
      .catch(() => {});
  }, []);

  const fetchPerpanjangan = async () => {
    setLoading(true);
    try {
      const res = await perpanjanganApi.getAll({
        search,
        memberId: selectedMemberId !== "semua" ? selectedMemberId : "",
        paketId: selectedPaketId !== "semua" ? selectedPaketId : "",
        startDate,
        endDate,
        limit: 200,
      });

      if (res.success) {
        setDataList(res.data.items);
        setTotal(res.data.total);
        if (res.data.ringkasan) {
          setRingkasan(res.data.ringkasan);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat perpanjangan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerpanjangan();
  }, [selectedMemberId, selectedPaketId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPerpanjangan();
  };

  const handleReset = () => {
    setSearch("");
    setSelectedMemberId("semua");
    setSelectedPaketId("semua");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="w-full">
      {/* 1. TOP STATS CARDS COMPACT (SMALL / SM) */}
      <div className="top-stats-grid">
        <div className="stat-card-colored stat-card-blue">
          <div>
            <div className="stat-colored-title">TOTAL PEMBELIAN PAKET</div>
            <div className="stat-colored-number">
              {ringkasan.totalPerpanjangan}
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <CreditCard size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-green">
          <div>
            <div className="stat-colored-title">TOTAL PENDAPATAN PAKET</div>
            <div className="stat-colored-number">
              {formatRupiah(ringkasan.totalPendapatan)}
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <Coins size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-purple">
          <div>
            <div className="stat-colored-title">TOTAL KUOTA TERJUAL</div>
            <div className="stat-colored-number">
              {ringkasan.totalKuotaTerjual}{" "}
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>kg</span>
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <Package size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-amber">
          <div>
            <div className="stat-colored-title">MEMBER TRANSAKSI PAKET</div>
            <div className="stat-colored-number">{ringkasan.memberUnik}</div>
          </div>
          <div className="stat-colored-icon-box">
            <Users size={16} />
          </div>
        </div>
      </div>

      {/* 2. TITLE STRIP COMPACT */}
      <div className="page-title-strip">
        <div className="page-title-left">
          <div className="page-title-icon">
            <CreditCard size={16} />
          </div>
          <div>
            <h2>Riwayat Pembelian & Perpanjangan Paket Laundry</h2>
            <p>
              Log histori transaksi isi ulang kuota, perpanjangan masa aktif
              paket, dan cetak bukti kwitansi
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={fetchPerpanjangan}
          >
            <RotateCw size={11} /> Refresh
          </button>
        </div>
      </div>

      {/* 3. FILTER SEARCH BOX COMPACT */}
      <div className="filter-search-box" style={{ gap: "6px" }}>
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
            placeholder="Cari member, paket, no HP..."
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
            style={{ maxWidth: "220px" }}
          >
            <option value="semua">Semua Member ({members.length})</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} {m.uidKartu ? `[${m.uidKartu}]` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* SELECT OPTION PAKET */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
            }}
          >
            Paket:
          </label>
          <select
            className="filter-select"
            value={selectedPaketId}
            onChange={(e) => setSelectedPaketId(e.target.value)}
          >
            <option value="semua">Semua Paket ({pakets.length})</option>
            {pakets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaPaket} ({p.kuotaKg} kg)
              </option>
            ))}
          </select>
        </div>

        {/* DATE RANGE */}
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
            onClick={fetchPerpanjangan}
          >
            Filter
          </button>
        </div>

        {/* RESET */}
        {(selectedMemberId !== "semua" ||
          selectedPaketId !== "semua" ||
          startDate ||
          endDate ||
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
            onClick={handleReset}
          >
            <X size={10} /> Reset
          </button>
        )}

        <div style={{ marginLeft: "auto" }}>
          <span
            className="badge badge-info"
            style={{ fontSize: "0.68rem", padding: "3px 8px" }}
          >
            Total: {total} Transaksi Paket
          </span>
        </div>
      </div>

      {/* 4. TABEL BORDERED COMPACT */}
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
            Memuat data pembelian paket...
          </div>
        ) : dataList.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "0.74rem",
            }}
          >
            Belum ada riwayat perpanjangan atau pembelian paket laundry.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="td-center" style={{ width: "32px" }}>
                  NO
                </th>
                <th>TANGGAL PEMBELIAN</th>
                <th>NAMA MEMBER</th>
                <th>UID KARTU</th>
                <th>PAKET YANG DIBELI</th>
                <th className="td-center">KUOTA</th>
                <th className="td-center">DURASI</th>
                <th>HARGA DIBAYAR</th>
                <th>MASA BERLAKU BARU</th>
                <th>KASIR / ADMIN</th>
                <th className="td-center" style={{ width: "65px" }}>
                  KWITANSI
                </th>
              </tr>
            </thead>
            <tbody>
              {dataList.map((row, idx) => (
                <tr key={row.id}>
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
                    {formatTanggalWaktu(row.createdAt)}
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a", fontSize: "0.76rem" }}>
                      {row.member?.nama || "-"}
                    </strong>
                    <div style={{ fontSize: "0.64rem", color: "#64748b" }}>
                      {row.member?.noHp}
                    </div>
                  </td>
                  <td>
                    {row.member?.uidKartu ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          background: "#f1f5f9",
                          padding: "1px 5px",
                          borderRadius: "3px",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        <Wifi size={10} color="#0284c7" />
                        <code
                          style={{
                            color: "#0284c7",
                            fontWeight: 700,
                            fontSize: "0.68rem",
                          }}
                        >
                          {row.member.uidKartu}
                        </code>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.64rem", color: "#94a3b8" }}>
                        -
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info font-bold">
                      {row.paket?.namaPaket || "-"}
                    </span>
                  </td>
                  <td className="td-center">
                    <strong style={{ color: "#0284c7", fontSize: "0.76rem" }}>
                      +{row.paket?.kuotaKg} kg
                    </strong>
                  </td>
                  <td
                    className="td-center"
                    style={{ fontSize: "0.7rem", color: "#475569" }}
                  >
                    +{row.paket?.durasiHari} Hari
                  </td>
                  <td>
                    <strong style={{ color: "#059669", fontSize: "0.76rem" }}>
                      {formatRupiah(row.hargaDibayar)}
                    </strong>
                  </td>
                  <td style={{ fontSize: "0.68rem", color: "#334155" }}>
                    {formatTanggal(row.tglMulai)} s/d{" "}
                    <strong>{formatTanggal(row.tglBerakhir)}</strong>
                  </td>
                  <td style={{ fontSize: "0.68rem", color: "#64748b" }}>
                    {row.admin?.nama || "Admin"}
                  </td>
                  <td className="td-center">
                    <button
                      className="btn-action btn-action-view"
                      onClick={() => {
                        setSelectedPerpanjangan(row);
                        setIsReceiptOpen(true);
                      }}
                      title="Lihat / Cetak Kwitansi Pembelian Paket"
                    >
                      <Printer size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 5. MODAL KWITANSI PEMBELIAN PAKET (COMPACT / SM) */}
      {isReceiptOpen && selectedPerpanjangan && (
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
              borderRadius: "8px",
              maxWidth: "380px",
              width: "100%",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
          >
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
                <CreditCard size={15} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800 }}>
                  Kwitansi Pembelian Paket Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReceiptOpen(false)}
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

            <div
              id="printable-receipt"
              style={{
                padding: "16px",
                fontFamily: "monospace",
                fontSize: "0.74rem",
                color: "#0f172a",
                lineHeight: 1.4,
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  borderBottom: "1px dashed #cbd5e1",
                  paddingBottom: "10px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                  RUANG LAUNDRY EXPRESS
                </div>
                <div style={{ fontSize: "0.66rem", color: "#64748b" }}>
                  Bukti Pembelian Kuota / Paket Kartu NFC
                </div>
                <div style={{ fontSize: "0.64rem", color: "#64748b" }}>
                  {formatTanggalWaktu(selectedPerpanjangan.createdAt)}
                </div>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Member:</span>
                  <strong>{selectedPerpanjangan.member?.nama}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>UID Kartu:</span>
                  <span>
                    {selectedPerpanjangan.member?.uidKartu || "Tanpa Kartu"}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>No. HP:</span>
                  <span>{selectedPerpanjangan.member?.noHp}</span>
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px dashed #cbd5e1",
                  borderBottom: "1px dashed #cbd5e1",
                  padding: "8px 0",
                  margin: "10px 0",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Paket:</span>
                  <strong>{selectedPerpanjangan.paket?.namaPaket}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "2px",
                  }}
                >
                  <span>Kuota Didapat:</span>
                  <strong>+{selectedPerpanjangan.paket?.kuotaKg} kg</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "2px",
                  }}
                >
                  <span>Durasi Tambahan:</span>
                  <span>+{selectedPerpanjangan.paket?.durasiHari} Hari</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "6px",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                  }}
                >
                  <span>Total Bayar:</span>
                  <span style={{ color: "#059669" }}>
                    {formatRupiah(selectedPerpanjangan.hargaDibayar)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: "0.68rem",
                  color: "#475569",
                  marginBottom: "10px",
                }}
              >
                <div>Masa Aktif Baru:</div>
                <strong style={{ color: "#0284c7" }}>
                  {formatTanggal(selectedPerpanjangan.tglMulai)} s/d{" "}
                  {formatTanggal(selectedPerpanjangan.tglBerakhir)}
                </strong>
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.64rem",
                  color: "#94a3b8",
                  marginTop: "12px",
                }}
              >
                Terima kasih telah berlangganan paket laundry.
                <br />
                Kuota aktif otomatis tersimpan ke kartu NFC Anda.
              </div>
            </div>

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
                onClick={() => setIsReceiptOpen(false)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <Printer size={11} /> Cetak Kwitansi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerpanjanganList;
