/**
 * ProfilKaryawanView[HRStaff].tsx
 * Modul Profil Karyawan Lengkap, Parameter Presensi Bulan Lalu vs Ini, Grafik Tren, & Link Arsip Drive
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle2,
  DollarSign,
  Edit,
  ExternalLink,
  FileText,
  FolderOpen,
  Link as LinkIcon,
  Percent,
  Plus,
  Printer,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { gasStore } from '../gasService[HRStaff]';
import {
  BULAN_NAMES,
  BULAN_SHORT,
  fmtPersen,
  fmtRupiah,
  fmtSatuDesimal,
  fmtTanggalIndo,
  MENIT_STANDAR_PER_BULAN,
} from '../terPph21[HRStaff]';
import {
  JenisKelamin,
  SekupKaryawan,
  StaffMember,
  StatusAktifKaryawan,
  StatusKepegawaian,
  StatusPTKP,
  UserRole,
} from '../types[HRStaff]';

interface ProfilKaryawanViewProps {
  initialStaffName?: string;
  userRole: UserRole;
}

const UMK_BERLAKU = 3500000; // UMK Kabupaten Malang

export const ProfilKaryawanView: React.FC<ProfilKaryawanViewProps> = ({ initialStaffName, userRole }) => {
  const staffList = gasStore.getStaffList();
  const [selectedStaffNama, setSelectedStaffNama] = useState<string>(
    initialStaffName || staffList[0]?.nama || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Selected Staff
  const currentStaff = useMemo(() => {
    return gasStore.getStaffByName(selectedStaffNama) || staffList[0];
  }, [selectedStaffNama, staffList]);

  // Edit State
  const [editFormData, setEditFormData] = useState<Partial<StaffMember>>({});

  const handleStartEdit = () => {
    if (!currentStaff) return;
    setEditFormData({ ...currentStaff });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff) return;

    const res = gasStore.updateStaff(currentStaff.nama, editFormData);
    alert(res.message);
    setIsEditing(false);
  };

  // Links for staff
  const staffLinks = useMemo(() => {
    if (!currentStaff) return [];
    return gasStore.getLinksForStaff(currentStaff.nama);
  }, [currentStaff, staffList]);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff || !linkLabel || !linkUrl) return;

    gasStore.addLinkArsip({
      nama: currentStaff.nama,
      label: linkLabel,
      url: linkUrl,
    });
    setLinkLabel('');
    setLinkUrl('');
    setIsAddLinkOpen(false);
  };

  const handleDeleteLink = (row: number) => {
    if (confirm('Hapus link arsip ini?')) {
      gasStore.deleteLinkArsip(row);
    }
  };

  // Presensi Metrics for current year
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1; // 1-12

  const staffPresensiThisYear = useMemo(() => {
    if (!currentStaff) return [];
    return gasStore
      .getPresensiList(undefined, curYear, currentStaff.nama)
      .filter((p) => p.tahun === curYear);
  }, [currentStaff, curYear]);

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    const list: { label: string; bulan: number; menitIjin: number; pct: number }[] = [];
    for (let m = 1; m <= 12; m++) {
      const monthLogs = staffPresensiThisYear.filter((p) => p.bulan === m);
      const totalMenit = monthLogs.reduce((sum, p) => sum + (p.durasi || 0), 0);
      const pct = Math.max(0, Math.min(100, 100 - (totalMenit / MENIT_STANDAR_PER_BULAN) * 100));
      list.push({
        label: BULAN_SHORT[m - 1],
        bulan: m,
        menitIjin: totalMenit,
        pct: Math.round(pct * 100) / 100,
      });
    }
    return list;
  }, [staffPresensiThisYear]);

  // Parameter Presensi Comparison: Bulan Ini vs Bulan Lalu
  const pctBulanIni = monthlyData[curMonth - 1]?.pct ?? 100;
  const pctBulanLalu = curMonth > 1 ? monthlyData[curMonth - 2]?.pct ?? 100 : null;

  const classifyIndex = (pct: number) => {
    if (pct >= 95) return { label: 'Baik', color: 'bg-emerald-100 text-emerald-800' };
    if (pct >= 90) return { label: 'Cukup', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Kurang', color: 'bg-rose-100 text-rose-800' };
  };

  const indexBulanIni = classifyIndex(pctBulanIni);
  const indexBulanLalu = pctBulanLalu !== null ? classifyIndex(pctBulanLalu) : null;

  let progressStatus = 'Stabil';
  let progressColor = 'text-slate-600';
  if (pctBulanLalu !== null) {
    if (pctBulanIni - pctBulanLalu > 0.5) {
      progressStatus = 'Membaik';
      progressColor = 'text-emerald-700';
    } else if (pctBulanLalu - pctBulanIni > 0.5) {
      progressStatus = 'Menurun';
      progressColor = 'text-rose-700';
    }
  }

  // Presensi per Jenis Ijin
  const jenisIjinAgg = useMemo(() => {
    const map: { [jenis: string]: number } = {};
    staffPresensiThisYear.forEach((p) => {
      map[p.jenisIjin] = (map[p.jenisIjin] || 0) + (p.durasi || 0);
    });
    const totalSetahun = MENIT_STANDAR_PER_BULAN * 12;
    return Object.entries(map).map(([jenis, menit]) => ({
      jenis,
      menit,
      pct: Math.round((menit / totalSetahun) * 10000) / 100,
    }));
  }, [staffPresensiThisYear]);

  const totalIjinMenitSetahun = jenisIjinAgg.reduce((sum, item) => sum + item.menit, 0);
  const totalIjinPctSetahun =
    Math.round((totalIjinMenitSetahun / (MENIT_STANDAR_PER_BULAN * 12)) * 10000) / 100;

  const handleExportPDF = () => {
    if (!currentStaff) return;
    const originalTitle = document.title;
    // Ketentuan Tambahan #6: nama file export selalu: nama project diikuti nama tab/field yang sedang diexport
    document.title = `HR Staff System - Profil Karyawan - ${currentStaff.nama}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  if (!currentStaff) {
    return <div className="p-8 text-center text-slate-500">Data staff tidak ditemukan.</div>;
  }

  const pengaliUMK = currentStaff.gajiPokok ? currentStaff.gajiPokok / UMK_BERLAKU : 1;

  return (
    <div className="space-y-6">
      {/* Top Selector Card */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Staff</label>
          <select
            value={selectedStaffNama}
            onChange={(e) => setSelectedStaffNama(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:bg-white"
          >
            {staffList.map((s) => (
              <option key={s.id} value={s.nama}>
                {s.nama} — {s.jabatan} ({s.sekup})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
            type="button"
          >
            <Edit className="h-4 w-4 text-blue-600" />
            <span>Edit Profil</span>
          </button>

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

      {/* Profil Header Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-black text-xl shadow-sm">
              {currentStaff.nama.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">{currentStaff.nama}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    currentStaff.statusAktif === 'Aktif'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {currentStaff.statusAktif}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {currentStaff.jabatan} • {currentStaff.level} • {currentStaff.sekup}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Status Kepegawaian</span>
            <span className="text-base font-extrabold text-blue-800">{currentStaff.status}</span>
          </div>
        </div>

        {/* 1. Detail Identitas Personal & Faskes */}
        <div>
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Identitas Data Pokok Karyawan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">No. KTP / NIK</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">{currentStaff.nik || '—'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">No. KK</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">{currentStaff.kk || '—'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">NPWP</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">{currentStaff.npwp || '—'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Email Perusahaan</span>
              <span className="font-bold text-slate-800 mt-0.5 block truncate">{currentStaff.email || '—'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Bank & Rekening</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {currentStaff.bank ? `${currentStaff.bank} - ${currentStaff.rekening}` : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">No. Telepon / WA</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{currentStaff.telp || '—'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Domisili</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{currentStaff.domisili || '—'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Fasilitas Kesehatan (Faskes)</span>
              <span className="font-bold text-slate-800 mt-0.5 block truncate">{currentStaff.faskes || '—'}</span>
            </div>
          </div>
        </div>

        {/* 2. Detail Administratif & Kontrak PKWT */}
        <div>
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-600" />
            Administratif & Masa Kontrak
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Status Sanksi</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{currentStaff.sanksi || 'Tidak Ada'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Awal PKWT</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {currentStaff.status === 'TETAP' ? 'Tidak berlaku (TETAP)' : fmtTanggalIndo(currentStaff.awalPKWT)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Akhir PKWT</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {currentStaff.status === 'TETAP' ? 'Tidak berlaku (TETAP)' : fmtTanggalIndo(currentStaff.akhirPKWT)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Limit Masa PKWT</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{currentStaff.limitPKWT || '—'}</span>
            </div>
          </div>
          {currentStaff.deskripsiJabatan && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-0.5">Uraian / Deskripsi Tugas Jabatan:</span>
              <p className="text-slate-600 leading-relaxed">{currentStaff.deskripsiJabatan}</p>
            </div>
          )}
        </div>

        {/* 3. Parameter Presensi Bulan Lalu vs Ini */}
        <div>
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Percent className="h-4 w-4 text-emerald-600" />
            Parameter Presensi (Bulan Lalu vs Bulan Ini)
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {/* Bulan Lalu */}
            <div className="text-center min-w-[130px]">
              <span className="text-xs text-slate-500 block">
                {curMonth > 1 ? BULAN_NAMES[curMonth - 2] : 'Desember'}
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {pctBulanLalu !== null ? fmtPersen(pctBulanLalu) : '—'}
              </span>
              {indexBulanLalu && (
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold mt-1 ${indexBulanLalu.color}`}>
                  {indexBulanLalu.label}
                </span>
              )}
            </div>

            {/* Arrow & Progress */}
            <div className="flex flex-col items-center">
              <span className="text-2xl text-slate-400">→</span>
              <span className={`text-xs font-bold mt-1 flex items-center gap-1 ${progressColor}`}>
                {progressStatus === 'Membaik' && <TrendingUp className="h-3.5 w-3.5" />}
                {progressStatus === 'Menurun' && <TrendingDown className="h-3.5 w-3.5" />}
                {progressStatus}
              </span>
            </div>

            {/* Bulan Ini */}
            <div className="text-center min-w-[130px]">
              <span className="text-xs text-slate-500 block">{BULAN_NAMES[curMonth - 1]}</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">
                {fmtPersen(pctBulanIni)}
              </span>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold mt-1 ${indexBulanIni.color}`}>
                {indexBulanIni.label}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Grafik Tren Bulanan & Detail Presensi */}
        <div className="grid lg:grid-cols-2 gap-5 pt-2">
          {/* SVG Grafik */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-600" />
              Grafik Kehadiran Bulanan (Tahun {curYear})
            </h4>
            <div className="h-44 w-full flex items-end gap-1.5 pt-4">
              {monthlyData.map((item) => (
                <div key={item.bulan} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-slate-100 rounded-t-md h-32 flex items-end">
                    <div
                      style={{ height: `${Math.max(10, item.pct)}%` }}
                      className={`w-full rounded-t-md ${
                        item.pct >= 95 ? 'bg-blue-600' : item.pct >= 90 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Ijin per Jenis */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs">Detail Ketidakhadiran ({curYear})</h4>
              <span className="text-[11px] font-bold text-slate-500">
                Total: {totalIjinMenitSetahun} menit ({fmtPersen(totalIjinPctSetahun)})
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 text-[10px]">
                  <tr>
                    <th className="p-2">Jenis Ijin</th>
                    <th className="p-2 text-right">Durasi (Menit)</th>
                    <th className="p-2 text-right">% dari Total Jam Kerja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {jenisIjinAgg.length > 0 ? (
                    jenisIjinAgg.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-medium">{item.jenis}</td>
                        <td className="p-2 text-right font-mono font-semibold">{item.menit} m</td>
                        <td className="p-2 text-right font-bold text-slate-700">{fmtPersen(item.pct)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-slate-400">
                        Belum ada ijin tercatat tahun ini (100% Hadir).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 5. Detail Komponen Gaji & Rasio UMK */}
        <div>
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Detail Ketentuan Gaji & Rasio UMK
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Gaji Pokok</span>
              <span className="font-black text-slate-900 text-sm mt-1 block">
                {fmtRupiah(currentStaff.gajiPokok)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Tunjangan Jabatan</span>
              <span className="font-black text-slate-900 text-sm mt-1 block">
                {fmtRupiah(currentStaff.tunjangan)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-blue-700 block text-[11px] font-semibold">Total Ketentuan Upah</span>
              <span className="font-black text-blue-900 text-sm mt-1 block">
                {fmtRupiah(currentStaff.gajiPokok + currentStaff.tunjangan)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Rasio Pengali UMK</span>
              <span className="font-black text-slate-900 text-sm mt-1 block">
                {fmtSatuDesimal(pengaliUMK)} × UMK
              </span>
              <span className="text-[10px] text-slate-400 block">Dasar UMK: {fmtRupiah(UMK_BERLAKU)}</span>
            </div>
          </div>
        </div>

        {/* 6. Link Arsip Administratif (Google Drive) */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-indigo-600" />
              Link Arsip Administratif (Google Drive)
            </h3>
            <button
              onClick={() => setIsAddLinkOpen(true)}
              className="no-print flex items-center gap-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 text-xs font-bold transition-colors"
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Link</span>
            </button>
          </div>

          <div className="space-y-2">
            {staffLinks.length > 0 ? (
              staffLinks.map((link) => (
                <div
                  key={link.row}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <LinkIcon className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{link.label}</span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-sm sm:max-w-md">
                        {link.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 text-[11px] shadow-2xs"
                    >
                      <span>Buka File</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      onClick={() => handleDeleteLink(link.row)}
                      className="no-print rounded-lg text-rose-600 hover:bg-rose-50 p-1"
                      title="Hapus Link"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                Belum ada tautan berkas arsip (Google Drive, folder SK, kontrak kerja) untuk staff ini.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH LINK ARSIP */}
      {isAddLinkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Link Arsip Administratif</h3>
              <button onClick={() => setIsAddLinkOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddLink} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Label Dokumen *</label>
                <input
                  type="text"
                  required
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="Contoh: SK Pengangkatan Tetap / Ijazah / Sertifikat K3"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Google Drive / Berkas *</label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLinkOpen(false)}
                  className="rounded-xl border border-slate-300 px-3.5 py-1.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-1.5 font-bold text-white hover:bg-blue-700"
                >
                  Simpan Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PROFIL STAFF LENGKAP */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit Profil Karyawan</h3>
                <p className="text-xs text-slate-500">{currentStaff.nama}</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={editFormData.jabatan || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, jabatan: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Level / Kategori</label>
                  <input
                    type="text"
                    value={editFormData.level || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sekup Divisi</label>
                  <select
                    value={editFormData.sekup || 'Operasional'}
                    onChange={(e) => setEditFormData({ ...editFormData, sekup: e.target.value as SekupKaryawan })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
                  >
                    <option value="Operasional">Operasional</option>
                    <option value="Administrasi">Administrasi</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={editFormData.status || 'PKWT 1'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as StatusKepegawaian })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
                  >
                    <option value="TETAP">TETAP</option>
                    <option value="PKWT 1">PKWT 1</option>
                    <option value="PKWT 2">PKWT 2</option>
                    <option value="PKWT 3">PKWT 3</option>
                    <option value="MAGANG">MAGANG</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={editFormData.statusAktif || 'Aktif'}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, statusAktif: e.target.value as StatusAktifKaryawan })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non Aktif">Non Aktif</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    value={editFormData.gajiPokok || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, gajiPokok: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tunjangan Jabatan (Rp)</label>
                  <input
                    type="number"
                    value={editFormData.tunjangan || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, tunjangan: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status PTKP</label>
                  <select
                    value={editFormData.statusPTKP || 'TK/0'}
                    onChange={(e) => setEditFormData({ ...editFormData, statusPTKP: e.target.value as StatusPTKP })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  >
                    <option value="TK/0">TK/0</option>
                    <option value="TK/1 (Lajang + 1 Tanggungan)">TK/1 (Lajang + 1 Tanggungan)</option>
                    <option value="TK/2 (Lajang + 2 Tanggungan)">TK/2 (Lajang + 2 Tanggungan)</option>
                    <option value="TK/3 (Lajang + 3 Tanggungan)">TK/3 (Lajang + 3 Tanggungan)</option>
                    <option value="K/0 (Kawin, 0 Tanggungan)">K/0 (Kawin, 0 Tanggungan)</option>
                    <option value="K/1 (Kawin + 1 Tanggungan)">K/1 (Kawin + 1 Tanggungan)</option>
                    <option value="K/2 (Kawin + 2 Tanggungan)">K/2 (Kawin + 2 Tanggungan)</option>
                    <option value="K/3 (Kawin + 3 Tanggungan)">K/3 (Kawin + 3 Tanggungan)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal BPJS Kesehatan (Rp)</label>
                  <input
                    type="number"
                    value={editFormData.bpjsKesehatanNominal || 0}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, bpjsKesehatanNominal: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. KTP / NIK</label>
                  <input
                    type="text"
                    value={editFormData.nik || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nik: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fasilitas Kesehatan (Faskes)</label>
                  <input
                    type="text"
                    value={editFormData.faskes || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, faskes: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
