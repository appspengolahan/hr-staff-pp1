/**
 * gasService[HRStaff].ts
 * Headless Google Apps Script (GAS) Service & Offline-First Data Cache Engine
 * PT Batu Karang — Divisi Produksi I
 * Developed by Lalu Mahendra
 */

import {
  INITIAL_CALON,
  INITIAL_LEMBUR,
  INITIAL_LINKS,
  INITIAL_MUTASI,
  INITIAL_PRESENSI,
  INITIAL_STAFF,
} from './mockData[HRStaff]';
import {
  computeFaktorPotongan,
  getKategoriTER,
  getTarifTER,
} from './terPph21[HRStaff]';
import {
  CalonKaryawanItem,
  LemburItem,
  LinkArsipItem,
  MutasiItem,
  PresensiItem,
  SlipGajiCalculation,
  StaffMember,
} from './types[HRStaff]';

const CACHE_KEYS = {
  STAFF: 'hrstaff_cache_staff',
  PRESENSI: 'hrstaff_cache_presensi',
  LEMBUR: 'hrstaff_cache_lembur',
  CALON: 'hrstaff_cache_calon',
  MUTASI: 'hrstaff_cache_mutasi',
  LINKS: 'hrstaff_cache_links',
  ENDPOINT_URL: 'hrstaff_gas_endpoint_url',
  LAST_SYNC: 'hrstaff_last_sync_timestamp',
  SIDEBAR_COLLAPSED: 'hrstaff_sidebar_collapsed',
  USER_ROLE: 'hrstaff_current_user_role',
};

export const DEFAULT_GAS_ENDPOINT =
  'https://script.google.com/macros/s/AKfycby5aUndwYBlAjfM-d28J4-9I3Kuweh23Ef0TA4-hpYjlDIYVluTMuX8YkRodIqLs9ue/exec';

class GASDataStore {
  private staff: StaffMember[] = [];
  private presensi: PresensiItem[] = [];
  private lembur: LemburItem[] = [];
  private calon: CalonKaryawanItem[] = [];
  private mutasi: MutasiItem[] = [];
  private links: LinkArsipItem[] = [];
  private performa: any[] = [];
  private endpointUrl: string = DEFAULT_GAS_ENDPOINT;
  private lastSyncTime: string = '';
  private isSyncing: boolean = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.initFromLocalStorage();
  }

  private initFromLocalStorage() {
    try {
      const storedUrl = localStorage.getItem(CACHE_KEYS.ENDPOINT_URL);
      if (storedUrl) this.endpointUrl = storedUrl;

      const storedSync = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
      this.lastSyncTime = storedSync || new Date().toISOString();

      const cachedStaff = localStorage.getItem(CACHE_KEYS.STAFF);
      this.staff = cachedStaff ? JSON.parse(cachedStaff) : [...INITIAL_STAFF];

      const cachedPresensi = localStorage.getItem(CACHE_KEYS.PRESENSI);
      this.presensi = cachedPresensi ? JSON.parse(cachedPresensi) : [...INITIAL_PRESENSI];

      const cachedLembur = localStorage.getItem(CACHE_KEYS.LEMBUR);
      this.lembur = cachedLembur ? JSON.parse(cachedLembur) : [...INITIAL_LEMBUR];

      const cachedCalon = localStorage.getItem(CACHE_KEYS.CALON);
      this.calon = cachedCalon ? JSON.parse(cachedCalon) : [...INITIAL_CALON];

      const cachedMutasi = localStorage.getItem(CACHE_KEYS.MUTASI);
      this.mutasi = cachedMutasi ? JSON.parse(cachedMutasi) : [...INITIAL_MUTASI];

      const cachedLinks = localStorage.getItem(CACHE_KEYS.LINKS);
      this.links = cachedLinks ? JSON.parse(cachedLinks) : [...INITIAL_LINKS];

      const cachedPerforma = localStorage.getItem('hrstaff_cache_performa');
      this.performa = cachedPerforma ? JSON.parse(cachedPerforma) : [];

      // Auto update calculation of sisa hari for PKWT & Calon
      this.recalculateDynamicDates();
      this.persistToLocalStorage();
    } catch (err) {
      console.warn('Gagal memuat cache lokal, fallback ke data bawaan pabrik:', err);
      this.resetToDefaults();
    }
  }

  private recalculateDynamicDates() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update Calon Karyawan sisa hari
    this.calon = this.calon.map((c) => {
      if (c.tanggalAkhir) {
        const ta = new Date(c.tanggalAkhir);
        ta.setHours(0, 0, 0, 0);
        const sisa = Math.round((ta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...c,
          sisaHari: c.status === 'Sedang Berjalan' ? sisa : 0,
        };
      }
      return c;
    });
  }

  private persistToLocalStorage() {
    try {
      localStorage.setItem(CACHE_KEYS.STAFF, JSON.stringify(this.staff));
      localStorage.setItem(CACHE_KEYS.PRESENSI, JSON.stringify(this.presensi));
      localStorage.setItem(CACHE_KEYS.LEMBUR, JSON.stringify(this.lembur));
      localStorage.setItem(CACHE_KEYS.CALON, JSON.stringify(this.calon));
      localStorage.setItem(CACHE_KEYS.MUTASI, JSON.stringify(this.mutasi));
      localStorage.setItem(CACHE_KEYS.LINKS, JSON.stringify(this.links));
      localStorage.setItem(CACHE_KEYS.ENDPOINT_URL, this.endpointUrl);
      localStorage.setItem(CACHE_KEYS.LAST_SYNC, this.lastSyncTime);
    } catch (e) {
      console.error('Penyimpanan localStorage gagal:', e);
    }
    this.notify();
  }

  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getEndpointUrl(): string {
    return this.endpointUrl;
  }

  public setEndpointUrl(url: string) {
    this.endpointUrl = url.trim();
    localStorage.setItem(CACHE_KEYS.ENDPOINT_URL, this.endpointUrl);
    this.notify();
  }

  public getLastSyncTime(): string {
    return this.lastSyncTime;
  }

  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Reset seluruh database lokal kembali ke bawaan
   */
  public resetToDefaults() {
    this.staff = [...INITIAL_STAFF];
    this.presensi = [...INITIAL_PRESENSI];
    this.lembur = [...INITIAL_LEMBUR];
    this.calon = [...INITIAL_CALON];
    this.mutasi = [...INITIAL_MUTASI];
    this.links = [...INITIAL_LINKS];
    this.lastSyncTime = new Date().toISOString();
    this.persistToLocalStorage();
  }

  /**
   * Export all cached data as JSON string
   */
  public exportCacheJSON(): string {
    return JSON.stringify(
      {
        version: '1.2',
        exportedAt: new Date().toISOString(),
        staff: this.staff,
        presensi: this.presensi,
        lembur: this.lembur,
        calon: this.calon,
        mutasi: this.mutasi,
        links: this.links,
      },
      null,
      2
    );
  }

  /**
   * Import data from JSON backup
   */
  public importCacheJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.staff)) this.staff = data.staff;
      if (Array.isArray(data.presensi)) this.presensi = data.presensi;
      if (Array.isArray(data.lembur)) this.lembur = data.lembur;
      if (Array.isArray(data.calon)) this.calon = data.calon;
      if (Array.isArray(data.mutasi)) this.mutasi = data.mutasi;
      if (Array.isArray(data.links)) this.links = data.links;
      this.lastSyncTime = new Date().toISOString();
      this.persistToLocalStorage();
      return true;
    } catch (e) {
      console.error('Import cache gagal:', e);
      return false;
    }
  }

  /**
   * Ping / Test Koneksi ke GAS Endpoint
   */
  public async testGASConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = performance.now();
    try {
      // Send a ping request
      const pingUrl = `${this.endpointUrl}${this.endpointUrl.includes('?') ? '&' : '?'}action=ping`;
      const res = await fetch(pingUrl, {
        method: 'GET',
        mode: 'no-cors', // Standard Google Apps Script cross-origin
      });
      const latency = Math.round(performance.now() - start);
      return {
        success: true,
        latencyMs: latency,
        message: `Koneksi ke Headless GAS berhasil direspon (${latency} ms).`,
      };
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      return {
        success: false,
        latencyMs: latency,
        message: `Koneksi gagal atau offline: ${err.message || 'CORS / Jaringan timeout'}`,
      };
    }
  }

  /**
   * Tarik Data Nyata dari Google Apps Script / Spreadsheet
   */
  public async pullDataFromGAS(): Promise<{
    success: boolean;
    message: string;
    counts?: { staff: number; presensi: number; lembur: number; calon: number };
    debug?: any;
  }> {
    this.isSyncing = true;
    this.notify();

    try {
      const url = `${this.endpointUrl}${this.endpointUrl.includes('?') ? '&' : '?'}action=getAllData`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.message || 'Gagal mengambil data dari Google Apps Script');
      }

      let staffLoaded = 0;
      let presensiLoaded = 0;
      let lemburLoaded = 0;
      let calonLoaded = 0;

      const cleanStr = (val: any, fallback = '') => {
        if (val === undefined || val === null) return fallback;
        return String(val).trim();
      };

      const cleanNum = (val: any, fallback = 0) => {
        if (typeof val === 'number') return val;
        if (!val) return fallback;
        const n = Number(String(val).replace(/[^0-9.-]+/g, ''));
        return isNaN(n) ? fallback : n;
      };

      // 1. Process Staff List
      if (Array.isArray(data.staffList) && data.staffList.length > 0) {
        const mappedStaff: StaffMember[] = data.staffList
          .filter((item: any) => {
            const rawNama = cleanStr(item['Nama'] || item['NAMA'] || item.nama || item.namaStaff || item.namaKaryawan);
            if (!rawNama) return false;
            const lower = rawNama.toLowerCase();
            if (lower === 'id' || lower === 'no' || lower === 'nomor' || lower === 'nama' || lower === 'nama staff') return false;
            if (/^\d+$/.test(rawNama)) return false;
            return true;
          })
          .map((item: any, idx: number) => {
            const nama = cleanStr(item['Nama'] || item['NAMA'] || item.nama || item.namaStaff || item.namaKaryawan);
            const jabatan = cleanStr(item['Jabatan'] || item['JABATAN'] || item.jabatan || item.posisi) || 'Staff Operasional';
            const level = cleanStr(item['Level/Kategori'] || item['LEVEL'] || item.level || item.grade) || 'Staff Pelaksana';
            const rawSekup = cleanStr(item['Sekup'] || item['SEKUP'] || item.sekup || item.divisi || item['DIVISI']);
            const sekup = rawSekup.toLowerCase().includes('admin') ? 'Administrasi' : 'Operasional';
            const rawAktif = cleanStr(item['Status Aktif'] || item['STATUS AKTIF'] || item.statusAktif || item['KEAKTIFAN'] || item['Keaktifan']);
            const statusAktif = rawAktif.toLowerCase().includes('non') ? 'Non Aktif' : 'Aktif';
            const rawStatus = cleanStr(item['Status Kepegawaian'] || item['STATUS KEPEGAWAIAN'] || item['STATUS'] || item.status || 'TETAP');
            const status = rawStatus.toUpperCase().includes('PKWT 2') ? 'PKWT 2' :
                           rawStatus.toUpperCase().includes('PKWT 1') ? 'PKWT 1' :
                           rawStatus.toUpperCase().includes('KONTRAK') ? 'PKWT 1' : 'TETAP';

            return {
              id: item.id ? Number(item.id) || idx + 1 : idx + 1,
              nama,
              status: status as any,
              jabatan,
              level,
              sekup: sekup as any,
              statusAktif: statusAktif as any,
              jk: (cleanStr(item['Jenis Kelamin'] || item.jk || item.jenisKelamin || item['JK']).toLowerCase().startsWith('p') ? 'Perempuan' : 'Laki-laki') as any,
              nik: cleanStr(item['NIK'] || item.nik || item['No. KTP']) || `350712${1000000000 + idx}`,
              kk: cleanStr(item['KK'] || item.kk || item['No. KK']),
              npwp: cleanStr(item['NPWP'] || item.npwp),
              email: cleanStr(item['Email'] || item.email || item['EMAIL']) || `${nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@batukarang.id`,
              bank: cleanStr(item['Bank'] || item.bank || item['BANK']) || 'BCA',
              rekening: cleanStr(item['No Rekening'] || item.rekening || item['REKENING']),
              telp: cleanStr(item['No Telp'] || item.telp || item.noHp || item['TELP'] || item['WA']),
              domisili: cleanStr(item['Domisili'] || item.domisili || item['DOMISILI'] || item['KOTA']) || 'Malang',
              gajiPokok: cleanNum(item['Gaji Pokok'] || item.gajiPokok || item.gapok || item['GAJI POKOK'], 3500000),
              tunjangan: cleanNum(item['Tunjangan Jabatan'] || item.tunjangan || item['TUNJANGAN JABATAN'] || item['TUNJANGAN'], 500000),
              statusPTKP: (cleanStr(item['Status PTKP'] || item.statusPTKP || item.ptkp || item['PTKP']) || 'TK/0') as any,
              bpjsKesehatanNominal: cleanNum(item['BPJS Kesehatan'] || item.bpjsKesehatanNominal || item['BPJS KESEHATAN'] || item['BPJS'], 100000),
              proyeksiJabatan: cleanStr(item['Proyeksi Jabatan'] || item.proyeksiJabatan),
              sanksi: cleanStr(item['Sanksi'] || item.sanksi) || '-',
              awalPKWT: cleanStr(item['Awal PKWT'] || item.awalPKWT),
              akhirPKWT: cleanStr(item['Akhir PKWT'] || item.akhirPKWT),
              limitPKWT: cleanStr(item['Limit PKWT'] || item.limitPKWT),
              plafonLevel: cleanStr(item['Plafon Level/Kategori'] || item.plafonLevel),
              deskripsiJabatan: cleanStr(item['Deskripsi Jabatan'] || item.deskripsiJabatan),
              faskes: cleanStr(item['Faskes'] || item.faskes),
            };
          });

        if (mappedStaff.length > 0) {
          this.staff = mappedStaff;
          staffLoaded = mappedStaff.length;
        }
      }

      // 2. Process Presensi List
      if (Array.isArray(data.presensiList) && data.presensiList.length > 0) {
        const mappedPresensi: PresensiItem[] = data.presensiList
          .filter((p: any) => p.nama && p.tanggal)
          .map((p: any, idx: number) => {
            const d = new Date(p.tanggal);
            const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const hari = !isNaN(d.getDay()) ? namaHari[d.getDay()] : 'Senin';
            const durasi = Number(p.durasi) || 0;
            const jenisIjin = p.jenisIjin || 'Hadir';

            return {
              rowNum: Number(p.rowNum) || idx + 6,
              tanggal: String(p.tanggal).slice(0, 10),
              hari,
              nama: String(p.nama).trim(),
              sekup: (p.sekup || 'Operasional') as any,
              jamAwal: p.jamAwal || '07:30',
              jamAkhir: p.jamAkhir || '16:00',
              durasi,
              jenisIjin: jenisIjin as any,
              keperluan: p.keperluan || '-',
              faktorPotongan: Number(p.faktorPotongan) || computeFaktorPotongan(jenisIjin, durasi),
              lampiran: p.lampiran === 'Ya' ? 'Ya' : 'Tidak',
              catatan: p.catatan,
              approvalManager: p.approvalManager || 'Disetujui',
              buktiUrl: p.buktiUrl,
              bulan: !isNaN(d.getMonth()) ? d.getMonth() + 1 : 1,
              tahun: !isNaN(d.getFullYear()) ? d.getFullYear() : 2026,
            };
          });

        if (mappedPresensi.length > 0) {
          this.presensi = mappedPresensi;
          presensiLoaded = mappedPresensi.length;
        }
      }

      // 3. Process Lembur List
      if (Array.isArray(data.lemburList) && data.lemburList.length > 0) {
        const mappedLembur: LemburItem[] = data.lemburList
          .filter((l: any) => l.nama && l.tanggal)
          .map((l: any, idx: number) => {
            const d = new Date(l.tanggal);
            return {
              rowNum: Number(l.rowNum) || idx + 6,
              tanggal: String(l.tanggal).slice(0, 10),
              nama: String(l.nama).trim(),
              sekup: (l.sekup || 'Operasional') as any,
              kategori: (l.kategori || 'Hari Kerja Biasa (Weekday)') as any,
              jamMulai: l.jamMulai || '16:00',
              jamSelesai: l.jamSelesai || '18:00',
              nominal: Number(l.nominal) || 200000,
              catatan: l.catatan,
              bulan: !isNaN(d.getMonth()) ? d.getMonth() + 1 : 1,
              tahun: !isNaN(d.getFullYear()) ? d.getFullYear() : 2026,
            };
          });

        if (mappedLembur.length > 0) {
          this.lembur = mappedLembur;
          lemburLoaded = mappedLembur.length;
        }
      }

      // 4. Process Calon Karyawan
      if (Array.isArray(data.calonList) && data.calonList.length > 0) {
        const mappedCalon: CalonKaryawanItem[] = data.calonList
          .filter((c: any) => c.nama)
          .map((c: any, idx: number) => {
            const tm = new Date(c.tanggalMulai || '2026-01-01');
            const ta = new Date(c.tanggalAkhir || '2026-03-31');
            const durasi = Math.max(1, Math.round((ta.getTime() - tm.getTime()) / (1000 * 60 * 60 * 24)) + 1);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const sisa = Math.round((ta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            return {
              rowNum: Number(c.rowNum) || idx + 6,
              nama: String(c.nama).trim(),
              sekup: (c.sekup || 'Operasional') as any,
              proyeksiJabatan: c.proyeksiJabatan || 'Staff Operasional',
              mentor: c.mentor || 'Lalu Mahendra Ali Akbar',
              tanggalMulai: String(c.tanggalMulai || '2026-01-01').slice(0, 10),
              tanggalAkhir: String(c.tanggalAkhir || '2026-03-31').slice(0, 10),
              durasi,
              sisaHari: sisa,
              status: (c.status || 'Sedang Berjalan') as any,
              jumlahPerpanjangan: Number(c.jumlahPerpanjangan) || 0,
              catatan: c.catatan || '',
            };
          });

        if (mappedCalon.length > 0) {
          this.calon = mappedCalon;
          calonLoaded = mappedCalon.length;
        }
      }

      // 5. Process LOG_PERFORMA (Rekap Presensi & Performa Tahunan Matriks)
      if (Array.isArray(data.performaList) && data.performaList.length > 0) {
        this.performa = data.performaList.map((item: any) => {
          const bulanan = [];
          for (let m = 1; m <= 12; m++) {
            bulanan.push({
              bulan: m,
              menit: cleanNum(item[`m${m}`] || item[`bulan_${m}`] || item[`bln_${m}`] || item[m] || 0),
            });
          }
          const totalIjin = cleanNum(item.totalIjin || item.totalMenit || bulanan.reduce((s, b) => s + b.menit, 0));
          const totalTersedia = cleanNum(item.totalTersedia || item.menitKerja || 125280);
          const pctKehadiran = cleanNum(item.pctKehadiran || item.persen || item.persentase || (100 - (totalIjin / totalTersedia) * 100));

          return {
            nama: cleanStr(item.nama),
            bulanan,
            totalIjin,
            totalTersedia,
            pctKehadiran: Math.round(pctKehadiran * 100) / 100,
          };
        });
        localStorage.setItem('hrstaff_cache_performa', JSON.stringify(this.performa));
      }

      this.lastSyncTime = new Date().toISOString();
      this.recalculateDynamicDates();
      this.persistToLocalStorage();

      this.isSyncing = false;
      this.notify();

      return {
        success: true,
        message: `Berhasil menarik data asli dari Spreadsheet: ${staffLoaded} Staff, ${presensiLoaded} Presensi, ${lemburLoaded} Lembur, ${calonLoaded} Calon.`,
        counts: {
          staff: staffLoaded,
          presensi: presensiLoaded,
          lembur: lemburLoaded,
          calon: calonLoaded,
        },
        debug: data.debug || {},
      };
    } catch (err: any) {
      this.isSyncing = false;
      this.notify();
      return {
        success: false,
        message: `Gagal menarik data dari Google Sheets: ${err.message || 'Koneksi error'}`,
      };
    }
  }

  /**
   * Sync manual dengan GAS
   */
  public async syncWithGAS(): Promise<{ success: boolean; message: string }> {
    return this.pullDataFromGAS();
  }

  // ================= DATA GETTERS & MUTATORS =================

  public getStaffList(): StaffMember[] {
    return [...this.staff];
  }

  public getStaffByName(nama: string): StaffMember | undefined {
    return this.staff.find((s) => s.nama.toLowerCase() === nama.toLowerCase());
  }

  public addStaff(newStaff: Omit<StaffMember, 'id'>): { success: boolean; message: string; staff: StaffMember } {
    const nextId = this.staff.length > 0 ? Math.max(...this.staff.map((s) => s.id)) + 1 : 1;
    const item: StaffMember = {
      ...newStaff,
      id: nextId,
    };
    this.staff.push(item);
    this.persistToLocalStorage();
    return {
      success: true,
      message: `${item.nama} berhasil ditambahkan sebagai staff baru (ID ${item.id}).`,
      staff: item,
    };
  }

  public updateStaff(nama: string, updatedFields: Partial<StaffMember>): { success: boolean; message: string } {
    const idx = this.staff.findIndex((s) => s.nama.toLowerCase() === nama.toLowerCase());
    if (idx === -1) return { success: false, message: `Staff tidak ditemukan: ${nama}` };

    this.staff[idx] = {
      ...this.staff[idx],
      ...updatedFields,
    };
    this.persistToLocalStorage();
    return { success: true, message: `Profil ${nama} berhasil diperbarui.` };
  }

  // Mutasi Karyawan
  public submitMutasi(data: {
    nama: string;
    tanggalEfektif: string;
    jenisMutasi: string;
    nilaiBaru: string;
    keterangan: string;
    diinputOleh?: string;
  }): { success: boolean; message: string } {
    const staff = this.getStaffByName(data.nama);
    if (!staff) return { success: false, message: `Staff tidak ditemukan: ${data.nama}` };

    let nilaiLama = '-';
    // Match fields
    switch (data.jenisMutasi) {
      case 'Jabatan':
        nilaiLama = staff.jabatan;
        staff.jabatan = data.nilaiBaru;
        break;
      case 'Level/Kategori':
        nilaiLama = staff.level;
        staff.level = data.nilaiBaru;
        break;
      case 'Sekup':
        nilaiLama = staff.sekup;
        staff.sekup = data.nilaiBaru as any;
        break;
      case 'Status Kepegawaian':
        nilaiLama = staff.status;
        staff.status = data.nilaiBaru as any;
        break;
      case 'Status Aktif':
        nilaiLama = staff.statusAktif;
        staff.statusAktif = data.nilaiBaru as any;
        break;
      case 'Gaji Pokok':
        nilaiLama = 'Rp ' + staff.gajiPokok.toLocaleString('id-ID');
        staff.gajiPokok = parseFloat(data.nilaiBaru.replace(/[^0-9]/g, '')) || staff.gajiPokok;
        break;
      case 'Tunjangan Jabatan':
        nilaiLama = 'Rp ' + staff.tunjangan.toLocaleString('id-ID');
        staff.tunjangan = parseFloat(data.nilaiBaru.replace(/[^0-9]/g, '')) || staff.tunjangan;
        break;
      case 'Domisili':
        nilaiLama = staff.domisili;
        staff.domisili = data.nilaiBaru;
        break;
      case 'Proyeksi Jabatan':
        nilaiLama = staff.proyeksiJabatan || '-';
        staff.proyeksiJabatan = data.nilaiBaru;
        break;
      case 'Sanksi':
        nilaiLama = staff.sanksi || '-';
        staff.sanksi = data.nilaiBaru;
        break;
      case 'Awal PKWT':
        nilaiLama = staff.awalPKWT || '-';
        staff.awalPKWT = data.nilaiBaru;
        break;
      case 'Akhir PKWT':
        nilaiLama = staff.akhirPKWT || '-';
        staff.akhirPKWT = data.nilaiBaru;
        break;
      case 'Limit PKWT':
        nilaiLama = staff.limitPKWT || '-';
        staff.limitPKWT = data.nilaiBaru;
        break;
      default:
        break;
    }

    const d = new Date(data.tanggalEfektif);
    const mutasiItem: MutasiItem = {
      row: this.mutasi.length + 6,
      tanggalEfektif: data.tanggalEfektif,
      nama: data.nama,
      jenisMutasi: data.jenisMutasi,
      nilaiLama: String(nilaiLama),
      nilaiBaru: data.nilaiBaru,
      keterangan: data.keterangan || '-',
      diinputOleh: data.diinputOleh || 'Lalu Mahendra',
      bulan: isNaN(d.getMonth()) ? 1 : d.getMonth() + 1,
      tahun: isNaN(d.getFullYear()) ? 2026 : d.getFullYear(),
    };
    this.mutasi.unshift(mutasiItem);
    this.persistToLocalStorage();
    return { success: true, message: `Mutasi ${data.jenisMutasi} untuk ${data.nama} berhasil dicatat & diterapkan.` };
  }

  public getMutasiHistory(nama?: string): MutasiItem[] {
    if (!nama) return [...this.mutasi];
    return this.mutasi.filter((m) => m.nama.toLowerCase() === nama.toLowerCase());
  }

  // Presensi & Ijin
  public getPresensiList(bulan?: number, tahun?: number, namaFilter?: string): PresensiItem[] {
    return this.presensi
      .filter((p) => {
        if (bulan && p.bulan !== bulan) return false;
        if (tahun && p.tahun !== tahun) return false;
        if (namaFilter && namaFilter !== 'Semua' && p.nama.toLowerCase() !== namaFilter.toLowerCase()) return false;
        return true;
      })
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || a.nama.localeCompare(b.nama));
  }

  public addPresensiSingle(item: Omit<PresensiItem, 'rowNum'>): { success: boolean; message: string } {
    const nextRow = this.presensi.length > 0 ? Math.max(...this.presensi.map((p) => p.rowNum)) + 1 : 6;
    const durasi = item.durasi || 0;
    const faktor = computeFaktorPotongan(item.jenisIjin, durasi);

    const newItem: PresensiItem = {
      ...item,
      rowNum: nextRow,
      faktorPotongan: faktor,
    };
    this.presensi.unshift(newItem);
    this.persistToLocalStorage();
    return { success: true, message: `Presensi/Ijin untuk ${newItem.nama} berhasil dicatat (baris ${nextRow}).` };
  }

  public addPresensiBatch(data: {
    nama: string;
    jenisIjin: any;
    keperluan: string;
    lampiran: 'Ya' | 'Tidak';
    catatan?: string;
    tanggalList: { tanggal: string; jamAwal?: string; jamAkhir?: string; durasi?: number }[];
  }): { success: boolean; message: string } {
    let nextRow = this.presensi.length > 0 ? Math.max(...this.presensi.map((p) => p.rowNum)) + 1 : 6;
    const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const staff = this.getStaffByName(data.nama);

    data.tanggalList.forEach((t) => {
      const d = new Date(t.tanggal);
      const hari = namaHari[d.getDay()];
      const durasi = t.durasi || 0;
      const faktor = computeFaktorPotongan(data.jenisIjin, durasi);

      this.presensi.unshift({
        rowNum: nextRow++,
        tanggal: t.tanggal,
        hari: hari,
        nama: data.nama,
        sekup: staff?.sekup || 'Operasional',
        jamAwal: t.jamAwal,
        jamAkhir: t.jamAkhir,
        durasi: durasi,
        jenisIjin: data.jenisIjin,
        keperluan: data.keperluan,
        lampiran: data.lampiran,
        catatan: data.catatan,
        faktorPotongan: faktor,
        bulan: d.getMonth() + 1,
        tahun: d.getFullYear(),
      });
    });

    this.persistToLocalStorage();
    return {
      success: true,
      message: `${data.nama}: ${data.tanggalList.length} hari ijin (${data.jenisIjin}) berhasil dicatat sekaligus.`,
    };
  }

  public updatePresensi(rowNum: number, updated: Partial<PresensiItem>): { success: boolean; message: string } {
    const idx = this.presensi.findIndex((p) => p.rowNum === rowNum);
    if (idx === -1) return { success: false, message: 'Baris presensi tidak ditemukan.' };

    const current = this.presensi[idx];
    const durasi = updated.durasi !== undefined ? updated.durasi : current.durasi || 0;
    const jenisIjin = updated.jenisIjin || current.jenisIjin;
    const faktor = computeFaktorPotongan(jenisIjin, durasi);

    this.presensi[idx] = {
      ...current,
      ...updated,
      durasi,
      faktorPotongan: faktor,
    };
    this.persistToLocalStorage();
    return { success: true, message: 'Presensi berhasil diperbarui.' };
  }

  public deletePresensi(rowNum: number): { success: boolean; message: string } {
    this.presensi = this.presensi.filter((p) => p.rowNum !== rowNum);
    this.persistToLocalStorage();
    return { success: true, message: 'Data presensi/ijin berhasil dihapus.' };
  }

  // Lembur
  public getLemburList(tahun?: number): LemburItem[] {
    return this.lembur
      .filter((l) => (tahun ? l.tahun === tahun : true))
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }

  public addLemburBatch(data: {
    tanggal: string;
    namaList: string[];
    kategori: any;
    jamMulai?: string;
    jamSelesai?: string;
  }): { success: boolean; message: string; totalNominal: number } {
    let nextRow = this.lembur.length > 0 ? Math.max(...this.lembur.map((l) => l.rowNum)) + 1 : 6;
    const d = new Date(data.tanggal);
    const bulan = d.getMonth() + 1;
    const tahun = d.getFullYear();
    let totalNominal = 0;

    data.namaList.forEach((nama) => {
      const staff = this.getStaffByName(nama);
      // Flat 2x tarif harian: ((GP + Tunjangan)/26) * 2
      const gp = staff?.gajiPokok || 3500000;
      const tunjangan = staff?.tunjangan || 500000;
      const nominal = Math.round(((gp + tunjangan) / 26) * 2);
      totalNominal += nominal;

      this.lembur.unshift({
        rowNum: nextRow++,
        tanggal: data.tanggal,
        nama: nama,
        sekup: staff?.sekup || 'Operasional',
        kategori: data.kategori,
        jamMulai: data.jamMulai,
        jamSelesai: data.jamSelesai,
        nominal: nominal,
        bulan: bulan,
        tahun: tahun,
      });
    });

    this.persistToLocalStorage();
    return {
      success: true,
      message: `${data.namaList.length} staff berhasil dicatat lembur (${data.tanggal}, ${data.kategori}).`,
      totalNominal,
    };
  }

  // Calon Karyawan
  public getCalonList(): CalonKaryawanItem[] {
    this.recalculateDynamicDates();
    return [...this.calon].sort((a, b) => a.sisaHari - b.sisaHari);
  }

  public addCalon(data: Omit<CalonKaryawanItem, 'rowNum' | 'sisaHari' | 'durasi' | 'status' | 'jumlahPerpanjangan'>): {
    success: boolean;
    message: string;
  } {
    const nextRow = this.calon.length > 0 ? Math.max(...this.calon.map((c) => c.rowNum)) + 1 : 6;
    const tm = new Date(data.tanggalMulai);
    const ta = new Date(data.tanggalAkhir);
    const durasi = Math.max(1, Math.round((ta.getTime() - tm.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sisa = Math.round((ta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const newItem: CalonKaryawanItem = {
      ...data,
      rowNum: nextRow,
      durasi,
      sisaHari: sisa,
      status: 'Sedang Berjalan',
      jumlahPerpanjangan: 0,
    };
    this.calon.push(newItem);
    this.persistToLocalStorage();
    return { success: true, message: `${data.nama} berhasil ditambahkan sebagai calon karyawan.` };
  }

  public updateStatusCalon(data: {
    rowNum: number;
    status: 'Lolos' | 'Diperpanjang' | 'Tidak Lolos';
    jabatan?: string;
    gajiPokok?: number;
    tunjangan?: number;
    tanggalAkhirBaru?: string;
    alasan?: string;
  }): { success: boolean; message: string } {
    const idx = this.calon.findIndex((c) => c.rowNum === data.rowNum);
    if (idx === -1) return { success: false, message: 'Calon karyawan tidak ditemukan.' };

    const c = this.calon[idx];

    if (data.status === 'Lolos') {
      // Otomatis masukkan ke Database Karyawan (MASTER_STAFF) dengan status PKWT 1
      this.addStaff({
        nama: c.nama,
        status: 'PKWT 1',
        jabatan: data.jabatan || c.proyeksiJabatan || 'Staff Operasional',
        level: 'Staff Pratama',
        sekup: c.sekup,
        statusAktif: 'Aktif',
        jk: 'Laki-laki',
        nik: '350712' + Math.floor(1000000000 + Math.random() * 9000000000),
        email: `${c.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@batukarang.id`,
        domisili: 'Malang',
        gajiPokok: data.gajiPokok || 3500000,
        tunjangan: data.tunjangan || 500000,
        statusPTKP: 'TK/0',
        bpjsKesehatanNominal: 100000,
        proyeksiJabatan: c.proyeksiJabatan,
        awalPKWT: new Date().toISOString().slice(0, 10),
        akhirPKWT: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        limitPKWT: 'Kontrak PKWT ke-1',
        plafonLevel: 'Grade 1 - Pelaksana',
      });

      this.calon[idx] = {
        ...c,
        status: 'Lolos (Sudah Jadi Staff)',
        catatan: (c.catatan ? c.catatan + ' | ' : '') + `Lolos dan diangkat menjadi ${data.jabatan || c.proyeksiJabatan}.`,
      };
      this.persistToLocalStorage();
      return { success: true, message: `${c.nama} LOLOS dan resmi ditambahkan ke Database Karyawan (PKWT 1).` };
    }

    if (data.status === 'Diperpanjang') {
      if (!data.tanggalAkhirBaru) return { success: false, message: 'Tanggal akhir baru wajib diisi.' };
      const ta = new Date(data.tanggalAkhirBaru);
      const tm = new Date(c.tanggalMulai);
      const durasi = Math.max(1, Math.round((ta.getTime() - tm.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sisa = Math.round((ta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      this.calon[idx] = {
        ...c,
        tanggalAkhir: data.tanggalAkhirBaru,
        durasi,
        sisaHari: sisa,
        status: 'Sedang Berjalan',
        jumlahPerpanjangan: c.jumlahPerpanjangan + 1,
        catatan: (c.catatan ? c.catatan + ' | ' : '') + `Diperpanjang s.d ${data.tanggalAkhirBaru}. Alasan: ${data.alasan || '-'}`,
      };
      this.persistToLocalStorage();
      return { success: true, message: `Masa pelatihan ${c.nama} berhasil diperpanjang s.d ${data.tanggalAkhirBaru}.` };
    }

    if (data.status === 'Tidak Lolos') {
      // Baris dikosongkan/dihapus dari daftar CALON_KARYAWAN
      this.calon = this.calon.filter((item) => item.rowNum !== data.rowNum);
      this.persistToLocalStorage();
      return {
        success: true,
        message: `${c.nama} ditandai Tidak Lolos. Baris dihapus dari daftar aktif calon karyawan.`,
      };
    }

    return { success: false, message: 'Status tidak valid.' };
  }

  // Link Arsip
  public getLinksForStaff(nama: string): LinkArsipItem[] {
    return this.links.filter((l) => l.nama.toLowerCase() === nama.toLowerCase());
  }

  public addLinkArsip(data: { nama: string; label: string; url: string; diinputOleh?: string }): {
    success: boolean;
    message: string;
  } {
    const nextRow = this.links.length > 0 ? Math.max(...this.links.map((l) => l.row)) + 1 : 6;
    this.links.push({
      row: nextRow,
      nama: data.nama,
      label: data.label,
      url: data.url,
      tanggalDitambahkan: new Date().toISOString().slice(0, 10),
      diinputOleh: data.diinputOleh || 'Lalu Mahendra',
    });
    this.persistToLocalStorage();
    return { success: true, message: `Link "${data.label}" berhasil disimpan.` };
  }

  public deleteLinkArsip(rowNum: number): { success: boolean; message: string } {
    this.links = this.links.filter((l) => l.row !== rowNum);
    this.persistToLocalStorage();
    return { success: true, message: 'Link arsip berhasil dihapus.' };
  }

  // ================= PERHITUNGAN PAYROLL & SLIP GAJI =================
  /**
   * Rumus Payroll TER PMK 168/2023 & Slip Gaji Resmi PT Batu Karang:
   * (1) BPJS JHT & JP dihitung dari Gaji Pokok + Tunjangan PENUH (H+I), bukan K.
   * (2) Rate BPJS JP = 1% (cap Rp 11.086.300 per Maret 2026).
   * (3) BPJS Kesehatan = nominal TETAP per staff (AD).
   * (4) Potongan Ijin = HariTidakDibayar * ((GajiPokok + Tunjangan) / 26).
   * (5) Total Lembur = Flat 2x tarif harian per kejadian di bulan/tahun tsb.
   * (6) Bruto K = GajiPokok + Tunjangan + Lembur - PotonganIjin.
   * (7) Tarif TER = VLOOKUP Kategori TER A/B/C x Bruto K.
   * (8) PPh21 = Bruto K * Tarif TER.
   * (9) Gaji Diterima = Bruto K - (JHT + JP + BPJS Ks + PPh21).
   */
  public calculateSlipGaji(nama: string, bulan: number, tahun: number): SlipGajiCalculation {
    const staff = this.getStaffByName(nama);
    if (!staff) {
      throw new Error(`Data staff tidak ditemukan: ${nama}`);
    }

    const gp = staff.gajiPokok || 0;
    const tunjangan = staff.tunjangan || 0;
    const rateHarian = (gp + tunjangan) / 26;

    // Hitung Hari Tidak Dibayar (Faktor Potongan) di bulan & tahun tsb
    const presensiBulan = this.presensi.filter(
      (p) => p.nama.toLowerCase() === nama.toLowerCase() && p.bulan === bulan && p.tahun === tahun
    );
    const hariTidakDibayar = presensiBulan.reduce((sum, p) => sum + (p.faktorPotongan || 0), 0);
    const potonganIjin = Math.round(hariTidakDibayar * rateHarian);

    // Hitung Total Lembur di bulan & tahun tsb
    const lemburBulan = this.lembur.filter(
      (l) => l.nama.toLowerCase() === nama.toLowerCase() && l.bulan === bulan && l.tahun === tahun
    );
    const totalLembur = lemburBulan.reduce((sum, l) => sum + (l.nominal || 0), 0);

    // Total Gaji Bruto K (setelah potongan ijin)
    const bruto = Math.max(0, gp + tunjangan + totalLembur - potonganIjin);

    // BPJS JHT (2% dari GP + Tunjangan Penuh)
    const bpjsJht = Math.round((gp + tunjangan) * 0.02);

    // BPJS JP (1% dari GP + Tunjangan Penuh, maks basis Rp 11.086.300)
    const basisJp = Math.min(gp + tunjangan, 11086300);
    const bpjsJp = Math.round(basisJp * 0.01);
    const totalBpjsTk = bpjsJht + bpjsJp;

    // BPJS Kesehatan (nominal tetap per staff dari MASTER_STAFF AD)
    const bpjsKesehatan = staff.bpjsKesehatanNominal || 0;

    // PPh21 TER (PMK 168/2023)
    const kategoriTer = getKategoriTER(staff.statusPTKP);
    const tarifPph21 = getTarifTER(bruto, kategoriTer);
    const pph21 = Math.round(bruto * tarifPph21);

    // Gaji Diterima (Take Home Pay)
    const gajiDiterima = Math.max(0, bruto - bpjsJht - bpjsJp - bpjsKesehatan - pph21);

    return {
      nama: staff.nama,
      jabatan: staff.jabatan,
      sekup: staff.sekup,
      bulan,
      tahun,
      gajiPokok: gp,
      tunjangan: tunjangan,
      totalLembur,
      hariTidakDibayar,
      potonganIjin,
      bruto,
      bpjsJht,
      bpjsJp,
      totalBpjsTk,
      bpjsKesehatan,
      kategoriTer,
      tarifPph21,
      tarifPph21Percent: (tarifPph21 * 100).toFixed(2) + '%',
      pph21,
      gajiDiterima,
      statusPTKP: staff.statusPTKP || 'TK/0',
    };
  }

  /**
   * Beban Gaji Dashboard Divisi Produksi I
   * Gaji Pokok + Tunjangan Jabatan seluruh staff aktif vs Potongan Ijin
   */
  public getDashboardBebanGaji(bulan: number, tahun: number) {
    const aktifStaff = this.staff.filter((s) => s.statusAktif === 'Aktif');
    let totalKetentuan = 0;
    let totalPotongan = 0;

    aktifStaff.forEach((s) => {
      const nominal = (s.gajiPokok || 0) + (s.tunjangan || 0);
      totalKetentuan += nominal;

      // Cari presensi bulan ini dari log presensi
      let faktorStaff = this.presensi
        .filter((p) => p.nama.toLowerCase() === s.nama.toLowerCase() && p.bulan === bulan && p.tahun === tahun)
        .reduce((sum, p) => sum + (p.faktorPotongan || 0), 0);

      // Jika log presensi kosong, gunakan data menit izin bulan ini dari LOG_PERFORMA
      if (faktorStaff === 0 && this.performa.length > 0) {
        const perf = this.performa.find((p) => p.nama && p.nama.toLowerCase() === s.nama.toLowerCase());
        if (perf && Array.isArray(perf.bulanan)) {
          const bulanItem = perf.bulanan.find((b: any) => b.bulan === bulan);
          if (bulanItem && bulanItem.menit > 0) {
            faktorStaff = bulanItem.menit / 420; // 420 menit per hari kerja normal
          }
        }
      }

      totalPotongan += Math.round(faktorStaff * (nominal / 26));
    });

    return {
      jumlahStaffAktif: aktifStaff.length,
      totalKetentuan,
      totalPotongan,
      totalSetelahPotongan: Math.max(0, totalKetentuan - totalPotongan),
    };
  }

  /**
   * Rekap Tahunan Kehadiran per Staff (Jan - Des)
   */
  public getRekapTahunan(tahun: number, namaFilter?: string) {
    const list = this.staff.filter((s) => {
      if (namaFilter && namaFilter !== 'Semua') {
        return s.nama.toLowerCase() === namaFilter.toLowerCase();
      }
      return true;
    });

    const menitPerBulan = 10440; // 26 hari (22x420 + 4x300)
    const menitPerTahun = menitPerBulan * 12;

    return list.map((s) => {
      // Prioritaskan matriks LOG_PERFORMA asli jika tersedia
      const perf = this.performa.find((p) => p.nama && p.nama.toLowerCase() === s.nama.toLowerCase());
      if (perf && Array.isArray(perf.bulanan) && perf.bulanan.length === 12) {
        return {
          nama: s.nama,
          jabatan: s.jabatan,
          sekup: s.sekup,
          bulanan: perf.bulanan,
          totalIjin: perf.totalIjin || perf.bulanan.reduce((sum: number, b: any) => sum + (b.menit || 0), 0),
          totalTersedia: perf.totalTersedia || menitPerTahun,
          pctKehadiran: perf.pctKehadiran,
        };
      }

      const bulanan: { bulan: number; menit: number }[] = [];
      let totalIjin = 0;

      for (let m = 1; m <= 12; m++) {
        const ijinBulan = this.presensi
          .filter((p) => p.nama.toLowerCase() === s.nama.toLowerCase() && p.bulan === m && p.tahun === tahun)
          .reduce((sum, p) => sum + (p.durasi || 0), 0);
        bulanan.push({ bulan: m, menit: ijinBulan });
        totalIjin += ijinBulan;
      }

      const pctKehadiran = Math.max(0, Math.min(100, 100 - (totalIjin / menitPerTahun) * 100));

      return {
        nama: s.nama,
        jabatan: s.jabatan,
        sekup: s.sekup,
        bulanan,
        totalIjin,
        totalTersedia: menitPerTahun,
        pctKehadiran: Math.round(pctKehadiran * 100) / 100, // 2 decimal precision
      };
    });
  }
}

export const gasStore = new GASDataStore();
