import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wifi,
  Scale,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  RotateCw,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Layers,
} from "lucide-react";
import { dashboardApi } from "../../api";
import { formatTanggal } from "../../utils/nfcHelper";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchRingkasan = async () => {
    try {
      const res = await dashboardApi.getRingkasan();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Gagal mengambil ringkasan dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRingkasan();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRingkasan();
  };

  return (
    <div className="w-full space-y-2.5">
      {/* 1. TOP 4 COMPACT STATS CARDS (SMALL / SM) */}
      <div className="top-stats-grid">
        <div className="stat-card-colored stat-card-blue">
          <div>
            <div className="stat-colored-title">TRANSAKSI HARI INI</div>
            <div className="stat-colored-number">
              {loading ? "..." : data?.hariIni?.jumlahTransaksi || 0}
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <ShoppingBag size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-green">
          <div>
            <div className="stat-colored-title">TOTAL CUCIAN HARI INI</div>
            <div className="stat-colored-number">
              {loading ? "..." : data?.hariIni?.totalKg || 0}{" "}
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>kg</span>
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <Scale size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-purple">
          <div>
            <div className="stat-colored-title">MEMBER AKTIF</div>
            <div className="stat-colored-number">
              {loading ? "..." : data?.statistik?.totalMemberAktif || 0}
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <ShieldCheck size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-amber">
          <div>
            <div className="stat-colored-title">
              REMINDER MASA AKTIF (≤5 HARI)
            </div>
            <div className="stat-colored-number">
              {loading ? "..." : data?.statistik?.totalHampirHabis || 0}
            </div>
          </div>
          <div className="stat-colored-icon-box">
            <AlertTriangle size={16} />
          </div>
        </div>
      </div>

      {/* 2. PAGE TITLE STRIP COMPACT */}
      <div className="page-title-strip">
        <div className="page-title-left">
          <div className="page-title-icon">
            <Layers size={16} />
          </div>
          <div>
            <h2>Beranda & Operasional Outlet Laundry</h2>
            <p>
              Pusat operasional kasir, tap kartu NFC member kilat, dan
              monitoring kuota cucian
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RotateCw size={11} className={refreshing ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
          <Link to="/histori" className="btn btn-outline">
            <History size={11} /> Histori Member
          </Link>
          <Link to="/members/tambah" className="btn btn-primary">
            Tambah Member
          </Link>
        </div>
      </div>

      {/* 3. SCAN NFC BANNER COMPACT */}
      <div
        style={{
          background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
          borderRadius: "8px",
          padding: "14px 18px",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          boxShadow: "0 2px 8px rgba(2, 132, 199, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Wifi size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800 }}>
              Operasional Cepat: Tap Kartu NFC Member
            </div>
            <div style={{ fontSize: "0.72rem", color: "#e0f2fe" }}>
              Dekatkan kartu NFC ke reader (USB atau Android Web NFC) untuk
              langsung input timbangan berat cucian (kg).
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => navigate("/scan")}
            className="btn"
            style={{
              background: "#ffffff",
              color: "#0284c7",
              border: "none",
              fontWeight: 800,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Wifi size={12} color="#0284c7" /> Mulai Scan Kartu Sekarang
          </button>
          <Link
            to="/members"
            className="btn"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <Users size={12} /> Cari Member Manual
          </Link>
        </div>
      </div>

      {/* 4. DAFTAR MEMBER PERLU PERPANJANGAN COMPACT BORDERED TABLE */}
      <div className="table-container-card">
        <div
          style={{
            padding: "8px 12px",
            background: "#f8fafc",
            borderBottom: "1px solid #cbd5e1",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={13} color="#d97706" />
            <span
              style={{ fontSize: "0.74rem", fontWeight: 800, color: "#0f172a" }}
            >
              Member Hampir Habis (Kuota ≤ 10% atau Masa Aktif ≤ 7 Hari)
            </span>
          </div>

          <Link
            to="/members"
            style={{ fontSize: "0.68rem", fontWeight: 700, color: "#0284c7" }}
          >
            Lihat Semua Member →
          </Link>
        </div>

        {loading ? (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              fontSize: "0.72rem",
              color: "#64748b",
            }}
          >
            Memuat ringkasan...
          </div>
        ) : !data?.memberHampirHabis || data.memberHampirHabis.length === 0 ? (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              fontSize: "0.72rem",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <CheckCircle2 size={15} color="#059669" />
            <span>
              Seluruh kuota dan masa aktif member saat ini dalam kondisi aman.
            </span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="td-center" style={{ width: "32px" }}>
                  NO
                </th>
                <th>NAMA MEMBER</th>
                <th>KARTU RFID</th>
                <th>PAKET</th>
                <th className="td-center">SISA KUOTA</th>
                <th>STATUS MASA AKTIF</th>
                <th className="td-center" style={{ width: "160px" }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {data.memberHampirHabis.slice(0, 8).map((m, idx) => (
                <tr key={m.id}>
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
                    <strong style={{ color: "#0f172a", fontSize: "0.74rem" }}>
                      {m.nama}
                    </strong>
                    <div style={{ fontSize: "0.64rem", color: "#64748b" }}>
                      {m.noHp}
                    </div>
                  </td>
                  <td>
                    {m.uidKartu ? (
                      <code
                        style={{
                          fontSize: "0.68rem",
                          color: "#0284c7",
                          background: "#f1f5f9",
                          padding: "1px 5px",
                          borderRadius: "3px",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        {m.uidKartu}
                      </code>
                    ) : (
                      <span style={{ fontSize: "0.64rem", color: "#94a3b8" }}>
                        -
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {m.paket?.namaPaket || "-"}
                    </span>
                  </td>
                  <td className="td-center">
                    <strong
                      style={{
                        color: m.sisaKuota <= 0 ? "#b91c1c" : "#b45309",
                        fontSize: "0.76rem",
                      }}
                    >
                      {m.sisaKuota} kg
                    </strong>
                  </td>
                  <td>
                    {m.statusBadge === "MERAH" ? (
                      <span
                        className="badge badge-danger"
                        style={{ fontSize: "0.64rem" }}
                      >
                        🔴 {m.isExpired ? "Kedaluwarsa" : "Tersisa ≤ 1 Hari"}
                      </span>
                    ) : (
                      <span
                        className="badge badge-warning"
                        style={{ fontSize: "0.64rem" }}
                      >
                        🟡 Tersisa {m.daysLeft} Hari (3-5 Hari)
                      </span>
                    )}
                  </td>
                  <td className="td-center">
                    <div className="flex items-center justify-center gap-1">
                      {m.noHp && (
                        <a
                          href={`https://wa.me/${m.noHp.replace(/^0/, "62")}?text=${encodeURIComponent(
                            `Halo Kak *${m.nama}*,\n\nKami dari *Basmalah Wash* ingin menginfokan bahwa masa aktif paket laundry Kakak tersisa *${m.daysLeft || 0} hari* (Sisa kuota: *${m.sisaKuota} kg*).\n\nSilakan lakukan perpanjangan paket agar dapat terus menikmati layanan laundry kami. Terima kasih! 🙏`,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline"
                          style={{
                            padding: "2px 6px",
                            fontSize: "0.64rem",
                            color: "#059669",
                            borderColor: "#6ee7b7",
                          }}
                          title="Hubungi via WhatsApp"
                        >
                          Hubungi WA
                        </a>
                      )}
                      <Link
                        to={`/members/${m.id}?tab=perpanjang`}
                        className="btn btn-primary"
                        style={{ padding: "2px 8px", fontSize: "0.64rem" }}
                      >
                        Perpanjang
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
