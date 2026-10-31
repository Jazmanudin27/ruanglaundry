import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  RotateCw,
  Eye,
  Edit3,
  Trash2,
  Wifi,
  Scale,
  Calendar,
  Clock,
  X,
  Phone,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CreditCard,
  Package,
  Layers,
  CheckCircle2,
  Check,
  Loader2,
} from "lucide-react";
import { memberApi, paketApi } from "../../api";
import { formatTanggal, formatRupiah } from "../../utils/nfcHelper";
import ModalScanKartu from "../../components/ModalScanKartu";

export default function Members() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [pakets, setPakets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Tab
  const [activeFilterTab, setActiveFilterTab] = useState("semua");
  const [search, setSearch] = useState("");
  const [filterPaket, setFilterPaket] = useState("Semua Paket");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [filterKartu, setFilterKartu] = useState("Semua Kartu");

  // Modal Detail Member
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modal Ganti Kartu NFC
  const [gantiKartuMember, setGantiKartuMember] = useState(null);
  const [isModalGantiOpen, setIsModalGantiOpen] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const [resMembers, resPakets] = await Promise.all([
        memberApi.getAll({ limit: 100 }),
        paketApi.getAll(false),
      ]);

      if (resMembers.success) {
        setMembers(resMembers.data.members || []);
      }
      if (resPakets.success) {
        setPakets(resPakets.data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil member:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id, nama) => {
    if (
      window.confirm(
        `Yakin ingin menghapus member "${nama}"? Semua riwayat transaksi akan ikut terhapus.`,
      )
    ) {
      try {
        await memberApi.delete(id);
        fetchMembers();
      } catch (err) {
        alert(err.message || "Gagal menghapus member");
      }
    }
  };

  const handleGantiKartuSuccess = async (uidBaru) => {
    if (!gantiKartuMember) return;
    try {
      await memberApi.gantiKartu(gantiKartuMember.id, uidBaru);
      alert(
        `Kartu NFC member ${gantiKartuMember.nama} berhasil diganti ke UID: ${uidBaru}`,
      );
      setIsModalGantiOpen(false);
      setGantiKartuMember(null);
      fetchMembers();
    } catch (err) {
      alert(err.message || "Gagal mengganti kartu");
    }
  };

  // Logic Filtering
  const filteredList = members.filter((m) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      m.nama?.toLowerCase().includes(q) ||
      m.noHp?.toLowerCase().includes(q) ||
      m.uidKartu?.toLowerCase().includes(q) ||
      m.paket?.namaPaket?.toLowerCase().includes(q);

    const matchTab =
      activeFilterTab === "semua"
        ? true
        : activeFilterTab === "aktif"
          ? !m.isExpired && !m.isExpiringSoon && m.status === "AKTIF"
          : activeFilterTab === "hampir-habis"
            ? m.isExpiringSoon
            : activeFilterTab === "kedaluwarsa"
              ? m.isExpired
              : activeFilterTab === "tanpa-kartu"
                ? !m.uidKartu
                : true;

    const matchPaket =
      filterPaket === "Semua Paket" ? true : m.paketId === filterPaket;
    const matchStatus =
      filterStatus === "Semua Status"
        ? true
        : filterStatus === "Aktif"
          ? !m.isExpired && m.status === "AKTIF"
          : filterStatus === "Kedaluwarsa"
            ? m.isExpired
            : filterStatus === "Hampir Habis"
              ? m.isExpiringSoon
              : true;

    const matchKartu =
      filterKartu === "Semua Kartu"
        ? true
        : filterKartu === "Punya Kartu NFC"
          ? Boolean(m.uidKartu)
          : filterKartu === "Tanpa Kartu"
            ? !m.uidKartu
            : true;

    return matchSearch && matchTab && matchPaket && matchStatus && matchKartu;
  });

  // Counters untuk top stats cards
  const countAktif = members.filter(
    (m) => !m.isExpired && m.status === "AKTIF",
  ).length;
  const countHampirHabis = members.filter((m) => m.isExpiringSoon).length;
  const countPunyaKartu = members.filter((m) => Boolean(m.uidKartu)).length;

  return (
    <div className="w-full">
      {/* 1. TOP 4 COMPACT COLORED STATS CARDS (SMALL / SM) */}
      <div className="top-stats-grid">
        <div className="stat-card-colored stat-card-blue">
          <div>
            <div className="stat-colored-title">TOTAL MEMBER TERDAFTAR</div>
            <div className="stat-colored-number">{members.length}</div>
          </div>
          <div className="stat-colored-icon-box">
            <Users size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-green">
          <div>
            <div className="stat-colored-title">MEMBER AKTIF</div>
            <div className="stat-colored-number">{countAktif}</div>
          </div>
          <div className="stat-colored-icon-box">
            <ShieldCheck size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-amber">
          <div>
            <div className="stat-colored-title">
              PERLU PERPANJANGAN (≤7 HARI)
            </div>
            <div className="stat-colored-number">{countHampirHabis}</div>
          </div>
          <div className="stat-colored-icon-box">
            <Clock size={16} />
          </div>
        </div>

        <div className="stat-card-colored stat-card-purple">
          <div>
            <div className="stat-colored-title">KARTU NFC TERHUBUNG</div>
            <div className="stat-colored-number">{countPunyaKartu}</div>
          </div>
          <div className="stat-colored-icon-box">
            <Wifi size={16} />
          </div>
        </div>
      </div>

      {/* 2. TITLE STRIP COMPACT (SMALL / SM) */}
      <div className="page-title-strip">
        <div className="page-title-left">
          <div className="page-title-icon">
            <Users size={16} />
          </div>
          <div>
            <h2>Data Induk Member & Kuota Laundry</h2>
            <p>
              Kelola biodata member, UID kartu NFC, paket kuota kg, sisa masa
              aktif, dan riwayat cucian
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={fetchMembers}
          >
            <RotateCw size={11} /> Refresh
          </button>

          <Link to="/members/tambah" className="btn btn-primary">
            Tambah Member
          </Link>
        </div>
      </div>

      {/* 3. TAB FILTER BAR COMPACT (SMALL / SM) */}
      <div className="tab-filter-bar">
        <button
          className={`tab-btn ${activeFilterTab === "semua" ? "active" : ""}`}
          onClick={() => setActiveFilterTab("semua")}
        >
          <Users size={11} /> Semua Member ({members.length})
        </button>

        <button
          className={`tab-btn ${activeFilterTab === "aktif" ? "active" : ""}`}
          onClick={() => setActiveFilterTab("aktif")}
        >
          <ShieldCheck size={11} /> Member Aktif ({countAktif})
        </button>

        <button
          className={`tab-btn ${activeFilterTab === "hampir-habis" ? "active" : ""}`}
          onClick={() => setActiveFilterTab("hampir-habis")}
        >
          <Clock size={11} /> Hampir Habis ({countHampirHabis})
        </button>

        <button
          className={`tab-btn ${activeFilterTab === "kedaluwarsa" ? "active" : ""}`}
          onClick={() => setActiveFilterTab("kedaluwarsa")}
        >
          <AlertOctagon size={11} /> Kedaluwarsa
        </button>

        <button
          className={`tab-btn ${activeFilterTab === "tanpa-kartu" ? "active" : ""}`}
          onClick={() => setActiveFilterTab("tanpa-kartu")}
        >
          <Wifi size={11} /> Tanpa Kartu NFC
        </button>
      </div>

      {/* 4. FILTER SEARCH BAR STRIP COMPACT (SMALL / SM) */}
      <div className="filter-search-box">
        <div className="filter-search-input">
          <Search size={13} color="#94a3b8" />
          <input
            type="text"
            placeholder="Cari nama member, no HP, UID kartu NFC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterPaket}
          onChange={(e) => setFilterPaket(e.target.value)}
        >
          <option value="Semua Paket">Semua Paket</option>
          {pakets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.namaPaket}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="Semua Status">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Hampir Habis">Hampir Habis</option>
          <option value="Kedaluwarsa">Kedaluwarsa</option>
        </select>

        <select
          className="filter-select"
          value={filterKartu}
          onChange={(e) => setFilterKartu(e.target.value)}
        >
          <option value="Semua Kartu">Semua Kartu</option>
          <option value="Punya Kartu NFC">Punya Kartu NFC</option>
          <option value="Tanpa Kartu">Tanpa Kartu</option>
        </select>
      </div>

      {/* 5. DATA TABLE BORDERED COMPACT (SMALL / SM) */}
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
            Memuat data member...
          </div>
        ) : filteredList.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "0.74rem",
            }}
          >
            Tidak ada member yang cocok dengan filter pencarian.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="td-center" style={{ width: "32px" }}>
                  NO
                </th>
                <th>NAMA MEMBER & WHATSAPP</th>
                <th>KARTU RFID</th>
                <th>PAKET</th>
                <th className="td-center">PEMAKAIAN / KUOTA</th>
                <th className="td-center">SISA KUOTA</th>
                <th>MASA AKTIF (30 HARI)</th>
                <th className="td-center">STATUS</th>
                <th className="td-center" style={{ width: "135px" }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((row, idx) => {
                const isExpired = row.isExpired;
                const isExpiringSoon = row.isExpiringSoon;

                return (
                  <tr key={row.id || idx}>
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

                    {/* Nama Member & No HP */}
                    <td>
                      <div
                        onClick={() => {
                          setSelectedMember(row);
                          setIsDetailModalOpen(true);
                        }}
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          cursor: "pointer",
                          fontSize: "0.76rem",
                        }}
                        className="hover:text-sky-600 transition"
                      >
                        {row.nama}
                      </div>
                      <div
                        style={{
                          fontSize: "0.64rem",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <Phone size={9} color="#94a3b8" />
                        <a
                          href={`https://wa.me/${row.noHp.replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-600"
                        >
                          {row.noHp}
                        </a>
                      </div>
                    </td>

                    {/* UID Kartu NFC */}
                    <td>
                      {row.uidKartu ? (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            background: "#f1f5f9",
                            padding: "1.5px 5px",
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
                            {row.uidKartu}
                          </code>
                        </div>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.64rem",
                            color: "#94a3b8",
                            fontStyle: "italic",
                          }}
                        >
                          Belum Ada Kartu
                        </span>
                      )}
                    </td>

                    {/* Paket Laundry */}
                    <td>
                      <span className="badge badge-info">
                        {row.paket?.namaPaket || "Paket Standar"}
                      </span>
                    </td>

                    {/* Pemakaian & Kuota Awal */}
                    <td className="td-center">
                      <div style={{ fontWeight: 700, fontSize: "0.74rem", color: "#475569" }}>
                        {row.totalPemakaian || 0} kg
                      </div>
                      <div style={{ fontSize: "0.62rem", color: "#94a3b8" }}>
                        dari awal {row.kuotaAwal} kg
                      </div>
                    </td>

                    {/* Sisa Kuota */}
                    <td className="td-center">
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: "0.78rem",
                          color:
                            row.sisaKuota <= 0
                              ? "#b91c1c"
                              : row.sisaKuota <= 5
                                ? "#b45309"
                                : "#0284c7",
                        }}
                      >
                        {row.sisaKuota}{" "}
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 500,
                            color: "#64748b",
                          }}
                        >
                          kg
                        </span>
                      </div>
                      {row.sisaKuota <= 0 && (
                        <span style={{ fontSize: "0.58rem", color: "#b91c1c", fontWeight: 700 }}>
                          Habis
                        </span>
                      )}
                    </td>

                    {/* Masa Berlaku (30 Hari Sejak Cuci Pertama) */}
                    <td>
                      {!row.tglMulai ? (
                        <div>
                          <div style={{ fontWeight: 700, color: "#0284c7", fontSize: "0.68rem" }}>
                            Belum Dimulai
                          </div>
                          <div style={{ fontSize: "0.62rem", color: "#64748b" }}>
                            Aktif 30 hari saat cuci pertama
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#0f172a",
                              fontSize: "0.7rem",
                            }}
                          >
                            s/d {formatTanggal(row.tglBerakhir)}
                          </div>
                          <div
                            style={{
                              fontSize: "0.64rem",
                              color:
                                row.statusBadge === "MERAH"
                                  ? "#b91c1c"
                                  : row.statusBadge === "KUNING"
                                    ? "#b45309"
                                    : "#059669",
                              fontWeight: 700,
                            }}
                          >
                            {row.isExpired
                              ? `Lewat ${Math.abs(row.daysLeft)} hari`
                              : `Sisa ${row.daysLeft} hari`}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status Badge 3 Warna Basmalah Wash */}
                    <td className="td-center">
                      {!row.tglMulai ? (
                        <span className="badge badge-info" title="Menunggu cucian pertama untuk mengaktifkan masa 30 hari">
                          🔵 Belum Mulai
                        </span>
                      ) : row.statusBadge === "MERAH" ? (
                        <span className="badge badge-danger" title="Masa aktif tersisa 1 hari atau sudah berakhir">
                          🔴 {row.isExpired ? "Kedaluwarsa" : "Sisa 1 Hari"}
                        </span>
                      ) : row.statusBadge === "KUNING" ? (
                        <span className="badge badge-warning" title="Masa aktif tersisa 3-5 hari (Perlu dihubungi)">
                          🟡 Sisa {row.daysLeft} Hari
                        </span>
                      ) : (
                        <span className="badge badge-success" title="Paket masih aktif">
                          🟢 Aktif
                        </span>
                      )}
                    </td>

                    {/* Aksi Buttons (Compact 24x24 / SM) */}
                    <td className="td-center">
                      <div
                        style={{
                          display: "inline-flex",
                          gap: "4px",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* Input Cucian Kilat */}
                        <button
                          className="btn-action btn-action-warning"
                          onClick={() =>
                            navigate(
                              row.uidKartu
                                ? `/scan?uid=${row.uidKartu}`
                                : `/scan?memberId=${row.id}`
                            )
                          }
                          title="Input Cucian Kilat (Timbang Berat)"
                        >
                          <Scale size={11} />
                        </button>

                        {/* Lihat Detail Member */}
                        <button
                          className="btn-action btn-action-view"
                          onClick={() => {
                            setSelectedMember(row);
                            setIsDetailModalOpen(true);
                          }}
                          title="Lihat Detail Member"
                        >
                          <Eye size={11} />
                        </button>

                        {/* Ganti Kartu NFC */}
                        <button
                          className="btn-action"
                          style={{
                            color: "#6d28d9",
                            background: "#f3e8ff",
                            borderColor: "#d8b4fe",
                          }}
                          onClick={() => {
                            setGantiKartuMember(row);
                            setIsModalGantiOpen(true);
                          }}
                          title="Ganti / Pasang Kartu NFC"
                        >
                          <Wifi size={11} />
                        </button>

                        {/* Edit Member */}
                        <Link
                          to={`/members/${row.id}/edit`}
                          className="btn-action btn-action-edit"
                          title="Ubah Data Member"
                        >
                          <Edit3 size={11} />
                        </Link>

                        {/* Hapus Member */}
                        <button
                          className="btn-action btn-action-delete"
                          onClick={() => handleDelete(row.id, row.nama)}
                          title="Hapus Member"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 6. MODAL DETAIL MEMBER COMPACT (SMALL / SM) */}
      {isDetailModalOpen && selectedMember && (
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
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Users size={15} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800 }}>
                  Detail Lengkap Member Laundry
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

            <div style={{ padding: "14px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #0284c7, #0369a1)",
                    color: "#fff",
                    fontSize: "1rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedMember.nama.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {selectedMember.nama}
                  </h4>
                  <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                    {selectedMember.noHp}
                  </div>
                  <div style={{ marginTop: "2px" }}>
                    <span className="badge badge-info">
                      {selectedMember.paket?.namaPaket || "Paket Reguler"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                  fontSize: "0.72rem",
                  background: "#f8fafc",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <span
                    style={{
                      color: "#64748b",
                      display: "block",
                      fontSize: "0.64rem",
                    }}
                  >
                    UID KARTU NFC
                  </span>
                  <strong style={{ color: "#0284c7", fontFamily: "monospace" }}>
                    {selectedMember.uidKartu || "Tidak Terhubung"}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      color: "#64748b",
                      display: "block",
                      fontSize: "0.64rem",
                    }}
                  >
                    STATUS MEMBER
                  </span>
                  <strong
                    style={{
                      color: selectedMember.isExpired ? "#b91c1c" : "#059669",
                    }}
                  >
                    {selectedMember.isExpired
                      ? "KEDALUWARSA"
                      : selectedMember.status}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      color: "#64748b",
                      display: "block",
                      fontSize: "0.64rem",
                    }}
                  >
                    SISA KUOTA CUCIAN
                  </span>
                  <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>
                    {selectedMember.sisaKuota} kg
                  </strong>
                  <span style={{ fontSize: "0.62rem", color: "#64748b" }}>
                    {" "}
                    / {selectedMember.kuotaAwal} kg
                  </span>
                </div>

                <div>
                  <span
                    style={{
                      color: "#64748b",
                      display: "block",
                      fontSize: "0.64rem",
                    }}
                  >
                    TOTAL PEMAKAIAN
                  </span>
                  <strong style={{ fontSize: "0.85rem", color: "#475569" }}>
                    {selectedMember.totalPemakaian} kg
                  </strong>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <span
                    style={{
                      color: "#64748b",
                      display: "block",
                      fontSize: "0.64rem",
                    }}
                  >
                    MASA BERLAKU PAKET
                  </span>
                  <strong>
                    {formatTanggal(selectedMember.tglMulai)} s/d{" "}
                    {formatTanggal(selectedMember.tglBerakhir)}
                  </strong>
                  <span
                    style={{
                      color: selectedMember.isExpired ? "#b91c1c" : "#059669",
                      marginLeft: "5px",
                    }}
                  >
                    (
                    {selectedMember.isExpired
                      ? `Kedaluwarsa ${Math.abs(selectedMember.daysLeft)} hari lalu`
                      : `Sisa ${selectedMember.daysLeft} hari`}
                    )
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
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
                onClick={() => {
                  setIsDetailModalOpen(false);
                  navigate(`/members/${selectedMember.id}`);
                }}
              >
                Buka Profil & Riwayat Lengkap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ganti Kartu NFC */}
      {gantiKartuMember && (
        <ModalScanKartu
          isOpen={isModalGantiOpen}
          onClose={() => {
            setIsModalGantiOpen(false);
            setGantiKartuMember(null);
          }}
          onSelectUid={handleGantiKartuSuccess}
          currentUid={gantiKartuMember.uidKartu}
        />
      )}
    </div>
  );
}
