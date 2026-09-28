/**
 * DatabaseStaffView[HRStaff].tsx
 * Modul Database Karyawan, Alert Masa PKWT, Penambahan Staff & Form Pengajuan Mutasi
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  CheckCircle,
  FileText,
  Filter,
  History,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { gasStore } from '../gasService[HRStaff]';
import { fmtRupiah, fmtTanggalIndo } from '../terPph21[HRStaff]';
import {
  JenisKelamin,
  SekupKaryawan,
  StaffMember,
  StatusAktifKaryawan,
  StatusKepegawaian,
  StatusPTKP,
  UserRole,
} from '../types[HRStaff]';

interface DatabaseStaffViewProps {
  userRole: UserRole;
  onOpenProfil: (nama: string) => void;
}

const STATUS_KEPEGAWAIAN_OPTIONS: StatusKepegawaian[] = [
  'TETAP',
  'PKWT 1',
  'PKWT 2',
  'PKWT 3',
  'PKWT 4',
  'PKWT 5',
  'PKWT 6',
  'PKWT 7',
  'MAGANG',
];

const STATUS_PTKP_OPTIONS: StatusPTKP[] = [
  'TK/0',
  'TK/1 (Lajang + 1 Tanggungan)',
  'TK/2 (Lajang + 2 Tanggungan)',
  'TK/3 (Lajang + 3 Tanggungan)',
  'K/0 (Kawin, 0 Tanggungan)',
  'K/1 (Kawin + 1 Tanggungan)',
  'K/2 (Kawin + 2 Tanggungan)',
  'K/3 (Kawin + 3 Tanggungan)',
];

const JENIS_MUTASI_OPTIONS = [
  'Jabatan',
  'Level/Kategori',
  'Sekup',
  'Status Kepegawaian',
  'Status Aktif',
  'Gaji Pokok',
  'Tunjangan Jabatan',
  'Domisili',
  'Proyeksi Jabatan',
  'Sanksi',
  'Awal PKWT',
  'Akhir PKWT',
  'Limit PKWT',
  'Plafon Level/Kategori',
  'Deskripsi Jabatan',
  'Faskes',
  'Nominal BPJS Kesehatan',
];

export const DatabaseStaffView: React.FC<DatabaseStaffViewProps> = ({ userRole, onOpenProfil }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSekup, setFilterSekup] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<StaffMember | null>(null);

  // Form Add Staff State
  const [newNama, setNewNama] = useState('');
  const [newJabatan, setNewJabatan] = useState('');
  const [newLevel, setNewLevel] = useState('Staff Pratama');
  const [newSekup, setNewSekup] = useState<SekupKaryawan>('Operasional');
  const [newStatus, setNewStatus] = useState<StatusKepegawaian>('PKWT 1');
  const [newJk, setNewJk] = useState<JenisKelamin>('Laki-laki');
  const [newNik, setNewNik] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDomisili, setNewDomisili] = useState('Malang');
  const [newGajiPokok, setNewGajiPokok] = useState<number>(3500000);
  const [newTunjangan, setNewTunjangan] = useState<number>(500000);
  const [newStatusPTKP, setNewStatusPTKP] = useState<StatusPTKP>('TK/0');
  const [newBpjsKs, setNewBpjsKs] = useState<number>(100000);
  const [newAwalPKWT, setNewAwalPKWT] = useState('');
  const [newAkhirPKWT, setNewAkhirPKWT] = useState('');
  const [newLimitPKWT, setNewLimitPKWT] = useState('');
  const [newProyeksi, setNewProyeksi] = useState('');
  const [newPlafon, setNewPlafon] = useState('Grade 1');

  // Form Mutasi State
  const [mutJenis, setMutJenis] = useState(JENIS_MUTASI_OPTIONS[0]);
  const [mutTanggal, setMutTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [mutNilaiBaru, setMutNilaiBaru] = useState('');
  const [mutKeterangan, setMutKeterangan] = useState('');

  const staffList = gasStore.getStaffList();
  const now = new Date();

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      if (filterSekup !== 'Semua' && s.sekup !== filterSekup) return false;
      if (filterStatus !== 'Semua' && s.statusAktif !== filterStatus) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.nama.toLowerCase().includes(q) ||
        s.jabatan.toLowerCase().includes(q) ||
        s.sekup.toLowerCase().includes(q)
      );
    });
  }, [staffList, filterSekup, filterStatus, searchQuery]);

  // PKWT Alerts (<= 26 days)
  const pkwtAlerts = useMemo(() => {
    return staffList
      .filter((s) => {
        if (s.status === 'TETAP' || !s.akhirPKWT || s.statusAktif !== 'Aktif') return false;
        const ta = new Date(s.akhirPKWT);
        const sisa = Math.ceil((ta.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return sisa <= 26;
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
  }, [staffList]);

  const handleOpenDetail = (staff: StaffMember) => {
    setSelectedStaffDetail(staff);
    setMutNilaiBaru('');
    setMutKeterangan('');
  };

  const handleSaveAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama) {
      alert('Nama wajib diisi.');
      return;
    }

    const res = gasStore.addStaff({
      nama: newNama,
      jabatan: newJabatan || 'Staff Operasional',
      level: newLevel,
      sekup: newSekup,
      status: newStatus,
      statusAktif: 'Aktif',
      jk: newJk,
      nik: newNik || '3507' + Math.floor(100000000000 + Math.random() * 900000000000),
      email: newEmail || `${newNama.toLowerCase().replace(/[^a-z0-9]/g, '')}@batukarang.id`,
      domisili: newDomisili,
      gajiPokok: newGajiPokok,
      tunjangan: newTunjangan,
      statusPTKP: newStatusPTKP,
      bpjsKesehatanNominal: newBpjsKs,
      awalPKWT: newAwalPKWT,
      akhirPKWT: newAkhirPKWT,
      limitPKWT: newLimitPKWT || (newStatus.startsWith('PKWT') ? `Kontrak ${newStatus}` : 'Tidak berlaku (TETAP)'),
      proyeksiJabatan: newProyeksi,
      plafonLevel: newPlafon,
    });

    alert(res.message);
    setIsAddOpen(false);
    setNewNama('');
    setNewJabatan('');
  };

  const handleSaveMutasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffDetail || !mutTanggal || !mutNilaiBaru) {
      alert('Tanggal Efektif dan Nilai Baru wajib diisi.');
      return;
    }

    const res = gasStore.submitMutasi({
      nama: selectedStaffDetail.nama,
      jenisMutasi: mutJenis,
      tanggalEfektif: mutTanggal,
      nilaiBaru: mutNilaiBaru,
      keterangan: mutKeterangan,
    });

    alert(res.message);
    // Refresh detail
    const updated = gasStore.getStaffByName(selectedStaffDetail.nama);
    if (updated) setSelectedStaffDetail(updated);
    setMutNilaiBaru('');
    setMutKeterangan('');
  };

  const handleExportPDF = () => {
    const originalTitle = document.title;
    // Ketentuan Tambahan #6: nama file export selalu: nama project diikuti nama tab/field yang sedang diexport
    document.title = 'HR Staff System - Database Karyawan';
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const mutasiHistory = useMemo(() => {
    if (!selectedStaffDetail) return [];
    return gasStore.getMutasiHistory(selectedStaffDetail.nama);
  }, [selectedStaffDetail, staffList]);

  return (
    <div className="space-y-6">
      {/* Top PKWT Alert Banner */}
      {pkwtAlerts.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                ⚠️ Peringatan Masa Kontrak PKWT Segera Berakhir (≤ 26 Hari)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Berikut staff yang perlu evaluasi penilaian kinerja bulanan untuk penentuan perpanjangan kontrak:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pkwtAlerts.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                  >
                    <span>{s.nama}</span>
                    <span className="text-slate-400">({s.jabatan})</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
        </div>
      )}

      {/* Main Database Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Database Karyawan (MASTER_STAFF)
            </h2>
            <p className="text-xs text-slate-500">
              Total {staffList.length} staff tercatat di Divisi Produksi I PT Batu Karang
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors"
              type="button"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Staff Baru</span>
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

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Pencarian</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, jabatan, sekup..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2.5 py-1.5 font-medium text-slate-800"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Sekup Divisi</label>
            <select
              value={filterSekup}
              onChange={(e) => setFilterSekup(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-800"
            >
              <option value="Semua">-- Semua Sekup --</option>
              <option value="Operasional">Operasional</option>
              <option value="Administrasi">Administrasi</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Status Keaktifan</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-800"
            >
              <option value="Semua">-- Semua Status --</option>
              <option value="Aktif">Aktif</option>
              <option value="Non Aktif">Non Aktif</option>
            </select>
          </div>
        </div>

        {/* Table Master Staff */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Nama Staff</th>
                <th className="p-3">Jabatan</th>
                <th className="p-3">Sekup</th>
                <th className="p-3">Status</th>
                <th className="p-3">Keaktifan</th>
                <th className="p-3">Akhir PKWT</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStaff.map((s) => {
                let pkwtBadge = null;
                if (s.status !== 'TETAP' && s.akhirPKWT) {
                  const ta = new Date(s.akhirPKWT);
                  const sisa = Math.ceil((ta.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  if (sisa <= 26) {
                    pkwtBadge = (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          sisa <= 7 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sisa} hari
                      </span>
                    );
                  }
                }

                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400">#{s.id}</td>
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                      <button
                        onClick={() => onOpenProfil(s.nama)}
                        className="text-left hover:text-blue-700 hover:underline"
                        title="Klik untuk membuka Profil Karyawan Lengkap"
                      >
                        {s.nama}
                      </button>
                    </td>
                    <td className="p-3 font-medium text-slate-800 whitespace-nowrap">{s.jabatan}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          s.sekup === 'Operasional' ? 'bg-blue-50 text-blue-800' : 'bg-indigo-50 text-indigo-800'
                        }`}
                      >
                        {s.sekup}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium text-slate-700">{s.status}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          s.statusAktif === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.statusAktif}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">
                          {s.status === 'TETAP' ? 'Tidak berlaku' : fmtTanggalIndo(s.akhirPKWT)}
                        </span>
                        {pkwtBadge}
                      </div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(s)}
                          className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 text-[11px] font-bold transition-colors"
                        >
                          Detail & Mutasi
                        </button>
                        <button
                          onClick={() => onOpenProfil(s.nama)}
                          className="rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-1 text-[11px] font-semibold transition-colors"
                        >
                          Profil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / PANEL DETAIL STAFF & AJUKAN MUTASI */}
      {selectedStaffDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  Detail Staff & Mutasi: {selectedStaffDetail.nama}
                </h3>
                <p className="text-xs text-slate-500">ID #{selectedStaffDetail.id} • {selectedStaffDetail.jabatan}</p>
              </div>
              <button
                onClick={() => setSelectedStaffDetail(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6 text-xs">
              {/* Profile Overview Grid */}
              <div className="grid sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Jabatan</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedStaffDetail.jabatan}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Level / Kategori</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedStaffDetail.level}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Sekup</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedStaffDetail.sekup}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status Kepegawaian</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedStaffDetail.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Gaji Pokok</span>
                  <span className="font-bold text-slate-800 text-sm">{fmtRupiah(selectedStaffDetail.gajiPokok)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Tunjangan Jabatan</span>
                  <span className="font-bold text-slate-800 text-sm">{fmtRupiah(selectedStaffDetail.tunjangan)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status PTKP</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedStaffDetail.statusPTKP}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Akhir PKWT</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedStaffDetail.status === 'TETAP' ? 'Tidak berlaku (TETAP)' : fmtTanggalIndo(selectedStaffDetail.akhirPKWT)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Nominal BPJS Kesehatan</span>
                  <span className="font-bold text-slate-800 text-sm">{fmtRupiah(selectedStaffDetail.bpjsKesehatanNominal)}</span>
                </div>
              </div>

              {/* Form Ajukan Mutasi */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
                <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-indigo-700" />
                  Ajukan Mutasi / Perubahan Data
                </h4>
                <p className="text-slate-600 text-xs">
                  Mencatat jejak riwayat resmi di <code>LOG_MUTASI_STAFF</code> sekaligus memperbarui profil aktif di{' '}
                  <code>MASTER_STAFF</code>.
                </p>

                <form onSubmit={handleSaveMutasi} className="space-y-3 pt-1">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jenis Mutasi *</label>
                      <select
                        value={mutJenis}
                        onChange={(e) => setMutJenis(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 font-semibold text-slate-800"
                      >
                        {JENIS_MUTASI_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal Efektif *</label>
                      <input
                        type="date"
                        required
                        value={mutTanggal}
                        onChange={(e) => setMutTanggal(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nilai Baru *</label>
                    <input
                      type="text"
                      required
                      value={mutNilaiBaru}
                      onChange={(e) => setMutNilaiBaru(e.target.value)}
                      placeholder="Contoh: Koordinator Produksi / 4500000 / Operasional"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Keterangan / Alasan Mutasi</label>
                    <input
                      type="text"
                      value={mutKeterangan}
                      onChange={(e) => setMutKeterangan(e.target.value)}
                      placeholder="Contoh: Promosi jabatan / kenaikan berkala / restrukturisasi lini"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-4 py-2 shadow-xs transition-colors"
                  >
                    Simpan & Terapkan Mutasi
                  </button>
                </form>
              </div>

              {/* Tabel Riwayat Mutasi */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <History className="h-4 w-4 text-slate-600" />
                  Riwayat Mutasi Staff Ini
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5">Tanggal</th>
                        <th className="p-2.5">Jenis Mutasi</th>
                        <th className="p-2.5">Nilai Lama</th>
                        <th className="p-2.5">Nilai Baru</th>
                        <th className="p-2.5">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {mutasiHistory.length > 0 ? (
                        mutasiHistory.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-medium whitespace-nowrap">{fmtTanggalIndo(m.tanggalEfektif)}</td>
                            <td className="p-2.5 font-bold text-indigo-900 whitespace-nowrap">{m.jenisMutasi}</td>
                            <td className="p-2.5 text-slate-500 whitespace-nowrap">{m.nilaiLama}</td>
                            <td className="p-2.5 font-bold text-emerald-700 whitespace-nowrap">{m.nilaiBaru}</td>
                            <td className="p-2.5 text-slate-600">{m.keterangan || '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400">
                            Belum ada riwayat mutasi untuk staff ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex justify-end">
              <button
                onClick={() => setSelectedStaffDetail(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 font-bold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH STAFF BARU */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tambah Staff Baru ke Database</h3>
                <p className="text-xs text-slate-500">Mendaftarkan data induk staff Divisi Produksi I</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddStaff} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    placeholder="Nama lengkap staff"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan *</label>
                  <input
                    type="text"
                    required
                    value={newJabatan}
                    onChange={(e) => setNewJabatan(e.target.value)}
                    placeholder="Contoh: Mandor / Operator Batching"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sekup Divisi *</label>
                  <select
                    value={newSekup}
                    onChange={(e) => setNewSekup(e.target.value as SekupKaryawan)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
                  >
                    <option value="Operasional">Operasional</option>
                    <option value="Administrasi">Administrasi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as StatusKepegawaian)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
                  >
                    {STATUS_KEPEGAWAIAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={newJk}
                    onChange={(e) => setNewJk(e.target.value as JenisKelamin)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-800"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gaji Pokok (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={newGajiPokok}
                    onChange={(e) => setNewGajiPokok(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tunjangan Jabatan (Rp)</label>
                  <input
                    type="number"
                    value={newTunjangan}
                    onChange={(e) => setNewTunjangan(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status PTKP (Pajak TER)</label>
                  <select
                    value={newStatusPTKP}
                    onChange={(e) => setNewStatusPTKP(e.target.value as StatusPTKP)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-800"
                  >
                    {STATUS_PTKP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal BPJS Kesehatan/bln</label>
                  <input
                    type="number"
                    value={newBpjsKs}
                    onChange={(e) => setNewBpjsKs(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Awal PKWT</label>
                  <input
                    type="date"
                    value={newAwalPKWT}
                    onChange={(e) => setNewAwalPKWT(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Akhir PKWT</label>
                  <input
                    type="date"
                    value={newAkhirPKWT}
                    onChange={(e) => setNewAkhirPKWT(e.target.value)}
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
                  Simpan Staff Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
