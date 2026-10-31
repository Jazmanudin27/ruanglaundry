import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Wifi,
  History,
  Users,
  LogOut,
  Monitor,
  Layers,
  Calendar,
  Clock,
  Building2,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useViewMode } from '../context/ViewModeContext';

const MobileLayout = () => {
  const { user, logout } = useAuth();
  const { setViewMode } = useViewMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [now, setNow] = useState(new Date());

  // Live ticking clock setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Keluar dari akun kasir/admin?')) {
      logout();
      navigate('/login');
    }
  };

  // Ucapan waktu otomatis
  const getGreeting = () => {
    const hour = now.getHours();
    if (hour >= 4 && hour < 11) {
      return { text: 'Selamat Pagi,', Icon: Sunrise };
    }
    if (hour >= 11 && hour < 15) {
      return { text: 'Selamat Siang,', Icon: Sun };
    }
    if (hour >= 15 && hour < 18) {
      return { text: 'Selamat Sore,', Icon: Sunset };
    }
    return { text: 'Selamat Malam,', Icon: Moon };
  };

  const { text: greetingText, Icon: GreetingIcon } = getGreeting();

  const formattedDate = now.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const pad = (n) => String(n).padStart(2, '0');
  const formattedTime = `${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(
    now.getSeconds()
  )} WIB`;

  const userInitial = user?.nama
    ? user.nama.trim().charAt(0).toUpperCase()
    : 'A';

  const navItems = [
    { to: '/', label: 'Beranda', icon: Home, exact: true },
    { to: '/scan', label: 'Scan NFC', icon: Wifi },
    { to: '/transaksi', label: 'Cucian', icon: History },
    { to: '/members', label: 'Member', icon: Users },
  ];

  return (
    <div className="min-h-screen w-full bg-[#1e293b] flex justify-center items-start sm:py-4 select-none">
      {/* Frame HP Tengah dengan Background Body Abu-Biru Tegas (#dde4f0) agar Card Putih Kontras Jelas */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[94vh] bg-[#dde4f0] sm:rounded-[34px] sm:border-[4px] sm:border-slate-600 shadow-[0_25px_70px_rgba(0,0,0,0.65)] flex flex-col relative overflow-hidden">
        {/* TOP CURVED INDIGO-BLUE HEADER */}
        <header className="bg-gradient-to-br from-[#3b41f5] via-[#2b2d9e] to-[#161542] text-white px-4 pt-3.5 pb-4 rounded-b-[28px] shadow-lg relative z-20">
          {/* Baris 1: Brand Pill & Action Circles */}
          <div className="flex items-center justify-between mb-3.5">
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-sky-200" />
              <span className="text-xs font-extrabold tracking-wide text-white">
                Basmalah Wash
              </span>
            </NavLink>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => navigate('/paket')}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition"
                title="Master Paket Laundry"
              >
                <Package className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition"
                title="Beralih ke Mode Desktop"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-rose-500/50 border border-white/20 flex items-center justify-center text-white transition"
                title="Keluar / Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Baris 2: Avatar & Sapaan User */}
          <div className="flex items-center gap-3 mb-3.5 px-0.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-lg font-extrabold text-white shadow-sm">
                {userInitial}
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#25267a] absolute -bottom-0.5 -right-0.5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[11px] text-indigo-100 font-medium">
                <GreetingIcon className="w-3 h-3 text-amber-300" />
                <span>{greetingText}</span>
              </div>
              <div className="text-base font-extrabold text-white truncate leading-tight">
                {user?.nama || 'Admin Ruang Laundry'}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-indigo-200 font-semibold uppercase">
                  {user?.role || 'ADMIN'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 border border-white/20 text-[9px] font-bold text-white uppercase">
                  <Building2 className="w-2.5 h-2.5 text-sky-300" />
                  <span>OUTLET PUSAT</span>
                </span>
              </div>
            </div>
          </div>

          {/* Baris 3: Strip Tanggal & Jam Real-Time */}
          <div className="bg-[#0f1133]/75 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2 flex items-center justify-between text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 text-indigo-100">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold tracking-wide">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 w-full px-3.5 pt-3.5 pb-24 overflow-y-auto">
          <Outlet />
        </main>

        {/* FLOATING DARK PILL BOTTOM NAVIGATION BAR */}
        <div className="fixed sm:sticky bottom-2.5 left-0 right-0 z-40 px-3 max-w-[430px] mx-auto w-full pointer-events-none">
          <nav className="bg-gradient-to-r from-[#191e38] via-[#12162b] to-[#0d1121] p-1.5 rounded-[26px] shadow-[0_12px_30px_rgba(13,17,33,0.55)] border border-slate-700/80 grid grid-cols-4 items-center pointer-events-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={`flex flex-col items-center justify-center py-2 rounded-[20px] transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-md shadow-blue-500/40 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 font-medium'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5 leading-none">
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
