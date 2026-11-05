import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Keyboard,
  Search,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { normalizeNfcUid, isWebNfcSupported } from '../utils/nfcHelper';

/**
 * Komponen Reusable NfcScanner (Mendukung Web NFC, USB Reader, & Cari Manual)
 * @param {Function} onScan - Callback saat UID berhasil didapat (uid: string)
 * @param {Function} onManualSearch - Callback saat pengguna mencari manual via nama/noHp (opsional)
 * @param {string} title - Judul scanner
 * @param {string} placeholder - Placeholder input USB
 * @param {boolean} defaultMobileMode - Jika di tampilan mobile, prioritaskan Web NFC
 */
const NfcScanner = ({
  onScan,
  onManualSearch,
  placeholder = 'Tap kartu pada NFC Reader...',
  defaultMobileMode = false,
}) => {
  const [activeTab, setActiveTab] = useState('usb'); // 'webnfc' | 'usb' | 'manual'
  const [usbInput, setUsbInput] = useState('');
  const [manualQuery, setManualQuery] = useState('');
  const [nfcStatus, setNfcStatus] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [hasWebNfc, setHasWebNfc] = useState(false);

  const inputRef = useRef(null);
  const ndefAbortRef = useRef(null);

  useEffect(() => {
    const supported = isWebNfcSupported();
    setHasWebNfc(supported);
    const isMobileScreen =
      defaultMobileMode || (typeof window !== 'undefined' && window.innerWidth <= 768);

    if ((supported && window.isSecureContext) || isMobileScreen) {
      setActiveTab('webnfc');
    } else {
      setActiveTab('usb');
    }
  }, [defaultMobileMode]);

  // Auto focus input USB reader saat tab USB aktif
  useEffect(() => {
    if (activeTab === 'usb' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTab]);

  // Otomatis aktifkan Web NFC jika di tab webnfc
  useEffect(() => {
    if (activeTab === 'webnfc' && isWebNfcSupported() && window.isSecureContext) {
      startWebNfc();
    }
  }, [activeTab]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      stopWebNfc();
    };
  }, []);

  // ========================
  // 1. WEB NFC API (ANDROID)
  // ========================
  const startWebNfc = async () => {
    if (!isWebNfcSupported()) {
      setNfcStatus('error');
      setStatusMessage(
        'Web NFC tidak didukung pada perangkat/browser ini. Gunakan Chrome Android dengan koneksi HTTPS.'
      );
      return;
    }

    try {
      setNfcStatus('scanning');
      setStatusMessage('Tempelkan kartu NFC ke bagian belakang HP Anda...');

      if (ndefAbortRef.current) {
        ndefAbortRef.current.abort();
      }
      const controller = new AbortController();
      ndefAbortRef.current = controller;

      const ndef = new window.NDEFReader();
      await ndef.scan({ signal: controller.signal });

      ndef.onreading = (event) => {
        const rawSerialNumber = event.serialNumber;
        if (rawSerialNumber) {
          const cleanUid = normalizeNfcUid(rawSerialNumber);
          setNfcStatus('success');
          setStatusMessage(`Kartu terdeteksi: ${cleanUid}`);
          onScan(cleanUid);
        } else {
          setNfcStatus('error');
          setStatusMessage('Kartu terbaca tetapi serial number (UID) tidak ditemukan.');
        }
      };

      ndef.onreadingerror = () => {
        setNfcStatus('error');
        setStatusMessage('Gagal membaca kartu NFC. Pastikan kartu tidak rusak.');
      };
    } catch (error) {
      setNfcStatus('error');
      setStatusMessage(
        `Gagal mengaktifkan Web NFC: ${error.message || 'Pastikan NFC HP aktif & menggunakan HTTPS'}`
      );
    }
  };

  const stopWebNfc = () => {
    if (ndefAbortRef.current) {
      ndefAbortRef.current.abort();
      ndefAbortRef.current = null;
    }
    setNfcStatus('idle');
    setStatusMessage('');
  };

  // =====================================
  // 2. USB NFC READER / KEYBOARD WEDGE
  // =====================================
  const handleUsbKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const clean = normalizeNfcUid(usbInput);
      if (clean) {
        setNfcStatus('success');
        setStatusMessage(`UID terbaca: ${clean}`);
        onScan(clean);
        setUsbInput('');
      }
    }
  };

  // =====================================
  // 3. PENCARIAN MANUAL (NAMA / NO HP)
  // =====================================
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualQuery.trim()) {
      if (onManualSearch) {
        onManualSearch(manualQuery.trim());
      } else {
        onScan(normalizeNfcUid(manualQuery));
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-300 overflow-hidden w-full">
      {/* Tab Switcher (Icon Only) */}
      <div className="bg-slate-100 border-b border-slate-300 p-2 flex items-center justify-center">
        <div className="grid grid-cols-3 w-full bg-slate-200/80 p-1 rounded-xl gap-1">
          <button
            type="button"
            title="USB Reader / Ketik UID"
            onClick={() => {
              stopWebNfc();
              setActiveTab('usb');
            }}
            className={`py-2 rounded-lg flex items-center justify-center transition ${
              activeTab === 'usb'
                ? 'bg-white text-sky-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4 shrink-0" />
          </button>

          <button
            type="button"
            title="Web NFC"
            onClick={() => {
              setActiveTab('webnfc');
              startWebNfc();
            }}
            className={`py-2 rounded-lg flex items-center justify-center transition ${
              activeTab === 'webnfc'
                ? 'bg-white text-sky-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wifi className="w-4 h-4 shrink-0" />
          </button>

          <button
            type="button"
            title="Cari Manual"
            onClick={() => {
              stopWebNfc();
              setActiveTab('manual');
            }}
            className={`py-2 rounded-lg flex items-center justify-center transition ${
              activeTab === 'manual'
                ? 'bg-white text-sky-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Konten Tab */}
      <div className="p-3.5 sm:p-4">
        {/* TAB 1: USB Reader / Ketik UID (Mode Keyboard Wedge) */}
        {activeTab === 'usb' && (
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={usbInput}
                  onChange={(e) => setUsbInput(e.target.value)}
                  onKeyDown={handleUsbKeyDown}
                  placeholder={placeholder}
                  className="w-full text-sm sm:text-base font-mono tracking-wider px-3 py-2.5 bg-slate-50 border-2 border-sky-400 focus:border-sky-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
                  autoComplete="off"
                />
                <span className="hidden sm:inline absolute right-2.5 top-3 text-[10px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.5 rounded">
                  Auto-Focus
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const clean = normalizeNfcUid(usbInput);
                  if (clean) {
                    setNfcStatus('success');
                    setStatusMessage(`UID terbaca: ${clean}`);
                    onScan(clean);
                    setUsbInput('');
                  }
                }}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm shrink-0 transition"
              >
                Proses UID
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              💡 <strong>Tips:</strong> Dekatkan kartu ke USB NFC reader, atau ketik UID kartu lalu klik Proses UID.
            </p>
          </div>
        )}

        {/* TAB 2: Web NFC API (Android Chrome) */}
        {activeTab === 'webnfc' && (
          <div className="text-center py-4 space-y-3.5">
            <div className="relative inline-flex items-center justify-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition ${
                  nfcStatus === 'scanning'
                    ? 'bg-sky-500 text-white animate-pulse shadow-lg shadow-sky-200'
                    : nfcStatus === 'success'
                    ? 'bg-emerald-500 text-white'
                    : nfcStatus === 'error'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Wifi className="w-10 h-10" />
              </div>
              {nfcStatus === 'scanning' && (
                <span className="absolute -inset-2 rounded-full border-2 border-sky-400 animate-ping opacity-75"></span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-800">
                {nfcStatus === 'scanning'
                  ? 'Sensor NFC HP Aktif — Siap Tap!'
                  : nfcStatus === 'success'
                  ? 'Kartu Berhasil Terbaca!'
                  : 'Web NFC Scanner'}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {statusMessage ||
                  (nfcStatus === 'scanning'
                    ? 'Sekarang tempelkan kartu NFC ke bagian belakang HP Anda.'
                    : 'Klik tombol biru "Mulai Scan" di bawah terlebih dahulu, lalu tempel kartu.')}
              </p>
            </div>

            <div className="pt-1 flex flex-col items-center justify-center gap-2">
              {nfcStatus !== 'scanning' ? (
                <>
                  <button
                    type="button"
                    onClick={startWebNfc}
                    className="w-full sm:w-auto px-5 py-3 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition animate-bounce"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Klik Mulai Scan Web NFC</span>
                  </button>
                  <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 max-w-xs">
                    ⚠️ <strong>PENTING:</strong> Klik tombol ini dulu (izinkan di Chrome) sebelum menempelkan kartu, agar tidak membuka DANA / Dompet Android.
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={stopWebNfc}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Berhenti Scan
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Pencarian Manual (Nama / No HP) */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="Ketik Nama Pelanggan, No HP, atau UID manual..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center gap-1.5 transition shrink-0"
              >
                <Search className="w-4 h-4" />
                Cari
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Gunakan opsi ini jika kartu hilang, tertinggal, atau perangkat tidak mendukung NFC.
            </p>
          </form>
        )}

        {/* Notifikasi Status Tambahan */}
        {statusMessage && activeTab !== 'webnfc' && (
          <div
            className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              nfcStatus === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : nfcStatus === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-sky-50 text-sky-700 border border-sky-200'
            }`}
          >
            {nfcStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NfcScanner;
