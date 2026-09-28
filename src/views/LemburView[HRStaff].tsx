/**
 * LemburView[HRStaff].tsx
 * Modul Pencatatan Lembur Staff Multi-Checklist & Perhitungan Flat 2x Tarif Harian
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Coins,
  FileSpreadsheet,
  Info,
  Printer,
  Search,
  Users,
} from 'lucide-react';
import { gasStore } from '../gasService[HRStaff]';
import { BULAN_NAMES, fmtRupiah, fmtTanggalIndo } from '../terPph21[HRStaff]';
import { KategoriLembur, UserRole } from '../types[HRStaff]';

interface LemburViewProps {
  userRole: UserRole;
}

const KATEGORI_LEMBUR_LIST: KategoriLembur[] = [
  'Minggu',
  'Tanggal Merah/Libur Nasional',
  'Di Luar Jam Kerja (Weekday/Sabtu)',
];

export const LemburView: React.FC<LemburViewProps> = ({ userRole }) => {
  const now = new Date();
  const [selectedTahun, setSelectedTahun] = useState<number>(now.getFullYear());
  const [selectedBulan, setSelectedBulan] = useState<number>(now.getMonth() + 1);
  const [searchTableQuery, setSearchTableQuery] = useState('');

  // Form Lembur State
  const [tglLembur, setTglLembur] = useState(now.toISOString().slice(0, 10));
  const [kategoriLembur, setKategoriLembur] = useState<KategoriLembur>('Minggu');
  const [jamMulai, setJamMulai] = useState('08:30');
  const [jamSelesai, setJamSelesai] = useState('16:00');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [selectedStaffNames, setSelectedStaffNames] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const staffList = gasStore.getStaffList().filter((s) => s.statusAktif === 'Aktif');
  const lemburList = gasStore.getLemburList(selectedTahun);

  // Filtered staff list for checklist
  const filteredStaffForChecklist = useMemo(() => {
    return staffList.filter((s) => {
      if (!staffSearchQuery) return true;
      const q = staffSearchQuery.toLowerCase();
      return s.nama.toLowerCase().includes(q) || s.jabatan.toLowerCase().includes(q);
    });
  }, [staffList, staffSearchQuery]);

  // Lembur bulan ini
  const lemburBulanIni = useMemo(() => {
    return lemburList.filter((l) => l.bulan === selectedBulan && l.tahun === selectedTahun);
  }, [lemburList, selectedBulan, selectedTahun]);

  const totalNominalBulanIni = lemburBulanIni.reduce((sum, l) => sum + l.nominal, 0);

  // Filtered Table
  const filteredLemburTable = useMemo(() => {
    return lemburList.filter((l) => {
      if (selectedBulan && l.bulan !== selectedBulan) return false;
      if (!searchTableQuery) return true;
      const q = searchTableQuery.toLowerCase();
      return l.nama.toLowerCase().includes(q) || l.kategori.toLowerCase().includes(q);
    });
  }, [lemburList, selectedBulan, searchTableQuery]);

  // Ranking Lembur
  const rankingLembur = useMemo(() => {
    const agg: { [nama: string]: { nama: string; jml: number; totalNominal: number } } = {};
    lemburList.forEach((l) => {
      if (!agg[l.nama]) agg[l.nama] = { nama: l.nama, jml: 0, totalNominal: 0 };
      agg[l.nama].jml += 1;
      agg[l.nama].totalNominal += l.nominal;
    });
    return Object.values(agg).sort((a, b) => b.totalNominal - a.totalNominal);
  }, [lemburList]);

  // Toggle staff selection
  const handleToggleStaff = (nama: string) => {
    if (selectedStaffNames.includes(nama)) {
      setSelectedStaffNames(selectedStaffNames.filter((n) => n !== nama));
    } else {
      setSelectedStaffNames([...selectedStaffNames, nama]);
    }
  };

  const handleSelectAllVisible = () => {
    const allVis = filteredStaffForChecklist.map((s) => s.nama);
    const combined = Array.from(new Set([...selectedStaffNames, ...allVis]));
    setSelectedStaffNames(combined);
  };

  const handleDeselectAll = () => {
    setSelectedStaffNames([]);
  };

  const handleSubmitLembur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tglLembur || selectedStaffNames.length === 0) {
      setFormStatus({
        message: 'Pilih tanggal dan minimal 1 orang staff.',
        type: 'error',
      });
      return;
    }

    const res = gasStore.addLemburBatch({
      tanggal: tglLembur,
      namaList: selectedStaffNames,
      kategori: kategoriLembur,
      jamMulai,
      jamSelesai,
    });

    setFormStatus({
      message: res.message,
      type: 'success',
    });
    setSelectedStaffNames([]);
    setTimeout(() => setFormStatus(null), 4000);
  };

  const handleExportPDF = () => {
    const originalTitle = document.title;
    // Ketentuan Tambahan #6: nama file export selalu: nama project diikuti nama tab/field yang sedang diexport
    document.title = 'HR Staff System - Ringkasan Lembur';
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Aturan Lembur Staff */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-xs text-indigo-900 leading-relaxed shadow-xs flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Ketentuan Lembur Staff Divisi Produksi I: </strong>
          Lembur staff hanya dihitung jika berlangsung <strong>di luar jam kerja resmi</strong> (Minggu, Tanggal
          Merah/Libur Nasional, atau tugas darurat malam hari). Sesuai kesepakatan manajemen pabrik, kompensasi dibayar{' '}
          <strong>flat 2× tarif harian</strong> (<code>((Gaji Pokok + Tunjangan Jabatan) ÷ 26) × 2</code>) per kejadian,
          berapa pun jumlah jam lembur pada hari tersebut (bukan hitungan per jam bertingkat).
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Form Catat Lembur Multi-Staff (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Catat Lembur Staff
            </h2>
            <p className="text-xs text-slate-500">Mendukung pemilihan banyak staff sekaligus dalam satu kejadian</p>
          </div>

          <form onSubmit={handleSubmitLembur} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Lembur *</label>
              <input
                type="date"
                required
                value={tglLembur}
                onChange={(e) => setTglLembur(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Lembur *</label>
              <select
                required
                value={kategoriLembur}
                onChange={(e) => setKategoriLembur(e.target.value as KategoriLembur)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
              >
                {KATEGORI_LEMBUR_LIST.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jam Mulai (Info)</label>
                <input
                  type="time"
                  value={jamMulai}
                  onChange={(e) => setJamMulai(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jam Selesai (Info)</label>
                <input
                  type="time"
                  value={jamSelesai}
                  onChange={(e) => setJamSelesai(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>
            </div>

            {/* Checklist Staff Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">
                  Pilih Staff ({selectedStaffNames.length} dipilih) *
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Pilih Semua
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              <div className="relative mb-2">
                <input
                  type="text"
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  placeholder="Cari nama staff..."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-7 pr-2.5 py-1.5 text-xs focus:bg-white focus:outline-none"
                />
                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2 space-y-1">
                {filteredStaffForChecklist.map((s) => {
                  const isChecked = selectedStaffNames.includes(s.nama);
                  return (
                    <label
                      key={s.id}
                      onClick={() => handleToggleStaff(s.nama)}
                      className={`flex items-center justify-between rounded-lg p-2 cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-100 text-blue-900 font-bold' : 'hover:bg-slate-200/60 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="h-3.5 w-3.5 rounded text-blue-600"
                        />
                        <span>{s.nama}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">{s.sekup}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              Simpan Lembur Staff
            </button>

            {formStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  formStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {formStatus.message}
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Ringkasan Bulan Ini & Riwayat (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Ringkasan Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ringkasan Lembur Bulan {BULAN_NAMES[selectedBulan - 1]} {selectedTahun}
                </h3>
                <p className="text-xs text-slate-500">Total kompensasi lembur flat yang dibebankan ke penggajian</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedBulan}
                  onChange={(e) => setSelectedBulan(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800"
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
                  className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
                <button
                  onClick={handleExportPDF}
                  className="btn-export inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  type="button"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="block text-xs font-semibold text-slate-500">Jumlah Kejadian Lembur</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {lemburBulanIni.length} kali
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Staff operasional & administrasi</span>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4">
                <span className="block text-xs font-semibold text-indigo-700">Total Nominal Flat 2×</span>
                <span className="text-2xl font-black text-indigo-900 mt-1 block">
                  {fmtRupiah(totalNominalBulanIni)}
                </span>
                <span className="text-[11px] text-indigo-700 mt-0.5 block">Otomatis masuk ke Slip Gaji</span>
              </div>
            </div>
          </div>

          {/* Riwayat Lembur Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Riwayat Catatan Lembur</h3>
              <div className="relative w-48">
                <input
                  type="text"
                  value={searchTableQuery}
                  onChange={(e) => setSearchTableQuery(e.target.value)}
                  placeholder="Cari staff / kategori..."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-7 pr-2.5 py-1 text-xs"
                />
                <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-72">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[10px] sticky top-0">
                  <tr>
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5">Nama Staff</th>
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5">Jam</th>
                    <th className="p-2.5 text-right">Nominal (Flat 2x)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLemburTable.length > 0 ? (
                    filteredLemburTable.map((item) => (
                      <tr key={item.rowNum} className="hover:bg-slate-50">
                        <td className="p-2.5 whitespace-nowrap font-medium text-slate-900">
                          {fmtTanggalIndo(item.tanggal)}
                        </td>
                        <td className="p-2.5 whitespace-nowrap font-bold text-slate-800">{item.nama}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-slate-500">
                          {item.jamMulai && item.jamSelesai ? `${item.jamMulai}-${item.jamSelesai}` : '—'}
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-right font-black text-indigo-900">
                          {fmtRupiah(item.nominal)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">
                        Tidak ada riwayat lembur pada bulan ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ranking Lembur Tahunan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              Ranking Total Lembur Staff (Tahun {selectedTahun})
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Nama Staff</th>
                    <th className="p-2.5">Jumlah Kejadian</th>
                    <th className="p-2.5 text-right">Total Akumulasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rankingLembur.slice(0, 5).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-400">#{i + 1}</td>
                      <td className="p-2.5 font-bold text-slate-800">{r.nama}</td>
                      <td className="p-2.5 font-semibold text-slate-600">{r.jml} kali lembur</td>
                      <td className="p-2.5 text-right font-black text-indigo-900">{fmtRupiah(r.totalNominal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
