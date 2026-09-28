/**
 * App.tsx
 * Sistem HR Staff — Divisi Produksi I (PT Batu Karang)
 * Arsitektur Headless GAS REST Web App & Offline-First Local Cache
 * Developed by Lalu Mahendra
 */

import React, { useEffect, useState } from 'react';
import { Footer } from './components/Footer[HRStaff]';
import { GASCenterModal } from './components/GASCenterModal[HRStaff]';
import { Header } from './components/Header[HRStaff]';
import { HelpModal } from './components/HelpModal[HRStaff]';
import { QuickTabBar } from './components/QuickTabBar[HRStaff]';
import { Sidebar } from './components/Sidebar[HRStaff]';
import { SuratIjinModal } from './components/SuratIjinModal[HRStaff]';
import { SwitchBoardModal } from './components/SwitchBoardModal[HRStaff]';
import { gasStore } from './gasService[HRStaff]';
import { ActiveTab, SuratIjinData, UserRole } from './types[HRStaff]';
import { CalonKaryawanView } from './views/CalonKaryawanView[HRStaff]';
import { DatabaseStaffView } from './views/DatabaseStaffView[HRStaff]';
import { DashboardView } from './views/DashboardView[HRStaff]';
import { LemburView } from './views/LemburView[HRStaff]';
import { PresensiView } from './views/PresensiView[HRStaff]';
import { ProfilKaryawanView } from './views/ProfilKaryawanView[HRStaff]';
import { RekapView } from './views/RekapView[HRStaff]';
import { SlipGajiView } from './views/SlipGajiView[HRStaff]';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('hrstaff_current_user_role') as UserRole) || 'Project Manager';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('hrstaff_sidebar_collapsed') === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSwitchBoardOpen, setIsSwitchBoardOpen] = useState(false);
  const [isGASCenterOpen, setIsGASCenterOpen] = useState(false);
  const [suratIjinData, setSuratIjinData] = useState<SuratIjinData | null>(null);
  const [profilTargetStaff, setProfilTargetStaff] = useState<string>('');

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(gasStore.getLastSyncTime());
  const [, setTick] = useState(0);

  // Subscribe to gasStore updates
  useEffect(() => {
    const unsub = gasStore.subscribe(() => {
      setLastSyncTime(gasStore.getLastSyncTime());
      setIsSyncing(gasStore.isSyncInProgress());
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('hrstaff_current_user_role', role);
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileMenuOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('hrstaff_sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  const handleManualSync = async () => {
    const res = await gasStore.syncWithGAS();
    alert(res.message);
  };

  const handleOpenProfilStaff = (nama: string) => {
    setProfilTargetStaff(nama);
    setActiveTab('profil');
  };

  // Compute Alert Counts
  const now = new Date();
  const staffList = gasStore.getStaffList();
  const pkwtAlertCount = staffList.filter((s) => {
    if (s.status === 'TETAP' || !s.akhirPKWT || s.statusAktif !== 'Aktif') return false;
    const ta = new Date(s.akhirPKWT);
    const sisa = Math.ceil((ta.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return sisa <= 26;
  }).length;

  const calonAlertCount = gasStore
    .getCalonList()
    .filter((c) => c.status === 'Sedang Berjalan' && c.sisaHari < 10).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenSwitchBoard={() => setIsSwitchBoardOpen(true)}
        onOpenGASCenter={() => setIsGASCenterOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onToggleSidebar={handleToggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Mobile/Tablet Quick Tab Navigation */}
      <QuickTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pkwtAlertCount={pkwtAlertCount}
        calonAlertCount={calonAlertCount}
      />

      {/* Mobile Drawer (Slide-over) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-72 max-w-[85vw] bg-slate-900 shadow-2xl h-full flex flex-col animate-in slide-in-from-left duration-200">
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileMenuOpen(false)}
              pkwtAlertCount={pkwtAlertCount}
              calonAlertCount={calonAlertCount}
              isMobileDrawer={true}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Executive Sidebar (Desktop: Full or Mini/Icon-Only) */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
            pkwtAlertCount={pkwtAlertCount}
            calonAlertCount={calonAlertCount}
          />
        </div>

        {/* View Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView onNavigateTab={setActiveTab} userRole={currentRole} />
          )}

          {activeTab === 'presensi' && (
            <PresensiView onOpenSuratIjin={(d) => setSuratIjinData(d)} userRole={currentRole} />
          )}

          {activeTab === 'lembur' && <LemburView userRole={currentRole} />}

          {activeTab === 'rekap' && <RekapView userRole={currentRole} />}

          {activeTab === 'slip' && <SlipGajiView userRole={currentRole} />}

          {activeTab === 'database' && (
            <DatabaseStaffView
              userRole={currentRole}
              onOpenProfil={handleOpenProfilStaff}
            />
          )}

          {activeTab === 'pelatihan' && (
            <CalonKaryawanView
              userRole={currentRole}
              onNavigateToStaff={() => setActiveTab('database')}
            />
          )}

          {activeTab === 'profil' && (
            <ProfilKaryawanView
              initialStaffName={profilTargetStaff}
              userRole={currentRole}
            />
          )}
        </main>
      </div>

      {/* Web App & PDF Export Footer */}
      <Footer />

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <SwitchBoardModal
        isOpen={isSwitchBoardOpen}
        onClose={() => setIsSwitchBoardOpen(false)}
      />

      <GASCenterModal
        isOpen={isGASCenterOpen}
        onClose={() => setIsGASCenterOpen(false)}
        onDataChanged={() => setTick((t) => t + 1)}
      />

      <SuratIjinModal
        isOpen={!!suratIjinData}
        onClose={() => setSuratIjinData(null)}
        data={suratIjinData}
      />
    </div>
  );
}
