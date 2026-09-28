/**
 * terPph21[HRStaff].ts
 * Tabel Tarif Efektif Rata-rata (TER) PPh21 sesuai Lampiran PMK 168/2023 & PP 58/2023
 * dan Helper Perhitungan Payroll PT Batu Karang — Divisi Produksi I
 * Developed by Lalu Mahendra
 */

import { KategoriTER, StatusPTKP } from './types[HRStaff]';

// PMK 168/2023 TER Table A: [Batas Bawah, Tarif (desimal)]
export const TER_A: [number, number][] = [
  [0, 0],
  [5400001, 0.0025],
  [5650001, 0.005],
  [5950001, 0.0075],
  [6300001, 0.01],
  [6750001, 0.0125],
  [7500001, 0.015],
  [8550001, 0.0175],
  [9650001, 0.02],
  [10050001, 0.0225],
  [10350001, 0.025],
  [10700001, 0.03],
  [11050001, 0.035],
  [11600001, 0.04],
  [12500001, 0.05],
  [13750001, 0.06],
  [15100001, 0.07],
  [16950001, 0.08],
  [19750001, 0.09],
  [24150001, 0.10],
  [26450001, 0.11],
  [28000001, 0.12],
  [30050001, 0.13],
  [32400001, 0.14],
  [35400001, 0.15],
  [39100001, 0.16],
  [43850001, 0.17],
  [47800001, 0.18],
  [51400001, 0.19],
  [56300001, 0.20],
  [62200001, 0.21],
  [68600001, 0.22],
  [77500001, 0.23],
  [89000001, 0.24],
  [103000001, 0.25],
  [125000001, 0.26],
  [157000001, 0.27],
  [206000001, 0.28],
  [337000001, 0.29],
  [454000001, 0.30],
  [550000001, 0.31],
  [695000001, 0.32],
  [910000001, 0.33],
  [1400000001, 0.34],
];

// PMK 168/2023 TER Table B
export const TER_B: [number, number][] = [
  [0, 0],
  [6200001, 0.0025],
  [6500001, 0.005],
  [6850001, 0.0075],
  [7300001, 0.01],
  [9200001, 0.015],
  [10750001, 0.02],
  [11250001, 0.025],
  [11600001, 0.03],
  [12600001, 0.04],
  [13600001, 0.05],
  [14950001, 0.06],
  [16400001, 0.07],
  [18450001, 0.08],
  [21850001, 0.09],
  [26000001, 0.10],
  [27700001, 0.11],
  [29350001, 0.12],
  [31450001, 0.13],
  [33950001, 0.14],
  [37100001, 0.15],
  [41100001, 0.16],
  [45800001, 0.17],
  [49500001, 0.18],
  [53800001, 0.19],
  [58500001, 0.20],
  [64000001, 0.21],
  [71000001, 0.22],
  [80000001, 0.23],
  [93000001, 0.24],
  [109000001, 0.25],
  [129000001, 0.26],
  [163000001, 0.27],
  [211000001, 0.28],
  [374000001, 0.29],
  [459000001, 0.30],
  [555000001, 0.31],
  [704000001, 0.32],
  [957000001, 0.33],
  [1405000001, 0.34],
];

// PMK 168/2023 TER Table C
export const TER_C: [number, number][] = [
  [0, 0],
  [6600001, 0.0025],
  [6950001, 0.005],
  [7350001, 0.0075],
  [7800001, 0.01],
  [8850001, 0.0125],
  [9800001, 0.015],
  [10950001, 0.0175],
  [11200001, 0.02],
  [12050001, 0.03],
  [12950001, 0.04],
  [14150001, 0.05],
  [15550001, 0.06],
  [17050001, 0.07],
  [19500001, 0.08],
  [22700001, 0.09],
  [26600001, 0.10],
  [28100001, 0.11],
  [30100001, 0.12],
  [32600001, 0.13],
  [35400001, 0.14],
  [38900001, 0.15],
  [43000001, 0.16],
  [47400001, 0.17],
  [51200001, 0.18],
  [55800001, 0.19],
  [60400001, 0.20],
  [66700001, 0.21],
  [74500001, 0.22],
  [83200001, 0.23],
  [95600001, 0.24],
  [110000001, 0.25],
  [134000001, 0.26],
  [169000001, 0.27],
  [221000001, 0.28],
  [390000001, 0.29],
  [463000001, 0.30],
  [561000001, 0.31],
  [709000001, 0.32],
  [965000001, 0.33],
  [1419000001, 0.34],
];

/**
 * Mapping Status PTKP ke Kategori TER (A/B/C)
 */
export function getKategoriTER(statusPTKP: StatusPTKP | string): KategoriTER {
  if (!statusPTKP) return 'A';
  const str = statusPTKP.toUpperCase();
  if (str.startsWith('TK/0') || str.startsWith('TK/1') || str.startsWith('K/0')) {
    return 'A';
  }
  if (
    str.startsWith('TK/2') ||
    str.startsWith('TK/3') ||
    str.startsWith('K/1') ||
    str.startsWith('K/2')
  ) {
    return 'B';
  }
  if (str.startsWith('K/3')) {
    return 'C';
  }
  return 'A';
}

/**
 * Cari Tarif TER berdasar Penghasilan Bruto (K) dan Kategori TER (A/B/C)
 * Menggunakan pendekatan approximate match (VLOOKUP TRUE)
 */
export function getTarifTER(bruto: number, kategori: KategoriTER): number {
  if (bruto <= 0) return 0;
  const table = kategori === 'A' ? TER_A : kategori === 'B' ? TER_B : TER_C;

  let chosenTarif = 0;
  for (let i = 0; i < table.length; i++) {
    const [batasBawah, tarif] = table[i];
    if (bruto >= batasBawah) {
      chosenTarif = tarif;
    } else {
      break;
    }
  }
  return chosenTarif;
}

/**
 * Hitung Faktor Potongan Upah (0 / 0.5 / 1)
 */
export function computeFaktorPotongan(jenisIjin: string, durasiMenit: number = 0): number {
  if (!jenisIjin) return 0;
  if (
    jenisIjin === 'Hadir' ||
    jenisIjin === 'Sakit (S Dokter)' ||
    jenisIjin === 'Ijin Normatif'
  ) {
    return 0;
  }
  if (
    jenisIjin === 'Sakit (S Tangan)' ||
    jenisIjin === 'Ijin (S Tangan)' ||
    jenisIjin === 'Alpha'
  ) {
    return 1;
  }
  if (
    jenisIjin === 'Ijin Terlambat' ||
    jenisIjin === 'Ijin Keluar Sementara' ||
    jenisIjin === 'Ijin Pulang Awal'
  ) {
    if (durasiMenit <= 120) return 0;
    if (durasiMenit < 240) return 0.5;
    return 1;
  }
  return 0;
}

/**
 * Formatting Rupiah Standar
 */
export function fmtRupiah(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return 'Rp 0';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : val;
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

/**
 * Ketentuan Tambahan #7:
 * Seluruh angka persentase (%) gunakan dua angka dibelakang koma (2 decimal).
 */
export function fmtPersen(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00%';
  return val.toFixed(2) + '%';
}

/**
 * Ketentuan Tambahan #7:
 * Seluruh angka non-persentase (Kg, nominal, dll) gunakan satu angka dibelakang koma (1 decimal).
 */
export function fmtSatuDesimal(val: number | undefined | null, unit: string = ''): string {
  if (val === undefined || val === null || isNaN(val)) return '0.0' + (unit ? ' ' + unit : '');
  return val.toFixed(1) + (unit ? ' ' + unit : '');
}

/**
 * Format tanggal Indonesia DD/MM/YYYY
 */
export function fmtTanggalIndo(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export const BULAN_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const BULAN_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Standar Menit Kerja Per Bulan (Divisi Produksi I)
 * 26 hari kerja per bulan: 22 hari Senin-Jumat (420 menit) + 4 hari Sabtu (300 menit)
 * = 9.240 + 1.200 = 10.440 menit kerja standar per bulan.
 */
export const MENIT_STANDAR_PER_BULAN = 10440;
export const MENIT_STANDAR_PER_TAHUN = 10440 * 12; // 125.280 menit
