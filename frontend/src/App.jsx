import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ViewModeProvider, useViewMode } from './context/ViewModeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import MobileLayout from './components/MobileLayout';

// Desktop Pages
import DesktopLogin from './pages/desktop/Login';
import DesktopDashboard from './pages/desktop/Dashboard';
import DesktopScanMember from './pages/desktop/ScanMember';
import DesktopMembers from './pages/desktop/Members';
import DesktopMemberForm from './pages/desktop/MemberForm';
import DesktopMemberDetail from './pages/desktop/MemberDetail';
import DesktopTransaksiList from './pages/desktop/TransaksiList';
import DesktopPerpanjanganList from './pages/desktop/PerpanjanganList';
import DesktopPaketList from './pages/desktop/PaketList';
import DesktopPerusahaanList from './pages/desktop/PerusahaanList';

// Mobile Pages
import MobileLogin from './pages/mobile/Login';
import MobileDashboard from './pages/mobile/Dashboard';
import MobileScanMember from './pages/mobile/ScanMember';
import MobileMembers from './pages/mobile/Members';
import MobileMemberForm from './pages/mobile/MemberForm';
import MobileMemberDetail from './pages/mobile/MemberDetail';
import MobileTransaksiList from './pages/mobile/TransaksiList';
import MobilePerpanjanganList from './pages/mobile/PerpanjanganList';
import MobilePaketList from './pages/mobile/PaketList';
import MobilePerusahaanList from './pages/mobile/PerusahaanList';
import HistoriMember from './pages/HistoriMember';
import ModalInstallPwa from './components/ModalInstallPwa';

function AppRoutes() {
  const { isMobile } = useViewMode();

  const ActiveLayout = isMobile ? MobileLayout : Layout;
  const LoginPage = isMobile ? MobileLogin : DesktopLogin;
  const DashboardPage = isMobile ? MobileDashboard : DesktopDashboard;
  const ScanMemberPage = isMobile ? MobileScanMember : DesktopScanMember;
  const MembersPage = isMobile ? MobileMembers : DesktopMembers;
  const MemberFormPage = isMobile ? MobileMemberForm : DesktopMemberForm;
  const MemberDetailPage = isMobile ? MobileMemberDetail : DesktopMemberDetail;
  const TransaksiListPage = isMobile ? MobileTransaksiList : DesktopTransaksiList;
  const PerpanjanganListPage = isMobile
    ? MobilePerpanjanganList
    : DesktopPerpanjanganList;
  const PaketListPage = isMobile ? MobilePaketList : DesktopPaketList;
  const PerusahaanListPage = isMobile
    ? MobilePerusahaanList
    : DesktopPerusahaanList;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ActiveLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="scan" element={<ScanMemberPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="members/tambah" element={<MemberFormPage />} />
        <Route path="members/:id" element={<MemberDetailPage />} />
        <Route path="members/:id/edit" element={<MemberFormPage />} />
        <Route path="histori" element={<HistoriMember />} />
        <Route path="transaksi" element={<TransaksiListPage />} />
        <Route path="perpanjangan" element={<PerpanjanganListPage />} />
        <Route path="paket" element={<PaketListPage />} />
        <Route path="perusahaan" element={<PerusahaanListPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ViewModeProvider>
        <BrowserRouter>
          <AppRoutes />
          <ModalInstallPwa />
        </BrowserRouter>
      </ViewModeProvider>
    </AuthProvider>
  );
}

export default App;
