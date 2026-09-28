/**
 * CalonKaryawanView[HRStaff].tsx
 * Modul Evaluasi & Pelatihan Seleksi Calon Karyawan Divisi Produksi I
 * Developed by Lalu Mahendra
 */

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle,
  FileCheck2,
  GraduationCap,
  History,
  Plus,
  Printer,
  Search,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { gasStore } from '../gasService[HRStaff]';
import { fmtTanggalIndo } from '../terPph21[HRStaff]';
import { CalonKaryawanItem, SekupKaryawan, UserRole } from '../types[HRStaff]';

interface CalonKaryawanViewProps {
  userRole: UserRole;
  onNavigateToStaff: () => void;
}

export const CalonKaryawanView: React.FC<CalonKaryawanViewProps> = ({ userRole, onNavigateToStaff }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<CalonKaryawanItem | null>(null);

  // Form Add States
  const [newNama, setNewNama] = useState('');
  const [newProyeksi, setNewProyeksi] = useState('');
  const [newSekup, setNewSekup] = useState<SekupKaryawan>('Operasional');
  const [newMulai, setNewMulai] = useState(new Date().toISOString().slice(0, 10));
  const [newAkhir, setNewAkhir] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [newCatatan, setNewCatatan] = useState('');

  // Form Update Status States
  const [chosenStatus, setChosenStatus] = useState<'Lolos' | 'Diperpanjang' | 'Tidak Lolos'>('Lolos');
  const [lolosJabatan, setLolosJabatan] = useState('');
  const [lolosGajiPokok, setLolosGajiPokok] = useState(3500000);
  const [lolosTunjangan, setLolosTunjangan] = useState(500000);
  const [perpanjangTglAkhir, setPerpanjangTglAkhir] = useState('');
  const [perpanjangAlasan, setPerpanjangAlasan] = useState('');
  const [tidakLolosAlasan, setTidakLolosAlasan] = useState('');

  const calonList = gasStore.getCalonList();

  const filteredList = useMemo(() => {
    return calonList.filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.nama.toLowerCase().includes(q) ||
        c.proyeksiJabatan.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      );
    });
  }, [calonList, searchQuery]);

  const alertList = useMemo(() => {
    return calonList.filter((c) => c.status === 'Sedang Berjalan' && c.sisaHari < 10);
  }, [calonList]);

  const handleOpenStatusModal = (item: CalonKaryawanItem) => {
    setStatusTarget(item);
    setChosenStatus('Lolos');
    setLolosJabatan(item.proyeksiJabatan || 'Staff Operasional');
    setLolosGajiPokok(3500000);
    setLolosTunjangan(500000);
    setPerpanjangTglAkhir(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    );
    setPerpanjangAlasan('');
    setTidakLolosAlasan('');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newMulai || !newAkhir) {
      alert('Nama, Tanggal Mulai, dan Tanggal Akhir wajib diisi.');
      return;
    }

    const res = gasStore.addCalon({
      nama: newNama,
      proyeksiJabatan: newProyeksi || 'Operator / Staff Pelaksana',
      sekup: newSekup,
      tanggalMulai: newMulai,
      tanggalAkhir: newAkhir,
      catatan: newCatatan,
      diinputOleh: 'Lalu Mahendra',
    });

    alert(res.message);
    setIsAddOpen(false);
    setNewNama('');
    setNewProyeksi('');
    setNewCatatan('');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTarget) return;

    if (chosenStatus === 'Lolos') {
      const res = gasStore.updateStatusCalon({
        rowNum: statusTarget.rowNum,
        status: 'Lolos',
        jabatan: lolosJabatan,
        gajiPokok: lolosGajiPokok,
        tunjangan: lolosTunjangan,
      });
      alert(res.message);
      setStatusTarget(null);
    } else if (chosenStatus === 'Diperpanjang') {
      if (!perpanjangTglAkhir) {
        alert('Tanggal akhir baru wajib diisi.');
        return;
      }
      const res = gasStore.updateStatusCalon({
        rowNum: statusTarget.rowNum,
        status: 'Diperpanjang',
        tanggalAkhirBaru: perpanjangTglAkhir,
        alasan: perpanjangAlasan,
      });
      alert(res.message);
      setStatusTarget(null);
    } else if (chosenStatus === 'Tidak Lolos') {
      if (!confirm(`Konfirmasi calon karyawan ${statusTarget.nama} Tidak Lolos seleksi?`)) return;
      const res = gasStore.updateStatusCalon({
        rowNum: statusTarget.rowNum,
        status: 'Tidak Lolos',
        alasan: tidakLolosAlasan,
      });
      alert(res.message);
      setStatusTarget(null);
    }
  };

  const handleExportPDF = () => {
    const originalTitle = document.title;
    // Ketentuan Tambahan #6: nama file export selalu: nama project diikuti nama tab/field yang sedang diexport
    document.title = 'HR Staff System - Daftar Calon Karyawan';
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Penjelasan Modul */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 leading-relaxed shadow-xs flex items-start gap-3">
        <GraduationCap className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Mekanisme Pelatihan Seleksi Calon Karyawan: </strong>
          Semua calon staf baru menjalani masa pelatihan dan evaluasi keahlian. Calon yang ditandai{' '}
          <strong>"Lolos"</strong> akan <span className="underline font-bold">otomatis dipindahkan</span> ke{' '}
          <strong>Database Karyawan (MASTER_STAFF)</strong> berstatus <strong>PKWT 1</strong>. Status{' '}
          <strong>"Diperpanjang"</strong> memperbarui masa tenggat akhir pelatihan, sedangkan{' '}
          <strong>"Tidak Lolos"</strong> menghapus calon dari daftar aktif.
        </div>
      </div>

      {/* Alert Banner Sisa Hari < 10 */}
      {alertList.length > 0 && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50/90 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                ⚠️ {alertList.length} Calon Karyawan Memasuki Tenggat Akhir Evaluasi (&lt; 10 Hari)
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Segera putuskan hasil uji kelayakan kerja (Lolos menjadi staff PKWT 1 / Perpanjang masa latih / Tidak
                lolos):
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {alertList.map((c) => (
                  <span
                    key={c.rowNum}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-rose-200 px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                  >
                    <span>{c.nama}</span>
                    <span className="text-slate-400">({c.proyeksiJabatan})</span>
                    <span className="rounded-full bg-rose-100 text-rose-800 px-1.5 py-0.2 text-[10px] font-bold">
                      Sisa {c.sisaHari} hari
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Daftar Calon Karyawan (Masa Pelatihan Seleksi)
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi kinerja dan masa uji coba kandidat sebelum pengangkatan resmi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors"
              type="button"
            >
              <Plus className="h-4 w-4" />
              <span>+ Calon Baru</span>
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

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama calon / posisi proyeksi..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 py-2 text-xs focus:bg-white focus:outline-none"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Nama Calon</th>
                <th className="p-3">Proyeksi Jabatan</th>
                <th className="p-3">Sekup</th>
                <th className="p-3">Mulai</th>
                <th className="p-3">Akhir</th>
                <th className="p-3">Durasi</th>
                <th className="p-3">Sisa Hari</th>
                <th className="p-3">Status Pelatihan</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.length > 0 ? (
                filteredList.map((c) => {
                  let statusBadge = 'bg-blue-100 text-blue-800';
                  if (c.status.includes('Lolos')) statusBadge = 'bg-emerald-100 text-emerald-800 font-bold';
                  else if (c.status === 'Diperpanjang') statusBadge = 'bg-amber-100 text-amber-800';
                  else if (c.status === 'Tidak Lolos') statusBadge = 'bg-rose-100 text-rose-800';

                  const isSelesai = c.status.includes('Lolos (Sudah Jadi Staff)');

                  return (
                    <tr key={c.rowNum} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{c.nama}</td>
                      <td className="p-3 font-medium text-slate-800 whitespace-nowrap">{c.proyeksiJabatan}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                          {c.sekup}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{fmtTanggalIndo(c.tanggalMulai)}</td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{fmtTanggalIndo(c.tanggalAkhir)}</td>
                      <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">{c.durasi} hari</td>
                      <td className="p-3 whitespace-nowrap">
                        {c.status === 'Sedang Berjalan' ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              c.sisaHari <= 3
                                ? 'bg-rose-100 text-rose-700 font-black'
                                : c.sisaHari < 10
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.sisaHari >= 0 ? `${c.sisaHari} hari lagi` : 'Selesai'}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${statusBadge}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {isSelesai ? (
                          <button
                            onClick={onNavigateToStaff}
                            className="rounded-lg bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 text-[11px] hover:bg-emerald-100"
                          >
                            Buka di Database Staff →
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenStatusModal(c)}
                            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 text-[11px] shadow-xs"
                          >
                            Update Status
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">
                    Belum ada calon karyawan dalam masa seleksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UPDATE STATUS CALON (LOLOS -> OTOMATIS JADI STAFF) */}
      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Keputusan Status Pelatihan Seleksi</h3>
                <p className="text-xs text-slate-500">Kandidat: {statusTarget.nama}</p>
              </div>
              <button onClick={() => setStatusTarget(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Status Keputusan *</label>
                <select
                  value={chosenStatus}
                  onChange={(e) => setChosenStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 bg-slate-50"
                >
                  <option value="Lolos">Lolos (Otomatis Masuk Master Staff PKWT 1)</option>
                  <option value="Diperpanjang">Diperpanjang (Tambah Masa Pelatihan)</option>
                  <option value="Tidak Lolos">Tidak Lolos (Gugur)</option>
                </select>
              </div>

              {/* Form Jika LOLOS */}
              {chosenStatus === 'Lolos' && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
                  <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Data Pengangkatan Staff Baru (PKWT 1)
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Data berikut akan langsung diintegrasikan ke <code>MASTER_STAFF</code> secara otomatis.
                  </p>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jabatan Resmi Staff</label>
                    <input
                      type="text"
                      required
                      value={lolosJabatan}
                      onChange={(e) => setLolosJabatan(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gaji Pokok Awal (Rp)</label>
                      <input
                        type="number"
                        required
                        value={lolosGajiPokok}
                        onChange={(e) => setLolosGajiPokok(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tunjangan Jabatan (Rp)</label>
                      <input
                        type="number"
                        value={lolosTunjangan}
                        onChange={(e) => setLolosTunjangan(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Jika DIPERPANJANG */}
              {chosenStatus === 'Diperpanjang' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                  <h4 className="font-bold text-amber-950 text-xs">Perpanjangan Masa Pelatihan</h4>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Akhir Baru *</label>
                    <input
                      type="date"
                      required
                      value={perpanjangTglAkhir}
                      onChange={(e) => setPerpanjangTglAkhir(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alasan Perpanjangan</label>
                    <input
                      type="text"
                      value={perpanjangAlasan}
                      onChange={(e) => setPerpanjangAlasan(e.target.value)}
                      placeholder="Contoh: Perlu pemantapan uji kalibrasi mesin batching"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Form Jika TIDAK LOLOS */}
              {chosenStatus === 'Tidak Lolos' && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-3">
                  <h4 className="font-bold text-rose-950 text-xs">Pemberitahuan Tidak Lolos</h4>
                  <p className="text-[11px] text-rose-800">
                    Baris calon karyawan ini akan dibersihkan dari daftar aktif (jejak log tetap dipertahankan).
                  </p>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alasan Tidak Memenuhi Syarat</label>
                    <input
                      type="text"
                      required
                      value={tidakLolosAlasan}
                      onChange={(e) => setTidakLolosAlasan(e.target.value)}
                      placeholder="Contoh: Disiplin waktu dan uji tes fisik tidak memenuhi standar pabrik"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatusTarget(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  Terapkan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH CALON BARU */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tambah Calon Karyawan Baru</h3>
                <p className="text-xs text-slate-500">Mendaftarkan masa pelatihan seleksi kandidat baru</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="overflow-y-auto p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Calon Karyawan *</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Nama lengkap kandidat"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proyeksi Jabatan</label>
                  <input
                    type="text"
                    value={newProyeksi}
                    onChange={(e) => setNewProyeksi(e.target.value)}
                    placeholder="Contoh: Mekanik Crusher / Staff QC"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sekup Divisi</label>
                  <select
                    value={newSekup}
                    onChange={(e) => setNewSekup(e.target.value as SekupKaryawan)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800"
                  >
                    <option value="Operasional">Operasional</option>
                    <option value="Administrasi">Administrasi</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai Pelatihan *</label>
                  <input
                    type="date"
                    required
                    value={newMulai}
                    onChange={(e) => setNewMulai(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Akhir Pelatihan *</label>
                  <input
                    type="date"
                    required
                    value={newAkhir}
                    onChange={(e) => setNewAkhir(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Kualifikasi / Pengalaman</label>
                <input
                  type="text"
                  value={newCatatan}
                  onChange={(e) => setNewCatatan(e.target.value)}
                  placeholder="Contoh: Pengalaman pabrik beton 2 tahun / sertifikat K3"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
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
                  Simpan Calon Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
