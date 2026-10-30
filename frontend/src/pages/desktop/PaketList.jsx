import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  RotateCw,
  AlertCircle,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { paketApi } from "../../api";
import { formatRupiah } from "../../utils/nfcHelper";

const PaketList = () => {
  const [pakets, setPakets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // State Modal Tambah/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPaketId, setEditPaketId] = useState(null);
  const [formData, setFormData] = useState({
    namaPaket: "",
    kuotaKg: "",
    durasiHari: "",
    harga: "",
    aktif: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPakets = async () => {
    setLoading(true);
    try {
      const res = await paketApi.getAll(true);
      if (res.success) {
        setPakets(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || "Gagal memuat paket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPakets();
  }, []);

  const handleOpenAdd = () => {
    setEditPaketId(null);
    setFormData({
      namaPaket: "",
      kuotaKg: "",
      durasiHari: "",
      harga: "",
      aktif: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditPaketId(p.id);
    setFormData({
      namaPaket: p.namaPaket,
      kuotaKg: p.kuotaKg.toString(),
      durasiHari: p.durasiHari.toString(),
      harga: p.harga.toString(),
      aktif: p.aktif,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        namaPaket: formData.namaPaket,
        kuotaKg: parseFloat(formData.kuotaKg),
        durasiHari: parseInt(formData.durasiHari),
        harga: parseInt(formData.harga),
        aktif: formData.aktif,
      };

      if (editPaketId) {
        await paketApi.update(editPaketId, payload);
      } else {
        await paketApi.create(payload);
      }

      setIsModalOpen(false);
      fetchPakets();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan paket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (
      window.confirm(`Yakin ingin menghapus / menonaktifkan paket "${nama}"?`)
    ) {
      try {
        await paketApi.delete(id);
        fetchPakets();
      } catch (err) {
        alert(err.message || "Gagal menghapus paket");
      }
    }
  };

  return (
    <div className="w-full">
      {/* Title Strip Compact */}
      <div className="page-title-strip">
        <div className="page-title-left">
          <div className="page-title-icon">
            <Package size={16} />
          </div>
          <div>
            <h2>Data Master Paket Laundry</h2>
            <p>
              Atur besaran kuota (kg), durasi masa aktif (hari), dan tarif harga
              paket member
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={fetchPakets}
          >
            <RotateCw size={11} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={11} /> + Tambah Paket Baru
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-xs mb-2.5 flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabel Paket Bordered Compact */}
      <div className="table-container-card">
        {loading ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              fontSize: "0.74rem",
              color: "#64748b",
            }}
          >
            <Loader2
              size={18}
              className="animate-spin inline mr-1.5 text-sky-600"
            />{" "}
            Memuat daftar paket...
          </div>
        ) : pakets.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              fontSize: "0.74rem",
              color: "#64748b",
            }}
          >
            Belum ada paket laundry. Silakan klik "+ Tambah Paket Baru".
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="td-center" style={{ width: "32px" }}>
                  NO
                </th>
                <th>NAMA PAKET</th>
                <th className="td-center">KUOTA BERAT</th>
                <th className="td-center">MASA AKTIF</th>
                <th>HARGA PAKET</th>
                <th className="td-center">STATUS</th>
                <th className="td-center" style={{ width: "90px" }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {pakets.map((p, idx) => (
                <tr key={p.id}>
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
                    <strong style={{ color: "#0f172a", fontSize: "0.76rem" }}>
                      {p.namaPaket}
                    </strong>
                  </td>
                  <td className="td-center">
                    <strong style={{ color: "#0284c7", fontSize: "0.76rem" }}>
                      {p.kuotaKg} kg
                    </strong>
                  </td>
                  <td
                    className="td-center"
                    style={{ fontSize: "0.7rem", color: "#475569" }}
                  >
                    {p.durasiHari} Hari
                  </td>
                  <td
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                      fontSize: "0.76rem",
                    }}
                  >
                    {formatRupiah(p.harga)}
                  </td>
                  <td className="td-center">
                    <span
                      className={`badge ${p.aktif ? "badge-success" : "badge-danger"}`}
                    >
                      {p.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="td-center">
                    <div
                      style={{
                        display: "inline-flex",
                        gap: "4px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        className="btn-action btn-action-edit"
                        onClick={() => handleOpenEdit(p)}
                        title="Ubah Paket"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        className="btn-action btn-action-delete"
                        onClick={() => handleDelete(p.id, p.namaPaket)}
                        title="Hapus Paket"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Add / Edit Paket Compact */}
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
              maxWidth: "420px",
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
              <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800 }}>
                {editPaketId ? "Ubah Data Paket" : "Tambah Paket Baru"}
              </h3>
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
              <div style={{ marginBottom: "10px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "#334155",
                    textTransform: "uppercase",
                    marginBottom: "3px",
                  }}
                >
                  Nama Paket *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaPaket}
                  onChange={(e) =>
                    setFormData({ ...formData, namaPaket: e.target.value })
                  }
                  placeholder="Contoh: Paket Reguler 25kg"
                  style={{
                    width: "100%",
                    padding: "5px 8px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "5px",
                    fontSize: "0.74rem",
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#334155",
                      textTransform: "uppercase",
                      marginBottom: "3px",
                    }}
                  >
                    Kuota (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.kuotaKg}
                    onChange={(e) =>
                      setFormData({ ...formData, kuotaKg: e.target.value })
                    }
                    placeholder="25.0"
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "5px",
                      fontSize: "0.74rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#334155",
                      textTransform: "uppercase",
                      marginBottom: "3px",
                    }}
                  >
                    Durasi (Hari) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.durasiHari}
                    onChange={(e) =>
                      setFormData({ ...formData, durasiHari: e.target.value })
                    }
                    placeholder="30"
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "5px",
                      fontSize: "0.74rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "#334155",
                    textTransform: "uppercase",
                    marginBottom: "3px",
                  }}
                >
                  Harga Paket (Rp) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.harga}
                  onChange={(e) =>
                    setFormData({ ...formData, harga: e.target.value })
                  }
                  placeholder="160000"
                  style={{
                    width: "100%",
                    padding: "5px 8px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "5px",
                    fontSize: "0.74rem",
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "14px",
                }}
              >
                <input
                  type="checkbox"
                  id="paketAktif"
                  checked={formData.aktif}
                  onChange={(e) =>
                    setFormData({ ...formData, aktif: e.target.checked })
                  }
                />
                <label
                  htmlFor="paketAktif"
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  Paket Aktif & Ditampilkan
                </label>
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
                  {submitting ? "Menyimpan..." : "Simpan Paket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaketList;
