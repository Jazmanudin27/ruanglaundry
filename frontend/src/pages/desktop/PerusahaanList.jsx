import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  ShieldCheck,
  CreditCard,
  X,
  Coins,
  Store,
  Calendar,
  Loader2,
} from "lucide-react";
import { perusahaanApi } from "../../api";
import { formatTanggal, formatRupiah } from "../../utils/nfcHelper";

const PerusahaanList = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  // Modal Tambah Perusahaan Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    namaPerusahaan: "",
    kodePerusahaan: "",
    namaOwner: "",
    noHpOwner: "",
    alamat: "",
    tarifBulanan: "200000",
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
      console.error("Gagal mengambil daftar perusahaan:", err);
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
        `Konfirmasi pembayaran langganan SaaS Rp 200.000 untuk "${p.namaPerusahaan}"?\nMasa aktif akan diperpanjang +30 hari.`,
      )
    ) {
      try {
        const res = await perusahaanApi.perpanjangLangganan(p.id, {
          tambahanHari: 30,
        });
        alert(res.message || "Langganan berhasil diperpanjang!");
        fetchPerusahaan();
      } catch (err) {
        alert(err.message || "Gagal memperpanjang langganan");
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
      alert(
        "Perusahaan / Outlet laundry baru berhasil didaftarkan dengan lisensi aktif 30 hari!",
      );
      setIsModalOpen(false);
      setFormData({
        namaPerusahaan: "",
        kodePerusahaan: "",
        namaOwner: "",
        noHpOwner: "",
        alamat: "",
        tarifBulanan: "200000",
      });
      fetchPerusahaan();
    } catch (err) {
      alert(err.message || "Gagal mendaftarkan perusahaan");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter
  const filtered = list.filter((p) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      p.namaPerusahaan.toLowerCase().includes(q) ||
      p.kodePerusahaan.toLowerCase().includes(q) ||
      p.namaOwner.toLowerCase().includes(q);

    const matchStatus =
      filterStatus === "semua"
        ? true
        : filterStatus === "aktif"
          ? !p.isExpired
          : p.isExpired;

    return matchQ && matchStatus;
  });

  const countAktif = list.filter((p) => !p.isExpired).length;
  const countExpired = list.filter((p) => p.isExpired).length;
  const potensiMRR = countAktif * 200000;

  return (
    <div className="w-full">
      {/* 1. TOP STATS CARDS SAAS */}
      <div className="top-stats-grid">
        <div className="stat-card-colored stat-card-blue">
          <div>
            <div className="stat-colored-title">TOTAL OUTLET / PERUSAHAAN</div>
            <div className="stat-colored-number">{list.length}</div>
          </div>
          <div className="stat-colored-icon-box">
            <Building2 size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-green">
          <div>
            <div className="stat-colored-title">
              LANGGANAN AKTIF (200RB/BLN)
            </div>
            <div className="stat-colored-number">{countAktif}</div>
          </div>
          <div className="stat-colored-icon-box">
            <ShieldCheck size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-amber">
          <div>
            <div className="stat-colored-title">JATUH TEMPO / KEDALUWARSA</div>
            <div className="stat-colored-number">{countExpired}</div>
          </div>
          <div className="stat-colored-icon-box">
            <AlertTriangle size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-purple">
          <div>
            <div className="stat-colored-title">PENDAPATAN SAAS / BULAN</div>
            <div className="stat-colored-number">
              {formatRupiah(potensiMRR)}
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <Coins size={16} />
          </div>
        </div>
      </div>

      {/* 2. TITLE STRIP COMPACT */}
      <div className="page-title-strip">
        <div className="page-title-left">
          <div className="page-title-icon">
            <Building2 size={16} />
          </div>
          <div>
            <h2>Kelola Outlet Laundry Langganan (SaaS Multi-Perusahaan)</h2>
            <p>
              Kelola banyak perusahaan laundry dalam satu aplikasi berbayar Rp
              200.000/bulan per outlet
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={fetchPerusahaan}
          >
            <RotateCw size={11} /> Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={11} /> + Daftarkan Outlet Baru
          </button>
        </div>
      </div>

      {/* 3. FILTER SEARCH BOX */}
      <div className="filter-search-box" style={{ gap: "6px" }}>
        <div className="filter-search-input" style={{ minWidth: "200px" }}>
          <Search size={13} color="#94a3b8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama perusahaan, kode outlet, nama owner..."
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
            }}
          >
            Status:
          </label>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="semua">Semua Status ({list.length})</option>
            <option value="aktif">Langganan Aktif ({countAktif})</option>
            <option value="expired">
              Jatuh Tempo / Expired ({countExpired})
            </option>
          </select>
        </div>

        <div style={{ marginLeft: "auto" }}>
          <span
            className="badge badge-info"
            style={{ fontSize: "0.68rem", padding: "3px 8px" }}
          >
            Total: {filtered.length} Outlet Terdaftar
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
            Memuat daftar perusahaan SaaS...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "0.74rem",
            }}
          >
            Tidak ada perusahaan / outlet yang cocok dengan filter pencarian.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="td-center" style={{ width: "32px" }}>
                  NO
                </th>
                <th>KODE</th>
                <th>NAMA PERUSAHAAN / OUTLET</th>
                <th>PEMILIK / OWNER</th>
                <th>NO. WA OWNER</th>
                <th className="td-center">MEMBER</th>
                <th className="td-center">TRANSAKSI</th>
                <th>TARIF / BLN</th>
                <th>MASA AKTIF LISENSI</th>
                <th className="td-center">STATUS</th>
                <th className="td-center" style={{ width: "130px" }}>
                  AKSI SAAS
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
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
                  <td>
                    <span
                      style={{
                        fontWeight: 800,
                        color: "#0284c7",
                        background: "#e0f2fe",
                        padding: "1px 5px",
                        borderRadius: "3px",
                        fontSize: "0.68rem",
                      }}
                    >
                      {row.kodePerusahaan}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a", fontSize: "0.76rem" }}>
                      {row.namaPerusahaan}
                    </strong>
                    <div style={{ fontSize: "0.64rem", color: "#64748b" }}>
                      {row.alamat || "Alamat belum diatur"}
                    </div>
                  </td>
                  <td
                    style={{
                      fontSize: "0.72rem",
                      color: "#334155",
                      fontWeight: 600,
                    }}
                  >
                    {row.namaOwner}
                  </td>
                  <td>
                    <a
                      href={`https://wa.me/${row.noHpOwner.replace(/^0/, "62")}?text=Halo%20${encodeURIComponent(row.namaOwner)},%20pemberitahuan%20langganan%20aplikasi%20Ruang%20Laundry`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "0.68rem",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                      className="hover:underline"
                    >
                      <Phone size={10} />
                      {row.noHpOwner}
                    </a>
                  </td>
                  <td
                    className="td-center"
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                      fontSize: "0.74rem",
                    }}
                  >
                    {row._count?.members || 0}
                  </td>
                  <td
                    className="td-center"
                    style={{
                      fontWeight: 700,
                      color: "#0284c7",
                      fontSize: "0.74rem",
                    }}
                  >
                    {row._count?.transaksi || 0}
                  </td>
                  <td
                    style={{
                      fontWeight: 700,
                      color: "#059669",
                      fontSize: "0.72rem",
                    }}
                  >
                    {formatRupiah(row.tarifBulanan)}
                  </td>
                  <td>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      s/d {formatTanggal(row.tglBerakhirLangganan)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.64rem",
                        color: row.isExpired ? "#b91c1c" : "#059669",
                        fontWeight: 600,
                      }}
                    >
                      {row.isExpired
                        ? `Kedaluwarsa ${Math.abs(row.daysLeft)} hari`
                        : `Sisa ${row.daysLeft} hari lagi`}
                    </div>
                  </td>
                  <td className="td-center">
                    <span
                      className={`badge ${row.isExpired ? "badge-danger" : "badge-success"}`}
                    >
                      {row.isExpired ? "EXPIRED" : "AKTIF"}
                    </span>
                  </td>
                  <td className="td-center">
                    <button
                      type="button"
                      className="btn"
                      style={{
                        padding: "3px 8px",
                        fontSize: "0.66rem",
                        background: "#059669",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: 700,
                      }}
                      onClick={() => handlePerpanjangLisensi(row)}
                      title="Perpanjang Lisensi +30 Hari (Catat Bayar Rp 200.000)"
                    >
                      <CreditCard size={10} /> +30 Hari (200rb)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 5. MODAL TAMBAH OUTLET BARU (COMPACT) */}
      {isModalOpen && (
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
              maxWidth: "440px",
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
                <Store size={15} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800 }}>
                  Daftarkan Perusahaan / Outlet Laundry Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSubmit} style={{ padding: "14px" }}>
              <div style={{ marginBottom: "8px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#334155",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                  }}
                >
                  Nama Outlet / Perusahaan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaPerusahaan}
                  onChange={(e) =>
                    setFormData({ ...formData, namaPerusahaan: e.target.value })
                  }
                  placeholder="Contoh: Berkah Laundry Mandiri"
                  style={{
                    width: "100%",
                    padding: "5px 8px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "5px",
                    fontSize: "0.74rem",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      color: "#334155",
                      textTransform: "uppercase",
                      marginBottom: "2px",
                    }}
                  >
                    Kode Unik Outlet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kodePerusahaan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kodePerusahaan: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Contoh: BLM-01"
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "5px",
                      fontSize: "0.74rem",
                      textTransform: "uppercase",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      color: "#334155",
                      textTransform: "uppercase",
                      marginBottom: "2px",
                    }}
                  >
                    Tarif Langganan / Bln *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.tarifBulanan}
                    onChange={(e) =>
                      setFormData({ ...formData, tarifBulanan: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "5px",
                      fontSize: "0.74rem",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      color: "#334155",
                      textTransform: "uppercase",
                      marginBottom: "2px",
                    }}
                  >
                    Nama Pemilik / Owner *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaOwner}
                    onChange={(e) =>
                      setFormData({ ...formData, namaOwner: e.target.value })
                    }
                    placeholder="Contoh: Bpk. Joko"
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "5px",
                      fontSize: "0.74rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      color: "#334155",
                      textTransform: "uppercase",
                      marginBottom: "2px",
                    }}
                  >
                    No. WA Owner *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.noHpOwner}
                    onChange={(e) =>
                      setFormData({ ...formData, noHpOwner: e.target.value })
                    }
                    placeholder="Contoh: 08123456789"
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "5px",
                      fontSize: "0.74rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#334155",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                  }}
                >
                  Alamat Outlet
                </label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) =>
                    setFormData({ ...formData, alamat: e.target.value })
                  }
                  placeholder="Contoh: Jl. Ahmad Yani No. 8"
                  style={{
                    width: "100%",
                    padding: "5px 8px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "5px",
                    fontSize: "0.74rem",
                  }}
                />
              </div>

              <div
                style={{
                  background: "#f0fdf4",
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #bbf7d0",
                  fontSize: "0.68rem",
                  color: "#166534",
                  marginBottom: "12px",
                }}
              >
                ✓ Otomatis mengaktifkan lisensi software 30 hari pertama senilai{" "}
                <strong>Rp 200.000</strong>.
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "6px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "10px",
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? "Menyimpan..." : "Daftarkan Outlet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerusahaanList;
