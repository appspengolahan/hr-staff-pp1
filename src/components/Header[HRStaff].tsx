/**
 * Header[HRStaff].tsx
 * Header Navigasi Eksekutif HR Staff System dengan RBAC Selector, GAS Status, & Action Hub
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React from 'react';
import {
  Activity,
  ArrowRightLeft,
  ChevronDown,
  Database,
  HelpCircle,
  Menu,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';
import { UserRole } from '../types[HRStaff]';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenSwitchBoard: () => void;
  onOpenGASCenter: () => void;
  onOpenHelp: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncTime: string;
}

const ROLES: UserRole[] = ['Project Manager', 'Site Engineer', 'Vendor', 'Client', 'Admin'];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenSwitchBoard,
  onOpenGASCenter,
  onOpenHelp,
  onToggleSidebar,
  onManualSync,
  isSyncing,
  lastSyncTime,
}) => {
  const formatSyncTime = (iso: string) => {
    if (!iso) return 'Baru saja';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md transition-all lg:px-6">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Toggle Sidebar"
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-bold text-sm shadow-sm ring-2 ring-blue-100">
            PP1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">HR Staff System</span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 leading-none">Divisi Produksi I — PT Batu Karang</p>
          </div>
        </div>
      </div>

      {/* Right Controls: RBAC Selector, Switch App, GAS Center, Help, Sync */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* RBAC Selector */}
        <div className="relative flex items-center">
          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Switch App Button */}
        <button
          onClick={onOpenSwitchBoard}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
          title="Beralih antar aplikasi operasional pabrik"
          type="button"
        >
          <ArrowRightLeft className="h-3.5 w-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Switch App</span>
        </button>

        {/* Headless GAS Center Button */}
        <button
          onClick={onOpenGASCenter}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100/90 text-blue-800 px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
          title="Headless GAS Center & Endpoint Config"
          type="button"
        >
          <Database className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden md:inline">GAS Center</span>
        </button>

        {/* Manual Refresh Sync Button */}
        <button
          onClick={onManualSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-colors disabled:opacity-60"
          title={`Sync data ke GAS (Terakhir: ${formatSyncTime(lastSyncTime)})`}
          type="button"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-600 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden lg:inline text-[11px] text-slate-500 font-normal">
            {isSyncing ? 'Sync...' : formatSyncTime(lastSyncTime)}
          </span>
        </button>

        {/* Help Button */}
        <button
          onClick={onOpenHelp}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-700 transition-colors"
          title="Bantuan, Ketentuan & Aturan Pabrik"
          type="button"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* User Badge */}
        <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-medium text-xs">
            <User className="h-4 w-4" />
          </div>
          <div className="text-left text-xs leading-none">
            <p className="font-semibold text-slate-800 truncate max-w-[130px]">Lalu Mahendra</p>
            <p className="text-[10px] text-slate-500 font-mono">Produksi I</p>
          </div>
        </div>
      </div>
    </header>
  );
};
