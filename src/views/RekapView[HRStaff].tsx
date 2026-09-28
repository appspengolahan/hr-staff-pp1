/**
 * RekapView[HRStaff].tsx
 * Modul Rekapitulasi Presensi Tahunan, Tren Kehadiran Bulanan, & Ranking Staff
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React, { useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  Calendar,
  Filter,
  Info,
  LineChart,
  Printer,
  TrendingUp,
  Users,
} from 'lucide-react';
import { gasStore } from '../gasService[HRStaff]';
import {
  BULAN_NAMES,
  BULAN_SHORT,
  fmtPersen,
  MENIT_STANDAR_PER_BULAN,
} from '../terPph21[HRStaff]';
import { UserRole } from '../types[HRStaff]';

interface RekapViewProps {
  userRole: UserRole;
}

export const RekapView: React.FC<RekapViewProps> = ({ userRole }) => {
  const now = new Date();
  const [selectedTahun, setSelectedTahun] = useState<number>(now.getFullYear());
  const [bulanAwal, setBulanAwal] = useState<number>(1);
  const [bulanAkhir, setBulanAkhir] = useState<number>(12);
  const [namaFilter, setNamaFilter] = useState<string>('Semua');

  const staffList = gasStore.getStaffList();
  const rekapData = useMemo(() => {
    return gasStore.getRekapTahunan(selectedTahun, namaFilter);
  }, [selectedTahun, namaFilter]);

  // Calculate monthly average trend across staff
  const trendBulanan = useMemo(() => {
    const list: { label: string; bulan: number; pct: number }[] = [];
    const count = rekapData.length;
    if (count === 0) return list;

    for (let m = bulanAwal; m <= bulanAkhir; m++) {
      let totalIjinBulan = 0;
      rekapData.forEach((s) => {
        const item = s.bulanan.find((b) => b.bulan === m);
        totalIjinBulan += item ? item.menit : 0;
      });

      const avgIjin = totalIjinBulan / count;
      const pct = Math.max(0, Math.min(100, 100 - (avgIjin / MENIT_STANDAR_PER_BULAN) * 100));
      list.push({
        label: BULAN_SHORT[m - 1],
        bulan: m,
        pct: Math.round(pct * 100) / 100,
      });
    }
    return list;
  }, [rekapData, bulanAwal, bulanAkhir]);

  // Ranking calculated for selected range
  const rankedStaff = useMemo(() => {
    const jmlBulan = Math.max(1, bulanAkhir - bulanAwal + 1);
    const totalTersediaPeriode = MENIT_STANDAR_PER_BULAN * jmlBulan;

    return rekapData
      .map((s) => {
        let totalIjinPeriode = 0;
        for (let m = bulanAwal; m <= bulanAkhir; m++) {
          const b = s.bulanan.find((item) => item.bulan === m);
          if (b) totalIjinPeriode += b.menit;
        }
        const pct = Math.max(
          0,
          Math.min(100, Math.round((100 - (totalIjinPeriode / totalTersediaPeriode) * 100) * 100) / 100)
        );
        return {
          nama: s.nama,
          jabatan: s.jabatan,
          sekup: s.sekup,
          totalIjinPeriode,
          pct,
        };
      })
      .sort((a, b) => a.pct - b.pct); // Lowest to highest for chart
  }, [rekapData, bulanAwal, bulanAkhir]);

  const handleExportPDF = () => {
    const originalTitle = document.title;
    // Ketentuan Tambahan #6: nama file export selalu: nama project diikuti nama tab/field yang sedang diexport
    document.title = `HR Staff System - Rekap Presensi Tahunan - ${selectedTahun}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Rekapitulasi Presensi Tahunan
            </h2>
            <p className="text-xs text-slate-500">
              Total menit ketidakhadiran per bulan (Jan–Des) dan persentase kehadiran standar 26 hari/bulan
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

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Tahun Presensi</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-800"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Bulan Awal</label>
            <select
              value={bulanAwal}
              onChange={(e) => setBulanAwal(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-800"
            >
              {BULAN_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Bulan Akhir</label>
            <select
              value={bulanAkhir}
              onChange={(e) => setBulanAkhir(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-800"
            >
              {BULAN_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Filter Staff</label>
            <select
              value={namaFilter}
              onChange={(e) => setNamaFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-800"
            >
              <option value="Semua">-- Semua Staff --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.nama}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-2.5 sticky left-0 bg-slate-100 z-10">Nama Staff</th>
                {BULAN_SHORT.map((b, i) => (
                  <th key={b} className="p-2.5 text-center min-w-[42px]">
                    {b}
                  </th>
                ))}
                <th className="p-2.5 text-center">Total Ijin</th>
                <th className="p-2.5 text-right">% Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rekapData.map((row) => (
                <tr key={row.nama} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900 sticky left-0 bg-white hover:bg-slate-50 whitespace-nowrap z-10">
                    {row.nama}
                  </td>
                  {row.bulanan.map((b) => (
                    <td
                      key={b.bulan}
                      className={`p-2.5 text-center font-mono ${
                        b.menit > 0 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-400'
                      }`}
                    >
                      {b.menit > 0 ? b.menit : 0}
                    </td>
                  ))}
                  <td className="p-2.5 text-center font-bold text-slate-800 font-mono">
                    {row.totalIjin} m
                  </td>
                  <td className="p-2.5 text-right whitespace-nowrap">
                    <span
                      className={`rounded-full px-2 py-0.5 font-extrabold text-xs ${
                        row.pctKehadiran >= 95
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : row.pctKehadiran >= 90
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {fmtPersen(row.pctKehadiran)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TREND CHART: Rata-Rata Kehadiran Bulanan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Tren Rata-Rata % Kehadiran Bulanan (Tahun {selectedTahun})
            </h3>
            <p className="text-xs text-slate-500">
              Evaluasi rata-rata persentase kehadiran seluruh staff pada periode {BULAN_NAMES[bulanAwal - 1]} – {BULAN_NAMES[bulanAkhir - 1]}
            </p>
          </div>
        </div>

        {/* SVG Responsive Line Chart */}
        <div className="h-64 w-full pt-4">
          {trendBulanan.length > 0 ? (
            <div className="flex h-full flex-col justify-between">
              {/* Bars and labels */}
              <div className="flex h-48 items-end gap-2 sm:gap-4 px-2">
                {trendBulanan.map((item, idx) => {
                  const heightPercent = Math.max(10, item.pct);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[11px] font-bold text-slate-700 opacity-90 group-hover:text-blue-700">
                        {fmtPersen(item.pct)}
                      </span>
                      <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg overflow-hidden h-36 flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            item.pct >= 95
                              ? 'bg-gradient-to-t from-blue-700 to-indigo-600'
                              : item.pct >= 90
                              ? 'bg-gradient-to-t from-amber-600 to-amber-500'
                              : 'bg-gradient-to-t from-rose-600 to-rose-500'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">
              Tidak ada data pada periode ini.
            </div>
          )}
        </div>
      </div>

      {/* RANKING CHART STAFF DENGAN COLOR CODING */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Grafik Ranking Kehadiran Staff (Periode Terpilih)
            </h3>
            <p className="text-xs text-slate-500">
              Diurutkan dari yang perlu perhatian ke yang paling prima.{' '}
              <span className="text-rose-600 font-bold">&lt; 90% Merah</span>,{' '}
              <span className="text-amber-600 font-bold">90-95% Oranye</span>,{' '}
              <span className="text-blue-700 font-bold">≥ 95% Biru</span>.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {rankedStaff.map((staff, i) => {
            let barColor = 'bg-blue-600';
            let textColor = 'text-blue-700';
            if (staff.pct < 90) {
              barColor = 'bg-rose-500';
              textColor = 'text-rose-600';
            } else if (staff.pct < 95) {
              barColor = 'bg-amber-500';
              textColor = 'text-amber-700';
            }

            return (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-36 sm:w-48 font-bold text-slate-800 truncate" title={staff.nama}>
                  {staff.nama}
                </span>

                <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden flex items-center px-1">
                  <div
                    style={{ width: `${Math.max(5, staff.pct)}%` }}
                    className={`h-4 rounded-md transition-all duration-300 ${barColor}`}
                  />
                </div>

                <span className={`w-16 text-right font-black ${textColor}`}>
                  {fmtPersen(staff.pct)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
