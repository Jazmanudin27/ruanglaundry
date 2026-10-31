import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Wifi,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setErrorMsg(err.message || "Login gagal, periksa username dan password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-500/20 mb-3">
            <Layers className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            BASMALAH WASH
          </h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center justify-center gap-1.5">
            <Wifi className="w-4 h-4 text-sky-400" />
            Sistem Member RFID Laundry
          </p>
        </div>

        {/* Card Login */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-8 shadow-2xl border border-white/20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Masuk ke Dashboard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan masukkan kredensial akun admin outlet laundry Anda.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:bg-slate-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credential Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">
              Akun Bawaan (Seed):
            </span>
            <div className="inline-flex gap-2 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
              <span>
                user: <strong>admin</strong>
              </span>
              <span>•</span>
              <span>
                pass: <strong>admin123</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
