import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  RotateCw,
  Coins,
  Package,
  Loader2,
  Share2,
} from 'lucide-react';
import { perpanjanganApi } from '../../api';
import { formatTanggal, formatTanggalWaktu, formatRupiah } from '../../utils/nfcHelper';

const PerpanjanganList = () => {
  const [dataList, setDataList] = useState([]);
  const [ringkasan, setRingkasan] = useState({
    totalPerpanjangan: 0,
    totalPendapatan: 0,
    totalKuotaTerjual: 0,
    memberUnik: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPerpanjangan = async () => {
    setLoading(true);
    try {
      const res = await perpanjanganApi.getAll({
        search,
        limit: 100,
      });

      if (res.success) {
        setDataList(res.data.items || []);
        if (res.data.ringkasan) {
          setRingkasan(res.data.ringkasan);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat perpanjangan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerpanjangan();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPerpanjangan();
  };

  return (
    <div className="space-y-3 w-full">
      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-100 uppercase">
              Pendapatan Paket
            </span>
            <Coins className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="text-sm font-black mt-1">
            {formatRupiah(ringkasan.totalPendapatan)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-100 uppercase">
              Kuota Terjual
            </span>
            <Package className="w-4 h-4 text-purple-200" />
          </div>
          <div className="text-sm font-black mt-1">
            {ringkasan.totalKuotaTerjual} kg ({ringkasan.totalPerpanjangan}x)
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-1.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama member atau nama paket..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          type="button"
          onClick={fetchPerpanjangan}
          className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-xs"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </form>

      {/* Daftar Kartu Perpanjangan */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-500 border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            Memuat histori pembelian paket...
          </div>
        ) : dataList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
            Belum ada histori pembelian paket.
          </div>
        ) : (
          dataList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-300 shadow-md space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {item.member?.nama || 'Member'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatTanggalWaktu(item.createdAt)}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black">
                  {formatRupiah(item.hargaDibayar)}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Paket Dibeli
                  </span>
                  <strong className="text-sky-700">
                    {item.paket?.namaPaket || '-'} (+{item.kuotaDitambahkan} kg)
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Berlaku s/d
                  </span>
                  <strong className="text-slate-700">
                    {formatTanggal(item.tglBerakhirBaru)}
                  </strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PerpanjanganList;

