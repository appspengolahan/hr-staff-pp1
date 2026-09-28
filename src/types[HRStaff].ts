/**
 * types[HRStaff].ts
 * Data types and interfaces for HR Staff System — Divisi Produksi I (PT Batu Karang)
 * Developed by Lalu Mahendra
 */

export type UserRole = 'Project Manager' | 'Site Engineer' | 'Vendor' | 'Client' | 'Admin';

export type StatusKepegawaian =
  | 'TETAP'
  | 'PKWT 1'
  | 'PKWT 2'
  | 'PKWT 3'
  | 'PKWT 4'
  | 'PKWT 5'
  | 'PKWT 6'
  | 'PKWT 7'
  | 'MAGANG';

export type SekupKaryawan = 'Operasional' | 'Administrasi';

export type StatusAktifKaryawan = 'Aktif' | 'Non Aktif';

export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export type StatusPTKP =
  | 'TK/0'
  | 'TK/1 (Lajang + 1 Tanggungan)'
  | 'TK/2 (Lajang + 2 Tanggungan)'
  | 'TK/3 (Lajang + 3 Tanggungan)'
  | 'K/0 (Kawin, 0 Tanggungan)'
  | 'K/1 (Kawin + 1 Tanggungan)'
  | 'K/2 (Kawin + 2 Tanggungan)'
  | 'K/3 (Kawin + 3 Tanggungan)';

export type KategoriTER = 'A' | 'B' | 'C';

export interface StaffMember {
  id: number;
  nama: string;
  status: StatusKepegawaian;
  jabatan: string;
  level: string;
  sekup: SekupKaryawan;
  statusAktif: StatusAktifKaryawan;
  jk: JenisKelamin;
  nik: string;
  kk?: string;
  npwp?: string;
  email: string;
  bank?: string;
  rekening?: string;
  telp?: string;
  domisili: string;
  gajiPokok: number;
  tunjangan: number;
  statusPTKP: StatusPTKP;
  bpjsKesehatanNominal: number; // Nominal tetap per staff (AD)
  proyeksiJabatan?: string;
  sanksi?: string;
  awalPKWT?: string; // YYYY-MM-DD
  akhirPKWT?: string; // YYYY-MM-DD
  limitPKWT?: string;
  plafonLevel?: string;
  deskripsiJabatan?: string;
  faskes?: string;
}

export type JenisIjin =
  | 'Hadir'
  | 'Sakit (S Dokter)'
  | 'Sakit (S Tangan)'
  | 'Ijin Normatif'
  | 'Ijin (S Tangan)'
  | 'Ijin Terlambat'
  | 'Ijin Keluar Sementara'
  | 'Ijin Pulang Awal'
  | 'Alpha';

export interface PresensiItem {
  rowNum: number;
  tanggal: string; // YYYY-MM-DD
  hari: string; // Senin, Selasa, dll
  nama: string;
  sekup?: string;
  jamAwal?: string; // HH:mm
  jamAkhir?: string; // HH:mm
  durasi?: number; // menit
  jenisIjin: JenisIjin;
  keperluan: string;
  lampiran: 'Ya' | 'Tidak';
  catatan?: string;
  faktorPotongan: number; // 0, 0.5, or 1
  bulan: number;
  tahun: number;
}

export type KategoriLembur =
  | 'Minggu'
  | 'Tanggal Merah/Libur Nasional'
  | 'Di Luar Jam Kerja (Weekday/Sabtu)';

export interface LemburItem {
  rowNum: number;
  tanggal: string; // YYYY-MM-DD
  nama: string;
  sekup: string;
  kategori: KategoriLembur;
  jamMulai?: string;
  jamSelesai?: string;
  jmlJam?: number;
  nominal: number; // Flat 2x tarif harian: ((GP + Tunjangan)/26)
  bulan: number;
  tahun: number;
}

export type StatusPelatihanCalon =
  | 'Sedang Berjalan'
  | 'Lolos (Sudah Jadi Staff)'
  | 'Diperpanjang'
  | 'Tidak Lolos';

export interface CalonKaryawanItem {
  rowNum: number;
  nama: string;
  proyeksiJabatan: string;
  sekup: SekupKaryawan;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalAkhir: string; // YYYY-MM-DD
  durasi: number; // hari
  sisaHari: number;
  status: StatusPelatihanCalon;
  jumlahPerpanjangan: number;
  catatan?: string;
  diinputOleh: string;
}

export interface LinkArsipItem {
  row: number;
  nama: string;
  label: string;
  url: string;
  tanggalDitambahkan: string;
  diinputOleh: string;
}

export interface MutasiItem {
  row: number;
  tanggalEfektif: string;
  nama: string;
  jenisMutasi: string;
  nilaiLama: string;
  nilaiBaru: string;
  keterangan: string;
  diinputOleh: string;
  bulan: number;
  tahun: number;
}

export interface SlipGajiCalculation {
  nama: string;
  jabatan: string;
  sekup: string;
  bulan: number;
  tahun: number;
  gajiPokok: number;
  tunjangan: number;
  totalLembur: number;
  hariTidakDibayar: number;
  potonganIjin: number;
  bruto: number;
  bpjsJht: number; // 2%
  bpjsJp: number; // 1%, max cap Rp11.086.300
  totalBpjsTk: number;
  bpjsKesehatan: number;
  kategoriTer: KategoriTER;
  tarifPph21: number; // in decimal (e.g. 0.02)
  tarifPph21Percent: string; // e.g. "2.00%"
  pph21: number;
  gajiDiterima: number;
  statusPTKP: string;
}

export interface SuratIjinData {
  nama: string;
  jabatan: string;
  divisi: string;
  unit: string;
  checkbox: 'normatif' | 'tidakMasuk' | 'terlambat' | 'keluarSementara' | 'pulangCepat' | 'eksternal' | 'formKehadiran';
  hari: string;
  tanggal: string;
  keperluan: string;
  jamMasuk: string;
  jamKeluar: string;
  jamMasukKembali: string;
  jamBagian: number;
  menitBagian: number;
  tglCetak: string;
  thnCetak: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'presensi'
  | 'lembur'
  | 'rekap'
  | 'slip'
  | 'database'
  | 'pelatihan'
  | 'profil';
