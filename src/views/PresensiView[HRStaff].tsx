/**
 * PresensiView[HRStaff].tsx
 * Modul Pencatatan Presensi & Ijin, Batch Input Multi-Tanggal, & Cetak Formulir Ijin Resmi
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  FileCheck,
  FileText,
  Filter,
  Info,
  Plus,
  Printer,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { gasStore } from '../gasService[HRStaff]';
import { BULAN_NAMES, fmtTanggalIndo } from '../terPph21[HRStaff]';
import { JenisIjin, PresensiItem, SuratIjinData, UserRole } from '../types[HRStaff]';

interface PresensiViewProps {
  onOpenSuratIjin: (data: SuratIjinData) => void;
  userRole: UserRole;
}

const JENIS_IJIN_LIST: JenisIjin[] = [
  'Hadir',
  'Sakit (S Dokter)',
  'Sakit (S Tangan)',
  'Ijin Normatif',
  'Ijin (S Tangan)',
  'Ijin Terlambat',
  'Ijin Keluar Sementara',
  'Ijin Pulang Awal',
  'Alpha',
];

export const PresensiView: React.FC<PresensiViewProps> = ({ onOpenSuratIjin, userRole }) => {
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState<number>(0);
  const [selectedTahun, setSelectedTahun] = useState<number>(now.getFullYear());
  const [selectedNama, setSelectedNama] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tick, setTick] = useState(0);

  React.useEffect(() => {
    return gasStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  // Modals & Panels
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PresensiItem | null>(null);

  // Form Add States
  const [addNama, setAddNama] = useState('');
  const [addTglAwal, setAddTglAwal] = useState(now.toISOString().slice(0, 10));
  const [addTglAkhir, setAddTglAkhir] = useState('');
  const [addJenisIjin, setAddJenisIjin] = useState<JenisIjin>('Sakit (S Dokter)');
  const [addSehariPenuh, setAddSehariPenuh] = useState(true);
  const [addJamAwal, setAddJamAwal] = useState('08:00');
  const [addJamAkhir, setAddJamAkhir] = useState('15:00');
  const [addKeperluan, setAddKeperluan] = useState('');
  const [addLampiran, setAddLampiran] = useState<'Ya' | 'Tidak'>('Ya');
  const [addCatatan, setAddCatatan] = useState('');

  const staffList = gasStore.getStaffList();
  const presensiList = useMemo(() => {
    return gasStore.getPresensiList(selectedBulan, selectedTahun, selectedNama);
  }, [selectedBulan, selectedTahun, selectedNama, tick]);

  // Filtered List
  const filteredList = useMemo(() => {
    return presensiList.filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        p.jenisIjin.toLowerCase().includes(q) ||
        (p.keperluan && p.keperluan.toLowerCase().includes(q))
      );
    });
  }, [presensiList, searchQuery]);

  // Sehari Penuh hour auto helper
  const getStandardHours = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay(); // 0 Sun, 6 Sat
    if (day === 6) {
      return { awal: '08:00', akhir: '13:00', durasi: 300 }; // Sabtu 5 jam
    }
    return { awal: '08:00', akhir: '15:00', durasi: 420 }; // Senin-Jumat 7 jam
  };

  const handleOpenAdd = () => {
    if (staffList.length > 0 && !addNama) {
      setAddNama(staffList[0].nama);
    }
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addNama || !addTglAwal || !addJenisIjin) {
      alert('Nama, Tanggal Awal, dan Jenis Ijin wajib diisi.');
      return;
    }

    const tglAwalObj = new Date(addTglAwal);
    const tglAkhirObj = addTglAkhir ? new Date(addTglAkhir) : tglAwalObj;

    if (tglAkhirObj < tglAwalObj) {
      alert('Tanggal Akhir tidak boleh sebelum Tanggal Awal.');
      return;
    }

    // Generate date array (exclude Sundays)
    const dates: string[] = [];
    const curr = new Date(tglAwalObj);
    while (curr <= tglAkhirObj) {
      if (curr.getDay() !== 0) {
        dates.push(curr.toISOString().slice(0, 10));
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (dates.length === 0) {
      alert('Tidak ada hari kerja dalam rentang tanggal tersebut (semua hari Minggu).');
      return;
    }

    const tanggalList = dates.map((dStr) => {
      let jamA = addJamAwal;
      let jamB = addJamAkhir;
      let dur = 0;

      if (addSehariPenuh) {
        const std = getStandardHours(dStr);
        jamA = std.awal;
        jamB = std.akhir;
        dur = std.durasi;
      } else {
        if (jamA && jamB) {
          const [h1, m1] = jamA.split(':').map(Number);
          const [h2, m2] = jamB.split(':').map(Number);
          dur = Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));
        }
      }

      return {
        tanggal: dStr,
        jamAwal: jamA,
        jamAkhir: jamB,
        durasi: dur,
      };
    });

    gasStore.addPresensiBatch({
      nama: addNama,
      jenisIjin: addJenisIjin,
      keperluan: addKeperluan,
      lampiran: addLampiran,
      catatan: addCatatan,
      tanggalList,
    });

    setIsAddOpen(false);
    setAddKeperluan('');
    setAddCatatan('');
  };

  const handleOpenEdit = (item: PresensiItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let dur = editingItem.durasi || 0;
    if (editingItem.jamAwal && editingItem.jamAkhir) {
      const [h1, m1] = editingItem.jamAwal.split(':').map(Number);
      const [h2, m2] = editingItem.jamAkhir.split(':').map(Number);
      dur = Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));
    }

    gasStore.updatePresensi(editingItem.rowNum, {
      ...editingItem,
      durasi: dur,
    });

    setEditingItem(null);
  };

  const handleDelete = (rowNum: number, nama: string, tanggal: string) => {
    if (confirm(`Yakin ingin menghapus data presensi/ijin untuk ${nama} (${tanggal})?`)) {
      gasStore.deletePresensi(rowNum);
      if (editingItem && editingItem.rowNum === rowNum) {
        setEditingItem(null);
      }
    }
  };

  // Surat Ijin Creator Helper
  const handlePrintSuratIjin = (item: PresensiItem) => {
    const staff = gasStore.getStaffByName(item.nama);
    const d = new Date(item.tanggal);
    const tzHari = item.hari;
    const tglFmt = fmtTanggalIndo(item.tanggal);

    // Map Jenis Ijin to official checkbox
    let cb: SuratIjinData['checkbox'] = 'formKehadiran';
    if (item.jenisIjin === 'Ijin Normatif') cb = 'normatif';
    else if (
      item.jenisIjin.startsWith('Sakit') ||
      item.jenisIjin === 'Ijin (S Tangan)' ||
      item.jenisIjin === 'Alpha'
    )
      cb = 'tidakMasuk';
    else if (item.jenisIjin === 'Ijin Terlambat') cb = 'terlambat';
    else if (item.jenisIjin === 'Ijin Keluar Sementara') cb = 'keluarSementara';
    else if (item.jenisIjin === 'Ijin Pulang Awal') cb = 'pulangCepat';

    const dur = item.durasi || 0;
    const jamBagian = Math.floor(dur / 60);
    const menitBagian = dur % 60;

    let jamMasuk = '';
    let jamKeluar = '';
    let jamMasukKembali = '';

    if (item.jenisIjin === 'Ijin Terlambat') {
      jamMasuk = item.jamAkhir || '';
    } else if (item.jenisIjin === 'Ijin Pulang Awal') {
      jamKeluar = item.jamAwal || '';
    } else if (item.jenisIjin === 'Ijin Keluar Sementara') {
      jamKeluar = item.jamAwal || '';
      jamMasukKembali = item.jamAkhir || '';
    }

    const nowD = new Date();
    const tglCetak = `${String(nowD.getDate()).padStart(2, '0')} ${BULAN_NAMES[nowD.getMonth()]}`;
    const thnCetak = String(nowD.getFullYear()).slice(-2);

    onOpenSuratIjin({
      nama: item.nama,
      jabatan: staff?.jabatan || 'Staff Operasional',
      divisi: 'Produksi I',
      unit: staff?.sekup || 'Operasional',
      checkbox: cb,
      hari: tzHari,
      tanggal: tglFmt,
      keperluan: item.keperluan || '',
      jamMasuk,
      jamKeluar,
      jamMasukKembali,
      jamBagian,
      menitBagian,
      tglCetak,
      thnCetak,
    });
  };

  const handleExportPDF = () => {
    const originalTitle = document.title;
    // Ketentuan Tambahan #6: nama file export selalu: nama project diikuti nama tab/field yang sedang diexport
    document.title = 'HR Staff System - Daftar Ijin Ketidakhadiran';
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Info: Ketentuan Ijin & Faktor Potongan */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 leading-relaxed shadow-xs flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Ketentuan Faktor Potongan Upah: </strong>
          Seluruh staff dianggap <span className="font-bold text-emerald-800">Hadir Penuh</span> (26 hari/bulan) secara
          otomatis. Catat hanya ketidakhadiran/ijin: Hadir, Sakit Dokter & Ijin Normatif dibayar penuh (Faktor 0);
          Terlambat/Keluar/Pulang Awal: ≤ 2 jam dibayar penuh (0), 2-4 jam potong setengah hari (0.5), &gt; 4 jam hangus
          (1.0); Sakit Tanpa Dokter, Ijin Tangan, & Alpha hangus penuh (1.0).
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Daftar Ijin / Ketidakhadiran Staff
            </h2>
            <p className="text-xs text-slate-500">Pencatatan rekap ketidakhadiran & faktor potongan gaji</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors"
              type="button"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Ijin</span>
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

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Bulan</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-800"
            >
              <option value={0}>Semua Bulan (Jan - Des)</option>
              {BULAN_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Tahun</label>
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
            <label className="block font-semibold text-slate-600 mb-1">Filter Staff</label>
            <select
              value={selectedNama}
              onChange={(e) => setSelectedNama(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-800"
            >
              <option value="Semua">-- Semua Staff --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.nama}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Pencarian Cepat</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, jenis ijin, keperluan..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Presensi Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Hari</th>
                <th className="p-3">Nama Staff</th>
                <th className="p-3">Jenis Ijin</th>
                <th className="p-3">Jam / Durasi</th>
                <th className="p-3">Faktor Potongan</th>
                <th className="p-3">Keperluan</th>
                <th className="p-3">Lampiran</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  let badgeClass = 'bg-blue-100 text-blue-800';
                  if (item.jenisIjin === 'Alpha') badgeClass = 'bg-rose-100 text-rose-800 font-bold';
                  else if (item.jenisIjin.startsWith('Sakit')) badgeClass = 'bg-amber-100 text-amber-800';
                  else if (item.jenisIjin === 'Hadir') badgeClass = 'bg-emerald-100 text-emerald-800';

                  const jamText =
                    item.jamAwal && item.jamAkhir
                      ? `${item.jamAwal} - ${item.jamAkhir} (${item.durasi}m)`
                      : 'Sehari Penuh';

                  return (
                    <tr key={item.rowNum} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                        {fmtTanggalIndo(item.tanggal)}
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{item.hari}</td>
                      <td className="p-3 font-bold text-slate-800 whitespace-nowrap">{item.nama}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] ${badgeClass}`}>
                          {item.jenisIjin}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap text-slate-600">{jamText}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-full ${
                            item.faktorPotongan === 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.faktorPotongan === 0.5
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.faktorPotongan === 0 ? '0 (100% Dibayar)' : item.faktorPotongan === 0.5 ? '0,5 (Setengah)' : '1,0 (Hangus)'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-[200px] truncate" title={item.keperluan}>
                        {item.keperluan || '—'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            item.lampiran === 'Ya' ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {item.lampiran}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePrintSuratIjin(item)}
                            className="rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 text-[11px] font-bold transition-colors"
                            title="Cetak Formulir Surat Permohonan Ijin"
                            type="button"
                          >
                            🖨️ Surat Ijin
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-1 text-[11px] font-semibold transition-colors"
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.rowNum, item.nama, item.tanggal)}
                            className="rounded-lg text-rose-600 hover:bg-rose-50 p-1 transition-colors"
                            title="Hapus data ini"
                            type="button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">
                    Tidak ada catatan ijin/ketidakhadiran pada periode ini. Seluruh staff berstatus Hadir Penuh.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / PANEL TAMBAH IJIN (MULTI-DAY BATCH SUPPORT) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tambah Ijin / Ketidakhadiran Staff</h3>
                <p className="text-xs text-slate-500">Mendukung input satu tanggal atau rentang hari sekaligus</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Awal *</label>
                  <input
                    type="date"
                    required
                    value={addTglAwal}
                    onChange={(e) => setAddTglAwal(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Akhir <span className="font-normal text-slate-400">(opsional, jika &gt;1 hari)</span>
                  </label>
                  <input
                    type="date"
                    value={addTglAkhir}
                    onChange={(e) => setAddTglAkhir(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Staff *</label>
                <select
                  required
                  value={addNama}
                  onChange={(e) => setAddNama(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.nama}>
                      {s.nama} ({s.jabatan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Ijin *</label>
                <select
                  required
                  value={addJenisIjin}
                  onChange={(e) => setAddJenisIjin(e.target.value as JenisIjin)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
                >
                  {JENIS_IJIN_LIST.filter((j) => j !== 'Hadir').map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sehari Penuh Checkbox */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={addSehariPenuh}
                    onChange={(e) => setAddSehariPenuh(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <span>Sehari Penuh (Jam & durasi otomatis terisi sesuai hari kerja resmi)</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  Senin-Jumat: 08:00 - 15:00 (420 menit) • Sabtu: 08:00 - 13:00 (300 menit)
                </p>
              </div>

              {!addSehariPenuh && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jam Awal</label>
                    <input
                      type="time"
                      value={addJamAwal}
                      onChange={(e) => setAddJamAwal(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jam Akhir</label>
                    <input
                      type="time"
                      value={addJamAkhir}
                      onChange={(e) => setAddJamAkhir(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keperluan / Keterangan</label>
                <input
                  type="text"
                  value={addKeperluan}
                  onChange={(e) => setAddKeperluan(e.target.value)}
                  placeholder="Contoh: Sakit demam berdarah rawat inap / urusan keluarga"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lampiran Surat</label>
                  <select
                    value={addLampiran}
                    onChange={(e) => setAddLampiran(e.target.value as 'Ya' | 'Tidak')}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  >
                    <option value="Ya">Ya (Ada Surat Dokter / Bukti)</option>
                    <option value="Tidak">Tidak</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    value={addCatatan}
                    onChange={(e) => setAddCatatan(e.target.value)}
                    placeholder="Catatan mandor / persetujuan"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PRENSEI */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit Data Presensi / Ijin</h3>
                <p className="text-xs text-slate-500">
                  {editingItem.nama} • {fmtTanggalIndo(editingItem.tanggal)}
                </p>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={editingItem.tanggal}
                  onChange={(e) => setEditingItem({ ...editingItem, tanggal: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status / Jenis Ijin</label>
                <select
                  required
                  value={editingItem.jenisIjin}
                  onChange={(e) => setEditingItem({ ...editingItem, jenisIjin: e.target.value as JenisIjin })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
                >
                  {JENIS_IJIN_LIST.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Awal</label>
                  <input
                    type="time"
                    value={editingItem.jamAwal || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, jamAwal: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Akhir</label>
                  <input
                    type="time"
                    value={editingItem.jamAkhir || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, jamAkhir: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keperluan</label>
                <input
                  type="text"
                  value={editingItem.keperluan || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, keperluan: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lampiran</label>
                  <select
                    value={editingItem.lampiran}
                    onChange={(e) => setEditingItem({ ...editingItem, lampiran: e.target.value as 'Ya' | 'Tidak' })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  >
                    <option value="Ya">Ya</option>
                    <option value="Tidak">Tidak</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan</label>
                  <input
                    type="text"
                    value={editingItem.catatan || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, catatan: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDelete(editingItem.rowNum, editingItem.nama, editingItem.tanggal)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 font-bold text-rose-700 hover:bg-rose-100"
                >
                  Hapus Data
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
