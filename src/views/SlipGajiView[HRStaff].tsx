/**
 * SlipGajiView[HRStaff].tsx
 * Modul Slip Gaji (Payroll) Berbasis TER PPh21 (PMK 168/2023) & Regulasi BPJS PT Batu Karang
 * Divisi Produksi I
 * Developed by Lalu Mahendra
 */

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  Info,
  Printer,
  Receipt,
  User,
} from 'lucide-react';
import { gasStore } from '../gasService[HRStaff]';
import { BULAN_NAMES, fmtRupiah } from '../terPph21[HRStaff]';
import { SlipGajiCalculation, UserRole } from '../types[HRStaff]';

interface SlipGajiViewProps {
  userRole: UserRole;
}

export const SlipGajiView: React.FC<SlipGajiViewProps> = ({ userRole }) => {
  const now = new Date();
  const staffList = gasStore.getStaffList();

  const [selectedNama, setSelectedNama] = useState<string>(staffList[0]?.nama || '');
  const [selectedBulan, setSelectedBulan] = useState<number>(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState<number>(now.getFullYear());

  // Calculate slip
  const slip: SlipGajiCalculation | null = useMemo(() => {
    if (!selectedNama) return null;
    try {
      return gasStore.calculateSlipGaji(selectedNama, selectedBulan, selectedTahun);
    } catch {
      return null;
    }
  }, [selectedNama, selectedBulan, selectedTahun]);

  const handleExportPDF = () => {
    if (!slip) return;
    const originalTitle = document.title;
    // Ketentuan Tambahan #6: nama file export selalu: nama project diikuti nama tab/field yang sedang diexport
    document.title = `HR Staff System - Slip Gaji - ${slip.nama} - ${BULAN_NAMES[selectedBulan - 1]} ${selectedTahun}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Selection */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Slip Gaji Staff (Payroll Divisi Produksi I)
            </h2>
            <p className="text-xs text-slate-500">
              Perhitungan baku otomatis dengan skema TER PMK 168/2023 & pemotongan ijin terintegrasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Staff</label>
            <select
              value={selectedNama}
              onChange={(e) => setSelectedNama(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:bg-white"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.nama}>
                  {s.nama} ({s.jabatan})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Bulan Penggajian</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:bg-white"
            >
              {BULAN_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun Penggajian</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:bg-white"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Slip Gaji Printable Card */}
      {slip ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md max-w-3xl mx-auto space-y-6">
          {/* Header Action inside slip card */}
          <div className="no-print flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Format Resmi Slip Gaji</span>
            <button
              onClick={handleExportPDF}
              className="btn-export inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 transition-colors"
              type="button"
            >
              <Printer className="h-4 w-4 text-blue-700" />
              <span>Export PDF / Cetak Slip</span>
            </button>
          </div>

          {/* Kop Slip Gaji */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-blue-800" />
              <span className="text-sm font-black tracking-widest text-slate-900 uppercase">
                PT BATU KARANG
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
              SLIP GAJI KARYAWAN
            </h1>
            <p className="text-xs font-bold text-slate-600 mt-1">
              DIVISI PRODUKSI I • PERIODE: {BULAN_NAMES[slip.bulan - 1].toUpperCase()} {slip.tahun}
            </p>
          </div>

          {/* Identitas Karyawan */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block font-medium">Nama Karyawan</span>
              <span className="font-bold text-slate-900 text-sm">{slip.nama}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Jabatan</span>
              <span className="font-bold text-slate-900 text-sm">{slip.jabatan}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Sekup / Unit</span>
              <span className="font-semibold text-slate-800">{slip.sekup}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Status PTKP (Kategori TER)</span>
              <span className="font-semibold text-slate-800">
                {slip.statusPTKP} (TER {slip.kategoriTer})
              </span>
            </div>
          </div>

          {/* Komponen Rincian Gaji */}
          <div className="space-y-4 text-xs">
            {/* 1. Pendapatan Pokok & Tunjangan */}
            <div>
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-[11px] flex justify-between">
                <span>I. Komponen Pendapatan & Lembur</span>
                <span>Nominal</span>
              </h3>
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Gaji Pokok</span>
                  <span className="font-semibold text-slate-900">{fmtRupiah(slip.gajiPokok)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Tunjangan Jabatan</span>
                  <span className="font-semibold text-slate-900">{fmtRupiah(slip.tunjangan)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Total Lembur (Flat 2x Tarif Harian)</span>
                  <span className="font-semibold text-slate-900">{fmtRupiah(slip.totalLembur)}</span>
                </div>
              </div>
            </div>

            {/* 2. Pengurang Upah / Potongan Ijin */}
            <div>
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-[11px] flex justify-between">
                <span>II. Potongan Ketidakhadiran / Ijin</span>
                <span>Potongan</span>
              </h3>
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">
                    Hari Tidak Dibayar: {slip.hariTidakDibayar} hari (Faktor Potongan)
                  </span>
                  <span className="font-bold text-rose-700">
                    {slip.potonganIjin > 0 ? `- ${fmtRupiah(slip.potonganIjin)}` : 'Rp 0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Gaji Bruto */}
            <div className="flex justify-between py-2.5 px-3 rounded-lg bg-slate-100 font-extrabold text-slate-900 text-sm border border-slate-200">
              <span>TOTAL PENGHASILAN BRUTO</span>
              <span>{fmtRupiah(slip.bruto)}</span>
            </div>

            {/* 3. Potongan Wajib: BPJS & Pajak PPh21 */}
            <div>
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-[11px] flex justify-between">
                <span>III. Potongan BPJS & Pajak PPh21</span>
                <span>Nominal</span>
              </h3>
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between py-2">
                  <div>
                    <span className="text-slate-700 font-medium">BPJS Jaminan Hari Tua / JHT (2%)</span>
                    <span className="text-[10px] text-slate-400 block">Dasar: Gaji Pokok + Tunjangan Penuh</span>
                  </div>
                  <span className="font-semibold text-slate-900">- {fmtRupiah(slip.bpjsJht)}</span>
                </div>

                <div className="flex justify-between py-2">
                  <div>
                    <span className="text-slate-700 font-medium">BPJS Jaminan Pensiun / JP (1%)</span>
                    <span className="text-[10px] text-slate-400 block">Dasar: Maksimal Cap Rp 11.086.300</span>
                  </div>
                  <span className="font-semibold text-slate-900">- {fmtRupiah(slip.bpjsJp)}</span>
                </div>

                <div className="flex justify-between py-2">
                  <div>
                    <span className="text-slate-700 font-medium">BPJS Kesehatan</span>
                    <span className="text-[10px] text-slate-400 block">Nominal Tetap Master Staff</span>
                  </div>
                  <span className="font-semibold text-slate-900">- {fmtRupiah(slip.bpjsKesehatan)}</span>
                </div>

                <div className="flex justify-between py-2">
                  <div>
                    <span className="text-slate-700 font-medium">
                      PPh21 TER Bulanan (Tarif {slip.tarifPph21Percent})
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      PMK 168/2023 Kategori {slip.kategoriTer} × Bruto
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">- {fmtRupiah(slip.pph21)}</span>
                </div>
              </div>
            </div>

            {/* GRAND TOTAL: GAJI DITERIMA (TAKE HOME PAY) */}
            <div className="flex justify-between items-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-black text-base shadow-sm">
              <span className="tracking-wide">TOTAL GAJI DITERIMA (NETTO)</span>
              <span className="text-lg">{fmtRupiah(slip.gajiDiterima)}</span>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-2 text-center text-xs pt-4 border-t border-slate-200">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-800 mt-0.5">HRD II & Umum II</p>
              <div className="h-16 flex items-end justify-center font-bold text-slate-800">
                (........................................)
              </div>
            </div>
            <div>
              <p className="text-slate-500">Penerima Upah,</p>
              <p className="font-bold text-slate-800 mt-0.5">Karyawan Yang Bersangkutan</p>
              <div className="h-16 flex items-end justify-center font-bold text-slate-800">
                (&nbsp;{slip.nama}&nbsp;)
              </div>
            </div>
          </div>

          {/* Catatan Kaki Regulasi */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-[11px] text-slate-500 leading-relaxed space-y-1">
            <p>
              <strong>Catatan Regulasi:</strong> Sesuai PP No. 58/2023 & PMK No. 168/2023, PPh21 dipotong menggunakan
              Tarif Efektif Rata-rata (TER) bulanan langsung terhadap Penghasilan Bruto. BPJS Ketenagakerjaan JHT & JP
              dihitung dari dasar ketentuan upah penuh.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500">Pilih staff untuk melihat slip gaji.</div>
      )}
    </div>
  );
};
