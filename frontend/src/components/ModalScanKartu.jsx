import React, { useState } from 'react';
import { X, Wifi, Check, AlertCircle } from 'lucide-react';
import NfcScanner from './NfcScanner';

const ModalScanKartu = ({ isOpen, onClose, onSelectUid, currentUid = '' }) => {
  const [scannedUid, setScannedUid] = useState('');

  if (!isOpen) return null;

  const handleScanSuccess = (uid) => {
    setScannedUid(uid);
  };

  const handleConfirm = () => {
    if (scannedUid) {
      onSelectUid(scannedUid);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Hubungkan Kartu NFC</h3>
              <p className="text-xs text-slate-400">Scan kartu NFC fisik untuk member</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {currentUid && (
            <div className="text-xs bg-slate-100 p-2.5 rounded-lg text-slate-600 flex items-center justify-between">
              <span>UID Kartu Saat Ini:</span>
              <span className="font-mono font-bold text-slate-800">{currentUid}</span>
            </div>
          )}

          <NfcScanner
            onScan={handleScanSuccess}
            title="Tempelkan Kartu Baru"
            placeholder="Dekatkan kartu ke NFC Reader..."
            defaultMobileMode={true}
          />

          {scannedUid && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-sky-700 block font-medium">UID Kartu Terbaca:</span>
                <span className="text-lg font-mono font-extrabold text-sky-950">{scannedUid}</span>
              </div>
              <span className="px-2.5 py-1 bg-sky-600 text-white text-xs font-bold rounded-lg shadow-sm">
                Siap Dipakai
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!scannedUid}
            onClick={handleConfirm}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
          >
            <Check className="w-4 h-4" />
            Gunakan UID Ini
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalScanKartu;
