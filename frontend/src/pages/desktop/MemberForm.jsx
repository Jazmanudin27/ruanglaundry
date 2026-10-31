import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Users,
  Wifi,
  ArrowLeft,
  Save,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { memberApi, paketApi } from "../../api";
import ModalScanKartu from "../../components/ModalScanKartu";
import { formatRupiah } from "../../utils/nfcHelper";

const MemberForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [uidKartu, setUidKartu] = useState("");
  const [paketId, setPaketId] = useState("");
  const [status, setStatus] = useState("AKTIF");

  const [pakets, setPakets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isModalScanOpen, setIsModalScanOpen] = useState(false);

  useEffect(() => {
    // Ambil daftar paket
    paketApi.getAll(false).then((res) => {
      if (res.success && res.data.length > 0) {
        setPakets(res.data);
        if (!isEdit) {
          setPaketId(res.data[0].id);
        }
      }
    });

    if (isEdit) {
      setLoading(true);
      memberApi
        .getById(id)
        .then((res) => {
          if (res.success) {
            const m = res.data;
            setNama(m.nama);
            setNoHp(m.noHp);
            setUidKartu(m.uidKartu || "");
            setPaketId(m.paketId);
            setStatus(m.status);
          }
        })
        .catch((err) => {
          setErrorMsg(err.message || "Gagal mengambil data member");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (isEdit) {
        await memberApi.update(id, {
          nama,
          noHp,
          uidKartu: uidKartu || null,
          status,
        });
        alert("Data member berhasil diperbarui!");
      } else {
        await memberApi.create({
          nama,
          noHp,
          uidKartu: uidKartu || null,
          paketId,
        });
        alert("Member baru berhasil didaftarkan!");
      }
      navigate("/members");
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const selectedPaket = pakets.find((p) => p.id === paketId);

  return (
    <div className="space-y-3 w-full">
      {/* Header Banner Compact */}
      <div className="bg-[#0284c7] text-white rounded-lg p-3 sm:p-3.5 shadow-sm flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight leading-tight">
              {isEdit ? "Ubah Data Member" : "Pendaftaran Member Baru"}
            </h1>
            <p className="text-[11px] text-sky-100 leading-tight">
              {isEdit
                ? "Perbarui informasi kontak dan kartu member"
                : "Masukkan identitas dan hubungkan kartu NFC"}
            </p>
          </div>
        </div>

        <Link
          to="/members"
          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs font-bold flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid 2 Kolom Full Width 100% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full items-start">
        {/* Kolom Kiri: Form Input Data (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nama Member */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Dewi Lestari"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Nomor HP / WhatsApp */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor HP / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Contoh: 087811223344"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Hubungkan Kartu NFC */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                UID Kartu NFC (Tap atau Ketik)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={uidKartu}
                  onChange={(e) => setUidKartu(e.target.value.toUpperCase())}
                  placeholder="Tempelkan kartu ke reader USB atau ketik UID..."
                  className="flex-1 px-3 py-2 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setIsModalScanOpen(true)}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 transition"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  Scan Kartu
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Bisa dikosongkan jika kartu fisik belum tersedia saat
                pendaftaran.
              </p>
            </div>

            {/* Pilihan Paket Laundry (Hanya untuk Member Baru) */}
            {!isEdit && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Paket Laundry Awal *
                </label>
                <select
                  required
                  value={paketId}
                  onChange={(e) => setPaketId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {pakets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.namaPaket} — Kuota {p.kuotaKg} kg, Durasi{" "}
                      {p.durasiHari} Hari ({formatRupiah(p.harga)})
                    </option>
                  ))}
                </select>

                {selectedPaket && (
                  <div className="mt-2 p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-800 flex items-center justify-between">
                    <div>
                      <span>
                        Kuota: <strong>{selectedPaket.kuotaKg} kg</strong>
                      </span>
                      <p className="text-[10px] text-sky-600 mt-0.5">
                        *Masa aktif 30 hari otomatis tercatat sejak penyerahan pakaian pertama
                      </p>
                    </div>
                    <span className="font-extrabold text-sm text-sky-900">
                      {formatRupiah(selectedPaket.harga)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Status Member (Hanya untuk Edit) */}
            {isEdit && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Member
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF (Dibekukan)</option>
                </select>
              </div>
            )}

            {/* Tombol Simpan & Batal */}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <Link
                to="/members"
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                {loading
                  ? "Menyimpan..."
                  : isEdit
                    ? "Simpan Perubahan"
                    : "Daftarkan Member"}
              </button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Live Preview Kartu Member (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-lg p-4 shadow-md border border-slate-700/80 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {uidKartu ? `NFC: ${uidKartu}` : "BELUM ADA KARTU"}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === "AKTIF" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"}`}
              >
                {status}
              </span>
            </div>

            <h3 className="text-base font-black text-white truncate leading-tight">
              {nama || "Nama Member"}
            </h3>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              {noHp || "08xxxxxxxxxx"}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Tipe:</span>
              <span className="font-bold text-sky-300">
                {isEdit
                  ? "Member Terdaftar"
                  : selectedPaket?.namaPaket || "Paket Member"}
              </span>
            </div>
          </div>

          {/* Card Info Bantuan */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-3 text-xs text-sky-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-sky-800">
              <Sparkles className="w-3.5 h-3.5" />
              Petunjuk Pengisian:
            </div>
            <ul className="list-disc list-inside text-[11px] text-sky-800 space-y-1">
              <li>
                UID kartu otomatis terisi jika Anda tap kartu pada USB reader.
              </li>
              <li>
                Pastikan paket kuota awal sesuai dengan pendaftaran santri.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Scanner */}
      <ModalScanKartu
        isOpen={isModalScanOpen}
        onClose={() => setIsModalScanOpen(false)}
        onSelectUid={(uid) => setUidKartu(uid)}
        currentUid={uidKartu}
      />
    </div>
  );
};

export default MemberForm;
