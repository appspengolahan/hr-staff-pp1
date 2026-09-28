/**
 * Sidebar[HRStaff].tsx
 * Collapsible Modern Executive Dark Sidebar
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
  Receipt,
  UserCheck,
  Users,
} from 'lucide-react';
import { ActiveTab } from '../types[HRStaff]';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pkwtAlertCount: number;
  calonAlertCount: number;
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
      className={`no-print flex flex-col justify-between bg-slate-900 text-slate-300 transition-all duration-300 select-none border-r border-slate-800 ${
        isCollapsed ? 'w-18' : 'w-64'
      } shrink-0 min-h-[calc(100vh-4rem)]`}
    >
      {/* Top Menu Section */}
      <div className="p-3">
        {/* Section title */}
        {!isCollapsed && (
          <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Modul Operasional
          </div>
        )}

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                type="button"
                title={isCollapsed ? item.label : undefined}
                className={`relative flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {!isCollapsed && (
                  <span className="ml-3 truncate tracking-tight text-left flex-1">{item.label}</span>
                )}

                {/* Badge Alert */}
                {item.badge !== undefined && (
                  <span
                    className={`flex h-5 items-center justify-center rounded-full text-[11px] font-bold px-1.5 shrink-0 ${
                      item.badgeType === 'urgent'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-amber-500 text-slate-950 font-black'
                    } ${isCollapsed ? 'absolute -top-1 -right-1 ring-2 ring-slate-900' : 'ml-2'}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Factory Division Info & Collapse Trigger */}
      <div className="border-t border-slate-800 p-3 space-y-2">
        {!isCollapsed && (
          <div className="rounded-xl bg-slate-800/60 p-3 text-xs border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-[11px] uppercase tracking-wide">Pabrik Batu Karang</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <p className="font-bold text-slate-200">Divisi Produksi I</p>
            <p className="text-[10px] text-slate-400 mt-0.5">26 Hari Kerja • Sistem Terpadu</p>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 py-2.5 text-xs font-semibold text-slate-300 transition-colors"
          title={isCollapsed ? 'Perlebar Sidebar' : 'Kecilkan Sidebar (Icon Only)'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Tutup Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
