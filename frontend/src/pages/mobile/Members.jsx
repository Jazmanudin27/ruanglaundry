import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RotateCw,
  Edit3,
  Trash2,
  Wifi,
  Scale,
  Phone,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Loader2,
} from "lucide-react";
import { memberApi } from "../../api";
import { formatTanggal } from "../../utils/nfcHelper";
import ModalScanKartu from "../../components/ModalScanKartu";

const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilterTab, setActiveFilterTab] = useState("semua");
  const [search, setSearch] = useState("");

  // Modal Ganti Kartu NFC
  const [gantiKartuMember, setGantiKartuMember] = useState(null);
  const [isModalGantiOpen, setIsModalGantiOpen] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await memberApi.getAll({ limit: 150 });
      if (res.success) {
        setMembers(res.data.members || []);
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
        `Hapus member "${nama}" beserta seluruh riwayat transaksinya?`,
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
        `Kartu NFC member ${gantiKartuMember.nama} berhasil dihubungkan ke UID: ${uidBaru}`,
      );
      setIsModalGantiOpen(false);
      setGantiKartuMember(null);
      fetchMembers();
    } catch (err) {
      alert(err.message || "Gagal mengganti kartu");
    }
  };

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

    return matchSearch && matchTab;
  });

  const tabs = [
    { key: "semua", label: "Semua", count: members.length },
    {
      key: "aktif",
      label: "Aman",
      count: members.filter(
        (m) => !m.isExpired && !m.isExpiringSoon && m.status === "AKTIF",
      ).length,
    },
    {
      key: "hampir-habis",
      label: "Hampir Habis",
      count: members.filter((m) => m.isExpiringSoon).length,
    },
    {
      key: "kedaluwarsa",
      label: "Expired",
      count: members.filter((m) => m.isExpired).length,
    },
    {
      key: "tanpa-kartu",
      label: "Tanpa NFC",
      count: members.filter((m) => !m.uidKartu).length,
    },
  ];

  return (
    <div className="space-y-3 w-full">
      {/* 1. Header & Tombol Tambah Member */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-300 shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-sm font-extrabold text-slate-900">
            Data Pelanggan Member
          </h1>
          <p className="text-[11px] text-slate-500">
            Total {members.length} pelanggan terdaftar
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={fetchMembers}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <Link
            to="/members/tambah"
            className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Daftar</span>
          </Link>
        </div>
      </div>

      {/* 2. Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama member, no WA, atau UID NFC..."
          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* 3. Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveFilterTab(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition ${
              activeFilterTab === t.key
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeFilterTab === t.key
                  ? "bg-white/25 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* 4. List Kartu Member Mobile */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-500 border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            Memuat daftar member...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
            Tidak ada member yang sesuai pencarian.
          </div>
        ) : (
          filteredList.map((m) => {
            const kuotaAwal = parseFloat(m.kuotaAwal || 0);
            const sisa = parseFloat(m.sisaKuota || 0);
            const pct =
              kuotaAwal > 0
                ? Math.min(100, Math.max(0, (sisa / kuotaAwal) * 100))
                : 0;
            const isExpired = m.isExpired;
            const isExpiringSoon = !isExpired && m.isExpiringSoon;

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-300 shadow-md space-y-2.5"
              >
                {/* Baris Atas */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/members/${m.id}`}
                      className="text-sm font-extrabold text-slate-900 hover:text-sky-600 truncate block"
                    >
                      {m.nama}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {m.noHp}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-sky-700">
                        {m.paket?.namaPaket || "Paket"}
                      </span>
                    </div>
                  </div>

                  {isExpired ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 shrink-0">
                      <AlertOctagon className="w-3 h-3" /> Expired
                    </span>
                  ) : isExpiringSoon ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3 h-3" /> Hampir Habis
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" /> Aktif
                    </span>
                  )}
                </div>

                {/* Baris Kuota & Progress Bar */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Sisa Kuota:{" "}
                      <strong className="text-slate-900 font-black">
                        {sisa.toFixed(1)} kg
                      </strong>{" "}
                      <span className="text-[10px] text-slate-400">
                        / {kuotaAwal.toFixed(1)} kg
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      s/d <strong>{formatTanggal(m.tglBerakhir)}</strong>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct <= 15
                          ? "bg-rose-500"
                          : pct <= 30
                            ? "bg-amber-500"
                            : "bg-sky-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Baris Info UID & Tombol Aksi */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGantiKartuMember(m);
                      setIsModalGantiOpen(true);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 ${
                      m.uidKartu
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    <Wifi className="w-3 h-3" />
                    {m.uidKartu ? m.uidKartu : "Pasang NFC"}
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Tombol Timbang Cepat */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          m.uidKartu ? `/scan?uid=${m.uidKartu}` : `/scan?memberId=${m.id}`,
                        )
                      }
                      className="px-2.5 py-1.5 bg-sky-600 text-white rounded-lg text-[11px] font-extrabold flex items-center gap-1"
                    >
                      <Scale className="w-3 h-3" />
                      Timbang
                    </button>

                    {/* Detail / Perpanjang */}
                    <Link
                      to={`/members/${m.id}`}
                      className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold"
                    >
                      Detail
                    </Link>

                    {/* Edit */}
                    <Link
                      to={`/members/${m.id}/edit`}
                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Link>

                    {/* Hapus */}
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id, m.nama)}
                      className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Ganti Kartu NFC */}
      <ModalScanKartu
        isOpen={isModalGantiOpen}
        onClose={() => {
          setIsModalGantiOpen(false);
          setGantiKartuMember(null);
        }}
        onSelectUid={handleGantiKartuSuccess}
        currentUid={gantiKartuMember?.uidKartu || ""}
      />
    </div>
  );
};

export default Members;
