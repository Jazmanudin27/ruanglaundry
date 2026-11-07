import React, { useState, useEffect } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Smartphone,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import BwlLogo from './BwlLogo';

export default function ModalInstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);

  useEffect(() => {
    // 1. Cek apakah sudah terinstall (mode standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    setIsStandaloneApp(isStandalone);
    if (isStandalone) {
      return; // Sudah terinstall, tidak perlu munculkan modal
    }

    // 2. Deteksi device iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    setIsIosDevice(isIos);

    // 3. Tangkap event 'beforeinstallprompt' untuk Android / Chrome
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Cek apakah user pernah dismiss dalam 1 hari terakhir
      const lastDismissed = localStorage.getItem('bwl_pwa_dismissed');
      const oneDay = 24 * 60 * 60 * 1000;
      if (!lastDismissed || Date.now() - parseInt(lastDismissed, 10) > oneDay) {
        setIsOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Jika di iOS dan belum di-install standalone, cek status dismiss
    if (isIos && !isStandalone) {
      const lastDismissed = localStorage.getItem('bwl_pwa_dismissed');
      const oneDay = 24 * 60 * 60 * 1000;
      if (!lastDismissed || Date.now() - parseInt(lastDismissed, 10) > oneDay) {
        // Tampilkan delay 1.5 detik agar halaman selesai load dulu
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }

    // Event listener jika user baru saja sukses install
    window.addEventListener('appinstalled', () => {
      setIsStandaloneApp(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Munculkan prompt native Android / Chrome
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsOpen(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    // Simpan timestamp dismiss agar tidak mengganggu setiap saat
    localStorage.setItem('bwl_pwa_dismissed', Date.now().toString());
  };

  if (isStandaloneApp || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-slide-up">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-5 text-white">
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <BwlLogo size={56} className="shadow-lg rounded-2xl" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                  Aplikasi Kasir
                </span>
                <span className="text-xs text-sky-200 font-semibold">BWL</span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white mt-0.5">
                Install Aplikasi BWL
              </h3>
              <p className="text-xs text-sky-100 leading-tight">
                Basmalah Wash Laundry (iOS & Android)
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl text-xs text-sky-900 flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Pasang aplikasi di layar utama HP Anda untuk akses cepat, scan RFID tanpa hambatan, dan tampilan layar penuh tanpa browser bar.
            </p>
          </div>

          {/* Panduan Khusus iOS vs Android */}
          {isIosDevice ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="font-extrabold text-slate-900 block text-[13px] border-b border-slate-200 pb-1.5">
                📱 Cara Install di iPhone / iPad (Safari):
              </span>
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">
                      Ketuk tombol Bagikan (Share)
                    </span>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      Ikon <Share className="w-3.5 h-3.5 text-sky-600 inline" /> di bilah navigasi bawah Safari Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">
                      Pilih "Tambah ke Layar Utama"
                    </span>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      Menu <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" /> (Add to Home Screen).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">
                      Ketuk "Tambah" (Add)
                    </span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Di pojok kanan atas layar iPhone Anda. Ikon BWL akan muncul di layar utama!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Pasang Aplikasi Sekarang</span>
                </button>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <span className="font-extrabold text-slate-900 block text-[13px]">
                    🤖 Cara Pasang di Android (Chrome):
                  </span>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-sky-600 text-base">⋮</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Ketuk <strong>titik tiga (menu)</strong> di pojok kanan atas browser Chrome, lalu pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tombol Tutup / Nanti */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Kompatibel iOS & Android
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

