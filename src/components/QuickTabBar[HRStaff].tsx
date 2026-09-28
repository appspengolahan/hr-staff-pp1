/**
 * QuickTabBar[HRStaff].tsx
 * Mobile & Tablet Quick Scroll Tab Bar
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React from 'react';
import {
  BarChart3,
  CalendarCheck,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Receipt,
  UserCheck,
  Users,
} from 'lucide-react';
import { ActiveTab } from '../types[HRStaff]';

interface QuickTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pkwtAlertCount: number;
  calonAlertCount: number;
}

export const QuickTabBar: React.FC<QuickTabBarProps> = ({
  activeTab,
  onTabChange,
  pkwtAlertCount,
  calonAlertCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'presensi', label: 'Presensi & Ijin', icon: CalendarCheck },
    { id: 'lembur', label: 'Lembur', icon: Clock },
    { id: 'rekap', label: 'Rekap Presensi', icon: BarChart3 },
    { id: 'slip', label: 'Slip Gaji', icon: Receipt },
    { id: 'database', label: 'Database Staff', icon: Users, badge: pkwtAlertCount },
    { id: 'pelatihan', label: 'Calon Karyawan', icon: GraduationCap, badge: calonAlertCount },
    { id: 'profil', label: 'Profil Staff', icon: UserCheck },
  ];

  return (
    <nav className="no-print lg:hidden sticky top-16 z-20 flex w-full overflow-x-auto border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur-sm shadow-xs scrollbar-none">
      <div className="flex items-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
              className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 text-[10px] text-white px-1">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
