import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#e2e8f0] w-full">
      <Navbar />

      <main className="flex-1 w-full px-3 sm:px-4 lg:px-5 py-3 sm:py-4">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 py-2.5 mt-auto w-full">
        <div className="w-full px-3 sm:px-4 lg:px-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-1.5">
          <span>
            © {new Date().getFullYear()} Ruang Laundry. Sistem Manajemen Member & Kuota NFC.
          </span>
          <span className="text-slate-400">
            Outlet Express Laundry • Aman & Otomatis
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
