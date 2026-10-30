import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
  History,
  CreditCard,
  Package,
  UserPlus,
  Search,
  Building2,
  FolderOpen,
  ChevronRight,
} from 'lucide-react';
import { dashboardApi } from '../../api';
import { formatTanggal } from '../../utils/nfcHelper';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRingkasan = async () => {
    try {
      const res = await dashboardApi.getRingkasan();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil ringkasan dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRingkasan();
  }, []);

  const quickMenus = [
    {
      to: '/scan',
      label: 'Scan NFC',
      icon: Wifi,
      gradient: 'from-[#3b5bfe] to-[#2541e8]',
      shadow: 'shadow-blue-500/30',
    },
    {
      to: '/transaksi',
      label: 'Cucian',
      icon: History,
      gradient: 'from-[#f41f4e] to-[#d9113f]',
      shadow: 'shadow-rose-500/30',
    },
    {
      to: '/members',
      label: 'Member',
      icon: Users,
      gradient: 'from-[#0ca678] to-[#088a62]',
      shadow: 'shadow-emerald-500/30',
    },
    {
      to: '/paket',
      label: 'Paket',
      icon: Package,
      gradient: 'from-[#0ea5e9] to-[#0284c7]',
      shadow: 'shadow-sky-500/30',
    },
    {
      to: '/perpanjangan',
      label: 'Isi Kuota',
      icon: CreditCard,
      gradient: 'from-[#10b981] to-[#059669]',
      shadow: 'shadow-emerald-500/30',
    },
    {
      to: '/members/tambah',
      label: 'Daftar Baru',
      icon: UserPlus,
      gradient: 'from-[#6366f1] to-[#4f46e5]',
      shadow: 'shadow-indigo-500/30',
    },
    ...(user?.role === 'SUPER_OWNER'
      ? [
          {
            to: '/perusahaan',
            label: 'Outlet SaaS',
            icon: Building2,
            gradient: 'from-[#8b5cf6] to-[#6d28d9]',
            shadow: 'shadow-purple-500/30',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3.5 w-full">
      {/* 1. CARD STATUS OPERASIONAL */}
      <div className="bg-white rounded-[24px] p-4 shadow-md border border-slate-300/90">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-extrabold text-slate-900">
              Status Operasional
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Hari Berjalan
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center items-stretch">
          {/* Kolom 1: Transaksi */}
          <div className="py-2.5 px-1 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-slate-900 leading-tight">
              {loading ? '-' : data?.hariIni?.jumlahTransaksi || 0}
            </div>
            <div className="text-[10px] font-bold text-emerald-800 mt-0.5">
              Transaksi
            </div>
          </div>

          {/* Kolom 2: Total Kg */}
          <div className="py-2.5 px-1 bg-rose-50/70 rounded-2xl border border-rose-200/80 flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-1.5 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-slate-900 leading-tight">
              {loading ? '-' : data?.hariIni?.totalKg || 0}
            </div>
            <div className="text-[10px] font-bold text-rose-800 mt-0.5">
              Total Kg
            </div>
          </div>

          {/* Kolom 3: Hampir Habis */}
          <div className="py-2.5 px-1 bg-amber-50/90 rounded-2xl border border-amber-300 flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1.5 shadow-sm">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-slate-900 leading-tight">
              {loading ? '-' : data?.statistik?.totalHampirHabis || 0}
            </div>
            <div className="text-[10px] font-bold text-amber-800 mt-0.5">
              Perlu Isi
            </div>
          </div>

          {/* Kolom 4: Member Aktif */}
          <div className="py-2.5 px-1 bg-sky-50/70 rounded-2xl border border-sky-200/80 flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-1.5 shadow-sm">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div className="text-base font-black text-slate-900 leading-tight">
              {loading ? '-' : data?.statistik?.totalMemberAktif || 0}
            </div>
            <div className="text-[10px] font-bold text-sky-800 mt-0.5">
              Member
            </div>
          </div>
        </div>
      </div>

      {/* 2. CARD MENU AKSES CEPAT (SQUIRCLE COLORFUL ICONS) */}
      <div className="bg-white rounded-[24px] p-4 shadow-md border border-slate-300/90">
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-xs font-extrabold text-slate-900">
              Menu Akses Cepat
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Pintas Navigasi
          </span>
        </div>

        <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
          {quickMenus.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div
                  className={`w-14 h-14 rounded-[18px] bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-lg ${item.shadow} mb-1.5 group-hover:scale-105 transition`}
                >
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. CARD PERINGATAN KUOTA HAMPIR HABIS */}
      {data?.memberHampirHabis && data.memberHampirHabis.length > 0 && (
        <div className="bg-white rounded-[24px] p-4 shadow-md border border-slate-300/90">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-extrabold text-slate-900">
                Perlu Perpanjangan Kuota
              </span>
            </div>
            <Link
              to="/members"
              className="text-[11px] font-bold text-indigo-600 flex items-center"
            >
              Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {data.memberHampirHabis.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 truncate">
                    {m.nama}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Sisa <strong className="text-amber-700">{m.sisaKuota} kg</strong> • s/d{' '}
                    {formatTanggal(m.tglBerakhir)}
                  </div>
                </div>
                <Link
                  to={`/members/${m.id}?tab=perpanjang`}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-extrabold shrink-0 shadow-sm"
                >
                  Isi Kuota
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
