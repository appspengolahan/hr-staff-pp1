/**
 * DashboardView[HRStaff].tsx
 * Dashboard Eksekutif & Ringkasan Metrik Operasional HR Staff — Divisi Produksi I
 * Developed by Lalu Mahendra
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  CalendarCheck,
  CheckCircle,
  Clock,
  DollarSign,
  GraduationCap,
  Printer,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { gasStore } from '../gasService[HRStaff]';
import { BULAN_NAMES, fmtPersen, fmtRupiah } from '../terPph21[HRStaff]';
import { ActiveTab, UserRole } from '../types[HRStaff]';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  userRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, userRole }) => {
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState<number>(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState<number>(now.getFullYear());
  const [rankingTahun, setRankingTahun] = useState<number>(now.getFullYear());

  const staffList = gasStore.getStaffList();
  const lemburList = gasStore.getLemburList(selectedTahun);
  const calonList = gasStore.getCalonList();

  const totalStaff = staffList.length;
  const aktifStaff = staffList.filter((s) => s.statusAktif === 'Aktif');
  const operasionalCount = staffList.filter((s) => s.sekup === 'Operasional').length;
  const administrasiCount = staffList.filter((s) => s.sekup === 'Administrasi').length;
  const tetapCount = staffList.filter((s) => s.status === 'TETAP').length;
  const pkwtCount = staffList.filter((s) => s.status.startsWith('PKWT')).length;

  // Lembur Bulan Ini
  const lemburBulanIni = lemburList.filter((l) => l.bulan === selectedBulan && l.tahun === selectedTahun);
  const totalNominalLemburBulanIni = lemburBulanIni.reduce((sum, l) => sum + l.nominal, 0);

  // PKWT Alerts (sisa hari <= 26 hari)
  const pkwtAlerts = staffList
    .filter((s) => {
      if (s.status === 'TETAP' || !s.akhirPKWT || s.statusAktif !== 'Aktif') return false;
      const ta = new Date(s.akhirPKWT);
      const diffDays = Math.ceil((ta.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 26;
    })
    .map((s) => {
      const ta = new Date(s.akhirPKWT!);
      const sisa = Math.ceil((ta.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        nama: s.nama,
        jabatan: s.jabatan,
        akhirPKWT: s.akhirPKWT,
        sisaHari: sisa,
      };
    })
    .sort((a, b) => a.sisaHari - b.sisaHari);

  // Calon Karyawan Alerts (sisa hari < 10 hari)
  const calonAlerts = calonList.filter((c) => c.status === 'Sedang Berjalan' && c.sisaHari < 10);

  // Beban Gaji Dashboard
  const bebanGaji = gasStore.getDashboardBebanGaji(selectedBulan, selectedTahun);

  // Rekap & Ranking Kehadiran
  const rekapStaff = gasStore.getRekapTahunan(rankingTahun);
  const sortedKehadiran = [...rekapStaff].sort((a, b) => b.pctKehadiran - a.pctKehadiran);
  const terbaikKehadiran = sortedKehadiran.slice(0, 5);
  const perhatianKehadiran = [...rekapStaff].sort((a, b) => a.pctKehadiran - b.pctKehadiran).slice(0, 5);

  // Ranking Lembur
  const lemburAgg: { [nama: string]: { nama: string; jml: number; nominal: number } } = {};
  lemburList.forEach((l) => {
    if (!lemburAgg[l.nama]) lemburAgg[l.nama] = { nama: l.nama, jml: 0, nominal: 0 };
    lemburAgg[l.nama].jml += 1;
    lemburAgg[l.nama].nominal += l.nominal;
  });
  const rankingLembur = Object.values(lemburAgg)
    .sort((a, b) => b.nominal - a.nominal)
    .slice(0, 5);

  const handleExportPDF = () => {
    const originalTitle = document.title;
    document.title = 'HR Staff System - Dashboard Ringkasan';
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard Ringkasan Operasional</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Divisi Produksi I PT Batu Karang • Pantauan Ketenagakerjaan, Lembur & Beban Upah
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="btn-export inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            type="button"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* ALERT BANNERS (IF ANY) */}
      {pkwtAlerts.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Perhatian: {pkwtAlerts.length} Staff PKWT Memasuki Akhir Masa Kontrak (≤ 26 Hari)
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Segera tindak lanjuti evaluasi kinerja untuk perpanjangan kontrak atau pengangkatan tetap.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pkwtAlerts.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                    >
                      <span>{s.nama}</span>
                      <span className="text-slate-400">({s.jabatan})</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          s.sisaHari <= 7 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.sisaHari >= 0 ? `${s.sisaHari} hari lagi` : `Berakhir ${Math.abs(s.sisaHari)} hari lalu`}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('database')}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-950 shrink-0"
            >
              Buka Database →
            </button>
          </div>
        </div>
      )}

      {calonAlerts.length > 0 && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-900">
                  {calonAlerts.length} Calon Karyawan Menjelang Evaluasi Akhir Pelatihan (&lt; 10 Hari)
                </h3>
                <p className="text-xs text-blue-700 mt-0.5">
                  Tinjau catatan hasil pelatihan seleksi untuk kelulusan ke PKWT 1 atau perpanjangan.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('pelatihan')}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
            >
              Proses Evaluasi
            </button>
          </div>
        </div>
      )}

      {/* METRIC KPI STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Staff</div>
          <div className="text-2xl font-black text-slate-900">{totalStaff}</div>
          <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
            <Users className="h-3 w-3 text-blue-600" />
            <span>Divisi Produksi I</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Staff Aktif</div>
          <div className="text-2xl font-black text-emerald-600">{aktifStaff.length}</div>
          <div className="text-[11px] font-medium text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>100% Siap Kerja</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Operasional</div>
          <div className="text-2xl font-black text-blue-700">{operasionalCount}</div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">Lapangan & Pabrik</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Administrasi</div>
          <div className="text-2xl font-black text-indigo-700">{administrasiCount}</div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">Kantor & Timbangan</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Staff Tetap</div>
          <div className="text-2xl font-black text-slate-800">{tetapCount}</div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">Karyawan Organik</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status PKWT</div>
          <div className="text-2xl font-black text-amber-600">{pkwtCount}</div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">Perjanjian Waktu Tertentu</div>
        </div>
      </div>

      {/* BEBAN GAJI DIVISI PRODUKSI I */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Beban Gaji Bulanan (Gaji Pokok + Tunjangan Jabatan)
            </h2>
            <p className="text-xs text-slate-500">
              Total ketentuan upah seluruh staff aktif dikurangi potongan ijin (Faktor Potongan). Tidak termasuk lembur.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              {BULAN_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3.5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="block text-xs font-semibold text-slate-500">
              Total Ketentuan ({bebanGaji.jumlahStaffAktif} Staff Aktif)
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {fmtRupiah(bebanGaji.totalKetentuan)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Ketentuan baku gaji divisi</span>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
            <span className="block text-xs font-semibold text-rose-700">
              Total Potongan Ijin ({BULAN_NAMES[selectedBulan - 1]} {selectedTahun})
            </span>
            <span className="text-xl font-black text-rose-700 mt-1 block">
              - {fmtRupiah(bebanGaji.totalPotongan)}
            </span>
            <span className="text-[11px] text-rose-600 mt-0.5 block">Akumulasi faktor potongan upah</span>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
            <span className="block text-xs font-semibold text-blue-800">Total Setelah Potongan Upah</span>
            <span className="text-xl font-black text-blue-900 mt-1 block">
              {fmtRupiah(bebanGaji.totalSetelahPotongan)}
            </span>
            <span className="text-[11px] text-blue-700 mt-0.5 block">Sebelum perhitungan lembur & BPJS</span>
          </div>
        </div>

        {/* Lembur Info Card */}
        <div className="rounded-xl bg-slate-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-slate-200">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-indigo-600" />
            <div>
              <span className="font-bold text-slate-800">
                Lembur Bulan {BULAN_NAMES[selectedBulan - 1]}:{' '}
              </span>
              <span className="font-semibold text-slate-600">
                {lemburBulanIni.length} kejadian dicatat
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Total Nominal Flat 2x:</span>
            <span className="font-bold text-indigo-700 text-sm">{fmtRupiah(totalNominalLemburBulanIni)}</span>
          </div>
        </div>
      </div>

      {/* RANKING SECTION (PRESENSI & LEMBUR) */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Peringkat Kehadiran */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Peringkat Kehadiran Staff (Tahun {rankingTahun})
              </h3>
              <p className="text-[11px] text-slate-500">Kalkulasi 10.440 menit kerja standar per bulan</p>
            </div>
            <select
              value={rankingTahun}
              onChange={(e) => setRankingTahun(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                5 Kehadiran Terbaik
              </h4>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-xs">
                {terbaikKehadiran.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{s.nama}</p>
                        <p className="text-[10px] text-slate-500">{s.jabatan}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                      {fmtPersen(s.pctKehadiran)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5" />
                5 Perlu Perhatian
              </h4>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-xs">
                {perhatianKehadiran.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{s.nama}</p>
                        <p className="text-[10px] text-slate-500">{s.jabatan}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-extrabold text-rose-700 border border-rose-200">
                      {fmtPersen(s.pctKehadiran)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Lembur Terbanyak */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                Ranking Lembur Terbanyak (Tahun {selectedTahun})
              </h3>
              <p className="text-[11px] text-slate-500">Total nominal kompensasi lembur flat 2× tarif harian</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-xs">
            {rankingLembur.length > 0 ? (
              rankingLembur.map((l, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-800 font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">{l.nama}</p>
                      <p className="text-[10px] text-slate-500">{l.jml} kali lembur tercatat</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-indigo-900 text-sm block">{fmtRupiah(l.nominal)}</span>
                    <span className="text-[10px] text-slate-400">Total Kompensasi</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500">Belum ada data lembur untuk tahun ini.</div>
            )}
          </div>

          {/* Shortcut buttons */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('presensi')}
              className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2 text-xs font-bold text-slate-700 transition-colors"
            >
              + Catat Ijin
            </button>
            <button
              onClick={() => onNavigateTab('lembur')}
              className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2 text-xs font-bold text-slate-700 transition-colors"
            >
              + Catat Lembur
            </button>
            <button
              onClick={() => onNavigateTab('slip')}
              className="flex-1 rounded-xl bg-blue-50 hover:bg-blue-100 py-2 text-xs font-bold text-blue-700 transition-colors"
            >
              Buka Slip Gaji →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
