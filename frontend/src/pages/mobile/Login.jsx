import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Wifi,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BwlLogo from '../../components/BwlLogo';

const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Login gagal, periksa username dan password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-between p-5 max-w-md mx-auto text-white">
      {/* Top Brand */}
      <div className="pt-6 text-center space-y-2">
        <BwlLogo size={68} className="mx-auto" />
        <h1 className="text-xl font-black tracking-wide text-white">BASMALAH WASH</h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[11px] font-bold">
          <Wifi className="w-3.5 h-3.5" />
          <span>Kasir Mobile & Sistem Member RFID</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 my-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Masuk Aplikasi Kasir HP
          </h2>
          <p className="text-xs text-slate-500">
            Kelola timbangan member, scan NFC & status cucian dari HP.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 transition"
          >
            <span>{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-500 pb-2">
        © {new Date().getFullYear()} Ruang Laundry • Sistem Member NFC
      </div>
    </div>
  );
};

export default Login;

