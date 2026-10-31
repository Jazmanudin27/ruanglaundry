import React from 'react';
import { Wifi, Calendar, Scale, Clock, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { formatTanggal } from '../utils/nfcHelper';

const KartuKuota = ({ member }) => {
  if (!member) return null;

  const kuotaAwal = parseFloat(member.kuotaAwal || 0);
  const sisaKuota = parseFloat(member.sisaKuota || 0);
  const totalPemakaian = parseFloat(member.totalPemakaian || Math.max(0, kuotaAwal - sisaKuota));
  const persentaseSisa = kuotaAwal > 0 ? Math.min(100, Math.max(0, (sisaKuota / kuotaAwal) * 100)) : 0;

  // Status visual sesuai ketentuan Basmalah Wash (Hijau: Aktif, Kuning: 3-5 hari, Merah: <=1 hari / Expired)
  const isBelumMulai = !member.tglMulai || !member.tglBerakhir;
  const isExpired = member.isExpired || (member.daysLeft !== undefined && member.daysLeft < 0);
  const daysLeft = member.daysLeft;

  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let badgeLabel = '🟢 Paket Aktif';
  let badgeIcon = ShieldCheck;

  if (isBelumMulai) {
    badgeColor = 'bg-sky-500/20 text-sky-300 border-sky-400/40';
    badgeLabel = '🔵 Menunggu Cuci 1';
    badgeIcon = Clock;
  } else if (isExpired) {
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    badgeLabel = '🔴 Kedaluwarsa';
    badgeIcon = AlertOctagon;
  } else if (daysLeft <= 1) {
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    badgeLabel = daysLeft === 0 ? '🔴 Habis Hari Ini' : '🔴 Sisa 1 Hari';
    badgeIcon = AlertOctagon;
  } else if (daysLeft >= 2 && daysLeft <= 5) {
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    badgeLabel = `🟡 Sisa ${daysLeft} Hari`;
    badgeIcon = AlertTriangle;
  } else {
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    badgeLabel = `🟢 Aktif (${daysLeft} Hari)`;
    badgeIcon = ShieldCheck;
  }

  const BadgeIconComponent = badgeIcon;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-lg p-3.5 sm:p-4 shadow-md border border-slate-700/80 relative overflow-hidden w-full">
      {/* Background Decorative Rings */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-sky-500/10 blur-xl pointer-events-none"></div>
      <div className="absolute right-4 top-4 text-sky-400/15 pointer-events-none">
        <Wifi className="w-16 h-16 stroke-[1.2]" />
      </div>

      {/* Top Header Card */}
      <div className="flex items-start justify-between relative z-10 gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              {member.uidKartu ? `NFC: ${member.uidKartu}` : 'Tanpa Kartu Fisik'}
            </span>
            <span className="text-[11px] text-slate-300 font-semibold">
              {member.paket?.namaPaket || 'Paket Member'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-sm leading-tight">
            {member.nama}
          </h3>
          <p className="text-[11px] text-slate-400 leading-tight">{member.noHp}</p>
        </div>

        {/* Status Badge */}
        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shadow-sm ${badgeColor}`}>
          <BadgeIconComponent className="w-3 h-3" />
          <span>{badgeLabel}</span>
        </div>
      </div>

      {/* Kuota Metrics Display */}
      <div className="mt-3.5 pt-3 border-t border-slate-700/80 relative z-10 grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-800/70 rounded-md p-2 border border-slate-700/60">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Sisa Kuota</span>
          <span className="text-base sm:text-lg font-black text-sky-400">
            {sisaKuota.toFixed(1)} <span className="text-[10px] font-normal text-slate-300">kg</span>
          </span>
        </div>

        <div className="bg-slate-800/70 rounded-md p-2 border border-slate-700/60">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Terpakai</span>
          <span className="text-sm sm:text-base font-bold text-slate-200">
            {totalPemakaian.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">kg</span>
          </span>
        </div>

        <div className="bg-slate-800/70 rounded-md p-2 border border-slate-700/60">
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Kuota Awal</span>
          <span className="text-sm sm:text-base font-bold text-slate-300">
            {kuotaAwal.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">kg</span>
          </span>
        </div>
      </div>

      {/* Progress Bar Kuota */}
      <div className="mt-2.5 relative z-10">
        <div className="flex justify-between text-[10px] text-slate-300 mb-1 font-semibold">
          <span>Kapasitas Tersisa</span>
          <span>{persentaseSisa.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              persentaseSisa <= 15
                ? 'bg-rose-500'
                : persentaseSisa <= 30
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-sky-400 to-cyan-400'
            }`}
            style={{ width: `${persentaseSisa}%` }}
          ></div>
        </div>
      </div>

      {/* Masa Aktif Footer */}
      <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 relative z-10 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-sky-400" />
          <span>
            {isBelumMulai ? (
              <span className="text-sky-300 font-semibold">Aktif: 30 hari sejak cuci pertama</span>
            ) : (
              <span>Berlaku s/d: <strong className="text-slate-200">{formatTanggal(member.tglBerakhir)}</strong></span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-sky-400" />
          <span>
            {isBelumMulai ? (
              <span className="text-sky-300 font-bold">Belum Mulai</span>
            ) : isExpired ? (
              <span className="text-rose-400 font-bold">Kedaluwarsa {Math.abs(member.daysLeft || 0)} hari</span>
            ) : (
              <span>Sisa <strong>{member.daysLeft !== undefined ? member.daysLeft : '-'} hari</strong></span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KartuKuota;
