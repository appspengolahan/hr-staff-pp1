/**
 * SwitchBoardModal[HRStaff].tsx
 * Modal Switch Board untuk Berpindah Antar Aplikasi Operasional Pabrik PT Batu Karang
 * Divisi Produksi I
 * Developed by Lalu Mahendra
 */

import React from 'react';
import {
  ArrowUpRight,
  Boxes,
  Briefcase,
  CheckCircle,
  ExternalLink,
  Factory,
  Flame,
  Gauge,
  HardHat,
  Scale,
  Users2,
  Wrench,
  X,
} from 'lucide-react';

interface SwitchBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OperationalApp {
  id: string;
  name: string;
  subtitle: string;
  category: 'HR & Kepegawaian' | 'Produksi & Material' | 'Kualitas & Teknik';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  url: string;
  isCurrent?: boolean;
}

export const SwitchBoardModal: React.FC<SwitchBoardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const apps: OperationalApp[] = [
    {
      id: 'hr-staff',
      name: 'HR Staff System',
      subtitle: 'Presensi, Lembur, Payroll & Database Staff Bulanan',
      category: 'HR & Kepegawaian',
      icon: Briefcase,
      color: 'from-blue-600 to-indigo-700',
      url: '#',
      isCurrent: true,
    },
    {
      id: 'hr-pekerja',
      name: 'HR Pekerja PP1',
      subtitle: 'Absensi Harian Mandor, Tukang, & Pekerja Borongan',
      category: 'HR & Kepegawaian',
      icon: HardHat,
      color: 'from-amber-500 to-orange-600',
      url: 'https://appspengolahan.github.io/HR-Pekerja-PP1/',
    },
    {
      id: 'rekap-blend',
      name: 'Rekap Blend PP1',
      subtitle: 'Komposisi Formula Campuran & Pencatatan Bahan Baku',
      category: 'Produksi & Material',
      icon: Flame,
      color: 'from-rose-600 to-red-700',
      url: '#rekap-blend',
    },
    {
      id: 'qc-lab',
      name: 'Quality Control Lab',
      subtitle: 'Uji Kuat Tekan, Slump Test, & Sertifikasi Mutu',
      category: 'Kualitas & Teknik',
      icon: Gauge,
      color: 'from-teal-600 to-emerald-700',
      url: '#qc-lab',
    },
    {
      id: 'logistik',
      name: 'Logistik & Jembatan Timbang',
      subtitle: 'Penerimaan Agregat, Semen, & Muatan Truk Tronton',
      category: 'Produksi & Material',
      icon: Scale,
      color: 'from-cyan-600 to-blue-700',
      url: '#logistik',
    },
    {
      id: 'maintenance',
      name: 'Maintenance Mesin & Utilitas',
      subtitle: 'Jadwal Servis Crusher, Batching Plant, & Genset',
      category: 'Kualitas & Teknik',
      icon: Wrench,
      color: 'from-slate-700 to-slate-900',
      url: '#maintenance',
    },
    {
      id: 'portal-induk',
      name: 'Portal Produksi Induk',
      subtitle: 'Monitoring Terpusat Seluruh Lini Divisi Produksi I',
      category: 'Produksi & Material',
      icon: Factory,
      color: 'from-indigo-600 to-purple-800',
      url: '#portal-induk',
    },
  ];

  const handleAppLaunch = (app: OperationalApp) => {
    if (app.isCurrent) {
      onClose();
      return;
    }
    if (app.url.startsWith('http')) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Membuka modul ${app.name} di lingkungan pabrik...`);
    }
    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="h-5 w-5 text-indigo-600" />
              Modal Switch Board — Sistem Operasional Pabrik
            </h2>
            <p className="text-xs text-slate-500">PT Batu Karang • Divisi Produksi I</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content App Grid */}
        <div className="overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Pilih aplikasi operasional untuk berpindah antar modul pabrik secara mulus tanpa membuka URL manual:
          </p>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {apps.map((app) => {
              const Icon = app.icon;

              return (
                <div
                  key={app.id}
                  onClick={() => handleAppLaunch(app)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                    app.isCurrent
                      ? 'border-blue-400 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${app.color} text-white shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {app.isCurrent ? (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          <CheckCircle className="h-3 w-3" />
                          Aplikasi Aktif
                        </span>
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {app.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {app.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-500">{app.category}</span>
                    <span className="text-slate-400 font-medium">Buka Modul →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center text-xs text-slate-500">
          PT Batu Karang Divisi Produksi I • Dikembangkan oleh Lalu Mahendra
        </div>
      </div>
    </div>
  );
};
