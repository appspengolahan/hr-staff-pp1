/**
 * HelpModal[HRStaff].tsx
 * Modal Bantuan, Regulasi, & Ketentuan Resmi Operasional HR Staff System
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Clock, HelpCircle, ShieldAlert, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Bantuan & Ketentuan Sistem</h2>
              <p className="text-xs text-slate-500">Panduan Operasional HR Staff — Divisi Produksi I</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
          {/* 1. Nama Project & Versi */}
          <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              Nama Project & Versi
            </h3>
            <p className="font-semibold text-slate-800">HR Staff System — Divisi Produksi I</p>
            <p className="text-xs text-slate-600 mt-0.5">PT Batu Karang • Versi 1.2 (Pembaruan September 2026)</p>
          </section>

          {/* 2. Cara Penggunaan */}
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              📖 Cara Penggunaan & Alur Kerja
            </h3>
            <ul className="space-y-2 text-xs leading-relaxed text-slate-600">
              <li>
                <strong className="text-slate-800 font-semibold">• Presensi & Ijin:</strong> Staff otomatis dianggap
                Hadir Penuh sesuai jadwal kerja. Anda cukup mencatat <em>pengecualian</em> (sakit, ijin keluar,
                terlambat, alpha). Dilengkapi fitur cetak <strong>Surat Permohonan Ijin resmi</strong> (format baku
                20.5cm x 16cm).
              </li>
              <li>
                <strong className="text-slate-800 font-semibold">• Lembur Staff:</strong> Dihitung flat 2× tarif
                harian per kejadian, berlaku di luar jam kerja resmi (Minggu, Hari Libur Nasional, lembur malam).
              </li>
              <li>
                <strong className="text-slate-800 font-semibold">• Rekap Tahunan:</strong> Pantau rekap menit ijin &
                persentase kehadiran (%) seluruh staff dari Jan–Des secara visual.
              </li>
              <li>
                <strong className="text-slate-800 font-semibold">• Slip Gaji (Payroll):</strong> Komputasi otomatis
                sesuai aturan resmi (PPh21 TER PMK 168/2023, BPJS JHT 2%, BPJS JP 1% plafon Rp11.086.300, BPJS Kesehatan
                nominal tetap).
              </li>
              <li>
                <strong className="text-slate-800 font-semibold">• Database Karyawan:</strong> Manajemen data induk,
                alert masa PKWT yang akan berakhir (≤26 hari), dan riwayat mutasi jabatan/gaji.
              </li>
              <li>
                <strong className="text-slate-800 font-semibold">• Pelatihan Calon Karyawan:</strong> Evaluasi masa
                pelatihan calon karyawan dengan aksi langsung "Lolos" (otomatis masuk MASTER_STAFF PKWT 1), "Diperpanjang",
                atau "Tidak Lolos".
              </li>
            </ul>
          </section>

          {/* 3. Ketentuan Jam Kerja */}
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-600" />
              Ketentuan Jam Kerja Resmi
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Hari</th>
                    <th className="p-2.5">Jam Mulai</th>
                    <th className="p-2.5">Jam Selesai</th>
                    <th className="p-2.5">Istirahat</th>
                    <th className="p-2.5">Durasi Kerja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-medium">Senin – Kamis</td>
                    <td className="p-2.5">08:00</td>
                    <td className="p-2.5">16:00</td>
                    <td className="p-2.5">11:30 – 12:30</td>
                    <td className="p-2.5 font-semibold text-slate-900">420 menit (7 jam)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Jumat</td>
                    <td className="p-2.5">08:00</td>
                    <td className="p-2.5">16:30</td>
                    <td className="p-2.5">11:00 – 12:30</td>
                    <td className="p-2.5 font-semibold text-slate-900">420 menit (7 jam)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Sabtu</td>
                    <td className="p-2.5">08:00</td>
                    <td className="p-2.5">13:00</td>
                    <td className="p-2.5 text-slate-400">—</td>
                    <td className="p-2.5 font-semibold text-slate-900">300 menit (5 jam)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Ketentuan Hari Kerja & Lembur */}
          <section className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-xs mb-1">📅 Hari Kerja Standar Pabrik</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>26 hari kerja per bulan (angka tetap)</strong>: 22 hari Senin–Jumat + 4 hari Sabtu. Total 10.440
                menit kerja standar per bulan.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-xs mb-1">⏱️ Perhitungan Lembur Staff</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dibayar <strong>flat 2× tarif harian</strong> ((Gaji Pokok + Tunjangan) ÷ 26) per kejadian di luar jam
                kerja resmi, tidak dihitung per jam bertingkat.
              </p>
            </div>
          </section>

          {/* 5. Faktor Potongan Ijin */}
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              💸 Ketentuan Ijin yang Memotong Upah
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Jenis Ijin</th>
                    <th className="p-2.5">Durasi Waktu</th>
                    <th className="p-2.5">Faktor Potongan</th>
                    <th className="p-2.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-medium">Hadir / Sakit (S Dokter) / Ijin Normatif</td>
                    <td className="p-2.5 text-slate-500">—</td>
                    <td className="p-2.5 font-bold text-emerald-700">0</td>
                    <td className="p-2.5 text-emerald-700">100% Dibayar Penuh</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Ijin Terlambat / Keluar / Pulang Cepat</td>
                    <td className="p-2.5">≤ 120 menit (≤ 2 jam)</td>
                    <td className="p-2.5 font-bold text-emerald-700">0</td>
                    <td className="p-2.5 text-emerald-700">100% Dibayar Penuh</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Ijin Terlambat / Keluar / Pulang Cepat</td>
                    <td className="p-2.5">121 – 240 menit (2 - 4 jam)</td>
                    <td className="p-2.5 font-bold text-amber-700">0,5</td>
                    <td className="p-2.5 text-amber-700">Potong Setengah Hari</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Ijin Terlambat / Keluar / Pulang Cepat</td>
                    <td className="p-2.5">&gt; 240 menit (&gt; 4 jam)</td>
                    <td className="p-2.5 font-bold text-rose-700">1,0</td>
                    <td className="p-2.5 text-rose-700">Hangus (1 Hari Penuh)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Sakit (S Tangan) / Ijin (S Tangan) / Alpha</td>
                    <td className="p-2.5 text-slate-500">—</td>
                    <td className="p-2.5 font-bold text-rose-700">1,0</td>
                    <td className="p-2.5 text-rose-700">Hangus (1 Hari Penuh)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500">
              * Nominal potongan per hari dihitung: <code>Faktor Potongan × ((Gaji Pokok + Tunjangan) ÷ 26)</code>
            </p>
          </section>

          {/* 6. Yang Boleh & Tidak Boleh Dilakukan */}
          <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <h4 className="font-bold text-amber-900 flex items-center gap-2 text-xs">
              <ShieldAlert className="h-4 w-4 text-amber-700" />
              Ketentuan Keamanan & Integritas Data
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <p className="font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Boleh Dilakukan (Aman):
                </p>
                <ul className="space-y-1 text-slate-700 list-disc pl-4">
                  <li>Input, edit, dan hapus presensi via Web App.</li>
                  <li>Cetak surat ijin resmi dan export PDF kapan saja.</li>
                  <li>Perubahan mutasi data staf langsung melalui menu Database.</li>
                  <li>Update status calon karyawan masa seleksi.</li>
                </ul>
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-rose-800 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                  Jangan Dilakukan:
                </p>
                <ul className="space-y-1 text-slate-700 list-disc pl-4">
                  <li>Mengubah rumus spreadsheet secara manual.</li>
                  <li>Menghapus baris spreadsheet (klik kanan Delete row).</li>
                  <li>Mengubah nama kolom atau mengubah urutan sheet.</li>
                  <li>Mengubah formula faktor potongan atau tarif TER tanpa koordinasi.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Footer (Ketentuan Tambahan #5) */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-center space-y-1">
          <p className="text-xs font-bold text-slate-800">
            HR Staff System All Rights Reserved . Divisi Produksi I . Developed by Lalu Mahendra
          </p>
          <p className="text-[11px] text-slate-500">
            Jika menemukan bug atau kendala teknis, silahkan hubungi Developer [Lalu Mahendra]
          </p>
        </div>
      </div>
    </div>
  );
};
