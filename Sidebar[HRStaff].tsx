/**
 * Sidebar[HRStaff].tsx
 * Collapsible Modern Executive Dark Sidebar (Full & Mini/Icon-Only Mode)
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { ActiveTab } from '../types[HRStaff]';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pkwtAlertCount: number;
  calonAlertCount: number;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeType?: 'warning' | 'urgent';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  pkwtAlertCount,
  calonAlertCount,
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'presensi', label: 'Presensi & Ijin', icon: CalendarCheck },
    { id: 'lembur', label: 'Lembur', icon: Clock },
    { id: 'rekap', label: 'Rekap Presensi', icon: BarChart3 },
    { id: 'slip', label: 'Slip Gaji', icon: Receipt },
    {
      id: 'database',
      label: 'Database Karyawan',
      icon: Users,
      badge: pkwtAlertCount > 0 ? pkwtAlertCount : undefined,
      badgeType: 'warning',
    },
    {
      id: 'pelatihan',
      label: 'Pelatihan Calon',
      icon: GraduationCap,
      badge: calonAlertCount > 0 ? calonAlertCount : undefined,
      badgeType: 'urgent',
    },
    { id: 'profil', label: 'Profil Karyawan', icon: UserCheck },
  ];

  return (
    <aside
      className={`no-print relative flex flex-col justify-between bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out select-none border-r border-slate-800 ${
        isMobileDrawer
          ? 'w-full h-full'
          : isCollapsed
          ? 'w-[72px]'
          : 'w-64'
      } shrink-0 min-h-[calc(100vh-4rem)]`}
    >
      {/* Top Menu Section */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-3">
        {/* Header / Mini Toggle on Top */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full px-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Modul Operasional
                </span>
              </div>
              {isMobileDrawer ? (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  title="Tutup Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  title="Kecilkan ke Mode Mini (Icon Only)"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group relative"
                title="Perlebar Sidebar (Tampilkan Teks)"
              >
                <PanelLeftOpen className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                {/* Floating Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl border border-slate-700">
                  Perlebar Sidebar
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onTabChange(item.id)}
                  type="button"
                  aria-label={item.label}
                  className={`relative flex w-full items-center rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    isCollapsed ? 'justify-center px-0' : 'px-3 justify-start'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-500/50'
                      : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />

                  {/* Expanded Text */}
                  {!isCollapsed && (
                    <span className="ml-3 truncate tracking-tight text-left flex-1">
                      {item.label}
                    </span>
                  )}

                  {/* Badge Counter (Expanded Mode) */}
                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`flex h-5 items-center justify-center rounded-full text-[11px] font-bold px-2 ml-2 shrink-0 ${
                        item.badgeType === 'urgent'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-amber-500 text-slate-950 font-black'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Badge Dot Indicator (Collapsed Mini Mode) */}
                  {isCollapsed && item.badge !== undefined && (
                    <span
                      className={`absolute top-1 right-2 flex h-2.5 w-2.5 rounded-full ring-2 ring-slate-900 ${
                        item.badgeType === 'urgent'
                          ? 'bg-rose-500 animate-ping'
                          : 'bg-amber-500'
                      }`}
                    />
                  )}
                </button>

                {/* Floating Tooltip Pill (Only on Collapsed Mode) */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 flex items-center gap-2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white shadow-xl border border-slate-700">
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.badgeType === 'urgent'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Factory Info & Collapse Action */}
      <div className="border-t border-slate-800 p-2.5 space-y-2 shrink-0 bg-slate-950/40">
        {!isCollapsed ? (
          <div className="rounded-xl bg-slate-800/60 p-3 text-xs border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-[10px] uppercase tracking-wide">Pabrik Batu Karang</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="font-bold text-slate-200">Divisi Produksi I</p>
            <p className="text-[10px] text-slate-400 mt-0.5">26 Hari Kerja • Sistem Terpadu</p>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 font-bold text-[10px] border border-slate-700"
              title="Divisi Produksi I (PP1) — 26 Hari Kerja"
            >
              PP1
            </div>
          </div>
        )}

        {/* Toggle Collapse Bottom Trigger (Desktop) */}
        {!isMobileDrawer && (
          <button
            onClick={onToggleCollapse}
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 py-2.5 text-xs font-semibold text-slate-300 transition-colors group"
            title={isCollapsed ? 'Perlebar Sidebar' : 'Kecilkan Sidebar (Icon Only)'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 group-hover:scale-125 transition-transform text-slate-400 group-hover:text-white" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Mode Mini (Icon Only)</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
