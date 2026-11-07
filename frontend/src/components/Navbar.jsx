import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Package,
  Layers,
  LogOut,
  Maximize2,
  Minimize2,
  Wifi,
  History,
  CreditCard,
  Building2,
  Menu,
  X,
  Smartphone,
  KeyRound,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useViewMode } from '../context/ViewModeContext';
import showAlert from '../utils/sweetalert';
import ModalPengaturanAkun from './ModalPengaturanAkun';
import BwlLogo from './BwlLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setViewMode } = useViewMode();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPengaturanOpen, setIsPengaturanOpen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleLogout = async () => {
    const yakin = await showAlert.confirm('Keluar dari Sistem?', 'Apakah Anda yakin ingin keluar dari akun ini?', 'Ya, Keluar');
    if (yakin) {
      logout();
      navigate('/login');
    }
  };

  const navItems = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/scan', label: 'Scan NFC', icon: Wifi },
    { to: '/histori', label: 'Histori Member', icon: History },
    { to: '/transaksi', label: 'Status Cucian', icon: Clock },
    { to: '/members', label: 'Data Member', icon: Users },
    { to: '/perpanjangan', label: 'Histori Isi Kuota', icon: CreditCard },
    { to: '/paket', label: 'Master Paket', icon: Package },
    ...(user?.role === 'SUPER_OWNER'
      ? [{ to: '/perusahaan', label: 'Kelola Outlet (SaaS)', icon: Building2 }]
      : []),
  ];

  return (
    <header className="bg-[#0f172a] text-white sticky top-0 z-40 shadow-sm border-b border-slate-800 w-full">
      <div className="w-full px-3 sm:px-4 lg:px-5">
        <div className="flex items-center justify-between h-13 py-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <NavLink to="/" className="flex items-center gap-2 group">
              <BwlLogo size={34} className="group-hover:scale-105 transition" />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-wide text-white leading-tight">
                  BASMALAH WASH
                </span>
                <span className="text-[9px] text-sky-400 font-semibold tracking-wider uppercase leading-none">
                  BWL Member RFID
                </span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition ${
                      isActive
                        ? 'bg-[#0284c7] text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Section: Fullscreen & User Profile */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setViewMode('mobile')}
              className="px-2.5 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition"
              title="Beralih ke Tampilan Aplikasi HP (Mobile)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mode HP</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
              title={isFullscreen ? 'Keluar Fullscreen' : 'Mode Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Profile Pill - Klik untuk ganti username & password */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full pl-1 pr-2 py-0.5 transition">
              <button
                type="button"
                onClick={() => setIsPengaturanOpen(true)}
                className="flex items-center gap-2 hover:opacity-80 transition group text-left"
                title="Klik untuk Pengaturan Akun & Ganti Password"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {user?.nama ? user.nama.substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white leading-tight group-hover:text-sky-300 transition">
                    {user?.nama || 'Super Admin'}
                  </span>
                  <span className="text-[8px] text-sky-400 font-medium leading-none">
                    {user?.role || 'SUPERADMIN'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPengaturanOpen(true)}
                className="p-1 text-slate-400 hover:text-sky-300 hover:bg-slate-700/50 rounded-full transition ml-0.5"
                title="Ganti Username & Password"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-full transition ml-0.5"
                title="Keluar / Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-3 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#0284c7] text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsPengaturanOpen(true);
              }}
              className="flex items-center gap-2 hover:opacity-80 transition"
              title="Ganti Password"
            >
              <div className="w-6 h-6 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                {user?.nama ? user.nama.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-slate-300">{user?.nama}</span>
                <span className="text-[9px] text-sky-400 font-bold">Ganti Password</span>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-400 font-semibold flex items-center gap-1 p-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Modal Ganti Password & Pengaturan Akun */}
      <ModalPengaturanAkun
        isOpen={isPengaturanOpen}
        onClose={() => setIsPengaturanOpen(false)}
      />
    </header>
  );
};

export default Navbar;
