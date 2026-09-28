import { 
  StaffMember, 
  PresensiItem, 
  LemburItem, 
  CalonKaryawanItem, 
  MutasiItem, 
  SlipGajiItem,
  SummaryStatistik 
} from './types[HRStaff]';
import { 
  initialStaffData, 
  initialPresensiData, 
  initialLemburData, 
  initialCalonKaryawanData, 
  initialMutasiData,
  computeFaktorPotongan
} from './mockData[HRStaff]';

const LOCAL_STORAGE_KEY = 'hr_staff_pabrik_db_v2';
export const DEFAULT_GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycby5aUndwYB1AjfM-d28J4-9I3Kuweh23Ef0TA4-hpYjlDIYVluTMuX8YkRodIqLs9ue/exec';

export interface LocalCacheSchema {
  staff: StaffMember[];
  presensi: PresensiItem[];
  lembur: LemburItem[];
  calon: CalonKaryawanItem[];
  mutasi: MutasiItem[];
  slipGaji: SlipGajiItem[];
  lastSync: string;
  endpointUrl: string;
}

/**
 * Service Headless Offline-First untuk HR Staff Divisi Produksi I
 */
class GASServiceStore {
  private staff: StaffMember[] = [];
  private presensi: PresensiItem[] = [];
  private lembur: LemburItem[] = [];
  private calon: CalonKaryawanItem[] = [];
  private mutasi: MutasiItem[] = [];
  private slipGaji: SlipGajiItem[] = [];
  private endpointUrl: string = DEFAULT_GAS_ENDPOINT;
  private lastSyncTime: string = new Date().toISOString();
  private isSyncing: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed: LocalCacheSchema = JSON.parse(cached);
        this.staff = parsed.staff || initialStaffData;
        this.presensi = parsed.presensi || initialPresensiData;
        this.lembur = parsed.lembur || initialLemburData;
        this.calon = parsed.calon || initialCalonKaryawanData;
        this.mutasi = parsed.mutasi || initialMutasiData;
        this.slipGaji = parsed.slipGaji || [];
        this.endpointUrl = parsed.endpointUrl || DEFAULT_GAS_ENDPOINT;
        this.lastSyncTime = parsed.lastSync || new Date().toISOString();
      } else {
        this.resetToDefaults();
      }
    } catch {
      this.resetToDefaults();
    }
  }

  public resetToDefaults() {
    this.staff = [...initialStaffData];
    this.presensi = [...initialPresensiData];
    this.lembur = [...initialLemburData];
    this.calon = [...initialCalonKaryawanData];
    this.mutasi = [...initialMutasiData];
    this.slipGaji = [];
    this.endpointUrl = DEFAULT_GAS_ENDPOINT;
    this.lastSyncTime = new Date().toISOString();
    this.persistToLocalStorage();
    this.notify();
  }

  private persistToLocalStorage() {
    try {
      const data: LocalCacheSchema = {
        staff: this.staff,
        presensi: this.presensi,
        lembur: this.lembur,
        calon: this.calon,
        mutasi: this.mutasi,
        slipGaji: this.slipGaji,
        lastSync: this.lastSyncTime,
        endpointUrl: this.endpointUrl,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Gagal menyimpan cache ke localStorage:', err);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error saat memanggil listener GAS store:', e);
      }
    });
  }

  public getEndpointUrl(): string {
    return this.endpointUrl;
  }

  public setEndpointUrl(url: string) {
    this.endpointUrl = url.trim();
    this.persistToLocalStorage();
    this.notify();
  }

  public getLastSyncTime(): string {
    return this.lastSyncTime;
  }

  public isCurrentlySyncing(): boolean {
    return this.isSyncing;
  }

  public async testGASConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = performance.now();
    try {
      const pingUrl = `${this.endpointUrl}${this.endpointUrl.includes('?') ? '&' : '?'}action=ping`;
      const res = await fetch(pingUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const end = performance.now();
      const latencyMs = Math.round(end - start);

      if (res.ok) {
        return {
          success: true,
          latencyMs,
          message: 'Koneksi ke Google Apps Script berhasil dan aktif.',
        };
      } else {
        return {
          success: false,
          latencyMs,
          message: `Server merespon dengan status ${res.status}: ${res.statusText}`,
        };
      }
    } catch (err: any) {
      const end = performance.now();
      return {
        success: false,
        latencyMs: Math.round(end - start),
        message: err.message || 'Gagal menghubungi endpoint Google Apps Script.',
      };
    }
  }

  /**
   * Tarik Data Nyata dari Google Apps Script / Spreadsheet
   * Dengan Proteksi Pemetaan Kolom Presisi
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

      // 1. Process Staff List (Filter ID agar tidak masuk ke Nama)
      if (Array.isArray(data.staffList) && data.staffList.length > 0) {
        const mappedStaff: StaffMember[] = data.staffList
          .filter((item: any) => {
            const rawNama = cleanStr(item.nama || item.namaStaff || item.namaKaryawan || item['NAMA'] || item['NAMA STAFF']);
            if (!rawNama) return false;
            const lower = rawNama.toLowerCase();
            if (lower === 'id' || lower === 'no' || lower === 'nomor' || lower === 'nama' || lower === 'nama staff') return false;
            if (/^\d+$/.test(rawNama)) return false; // Abaikan jika cuma nomor angka
            return true;
          })
          .map((item: any, idx: number) => {
            const nama = cleanStr(item.nama || item.namaStaff || item.namaKaryawan || item['NAMA'] || item['NAMA STAFF'] || item['Nama']);
            const jabatan = cleanStr(item.jabatan || item.posisi || item['JABATAN'] || item['Jabatan']) || 'Staff Operasional';
            const level = cleanStr(item.level || item.grade || item['LEVEL'] || item['Level']) || 'Staff Pelaksana';
            const rawSekup = cleanStr(item.sekup || item.divisi || item['SEKUP'] || item['DIVISI'] || item['Sekup']);
            const sekup = rawSekup.toLowerCase().includes('admin') ? 'Administrasi' : 'Operasional';
            const rawAktif = cleanStr(item.statusAktif || item.aktif || item['STATUS AKTIF'] || item['KEAKTIFAN'] || item['Keaktifan']);
            const statusAktif = rawAktif.toLowerCase().includes('non') ? 'Non Aktif' : 'Aktif';
            const rawStatus = cleanStr(item.status || item['STATUS'] || item['Status Kepegawaian'] || item['STATUS KEPEGAWAIAN'] || 'TETAP');
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
              jk: (cleanStr(item.jk || item.jenisKelamin || item['JK']).toLowerCase().startsWith('p') ? 'Perempuan' : 'Laki-laki') as any,
              nik: cleanStr(item.nik || item['NIK'] || item['No. KTP']) || `350712${1000000000 + idx}`,
              kk: cleanStr(item.kk || item['KK'] || item['No. KK']),
              npwp: cleanStr(item.npwp || item['NPWP']),
              email: cleanStr(item.email || item['EMAIL']) || `${nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@batukarang.id`,
              bank: cleanStr(item.bank || item['BANK']) || 'BCA',
              rekening: cleanStr(item.rekening || item['REKENING'] || item['NO REKENING']),
              telp: cleanStr(item.telp || item.noHp || item['TELP'] || item['NO TELP'] || item['WA']),
              domisili: cleanStr(item.domisili || item['DOMISILI'] || item['KOTA']) || 'Malang',
              gajiPokok: cleanNum(item.gajiPokok || item.gapok || item['GAJI POKOK'], 3500000),
              tunjangan: cleanNum(item.tunjangan || item['TUNJANGAN'], 500000),
              statusPTKP: (cleanStr(item.statusPTKP || item.ptkp || item['STATUS PTKP'] || item['PTKP']) || 'TK/0') as any,
              bpjsKesehatanNominal: cleanNum(item.bpjsKesehatanNominal || item['BPJS KESEHATAN'] || item['BPJS'], 100000),
              proyeksiJabatan: cleanStr(item.proyeksiJabatan || item['PROYEKSI JABATAN']),
              sanksi: cleanStr(item.sanksi || item['SANKSI']) || '-',
              awalPKWT: cleanStr(item.awalPKWT || item['AWAL PKWT'] || item['TGL MASUK']),
              akhirPKWT: cleanStr(item.akhirPKWT || item['AKHIR PKWT'] || item['TGL BERAKHIR']),
              limitPKWT: cleanStr(item.limitPKWT || item['LIMIT PKWT']),
              plafonLevel: cleanStr(item.plafonLevel || item['PLAFON']),
              deskripsiJabatan: cleanStr(item.deskripsiJabatan || item['DESKRIPSI JABATAN']),
              faskes: cleanStr(item.faskes || item['FASKES'] || item['FASILITAS KESEHATAN']),
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
              mentor: c.mentor || 'Pembimbing Operasional',
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

  public async syncWithGAS(): Promise<{ success: boolean; message: string }> {
    return this.pullDataFromGAS();
  }

  // ================= DATA GETTERS & MUTATORS =================

  public getStaffList(): StaffMember[] {
    return [...this.staff];
  }

  public getStaffById(id: number): StaffMember | undefined {
    return this.staff.find((s) => s.id === id);
  }

  public getStaffByName(nama: string): StaffMember | undefined {
    return this.staff.find((s) => s.nama.toLowerCase() === nama.toLowerCase());
  }

  public addStaff(newStaff: Omit<StaffMember, 'id'>): StaffMember {
    const nextId = this.staff.length > 0 ? Math.max(...this.staff.map((s) => s.id)) + 1 : 1;
    const item: StaffMember = {
      ...newStaff,
      id: nextId,
    };
    this.staff.push(item);
    this.persistToLocalStorage();
    this.notify();
    this.silentSyncToGAS('addStaff', item);
    return item;
  }

  public updateStaff(id: number, updates: Partial<StaffMember>): boolean {
    const index = this.staff.findIndex((s) => s.id === id);
    if (index === -1) return false;

    this.staff[index] = {
      ...this.staff[index],
      ...updates,
    };
    this.persistToLocalStorage();
    this.notify();
    this.silentSyncToGAS('updateStaff', this.staff[index]);
    return true;
  }

  public getPresensiList(): PresensiItem[] {
    return [...this.presensi];
  }

  public addPresensi(item: Omit<PresensiItem, 'rowNum'>): PresensiItem {
    const rowNum = this.presensi.length > 0 ? Math.max(...this.presensi.map((p) => p.rowNum)) + 1 : 6;
    const fullItem: PresensiItem = {
      ...item,
      rowNum,
    };
    this.presensi.unshift(fullItem);
    this.persistToLocalStorage();
    this.notify();
    this.silentSyncToGAS('addPresensi', fullItem);
    return fullItem;
  }

  public getLemburList(): LemburItem[] {
    return [...this.lembur];
  }

  public addLembur(item: Omit<LemburItem, 'rowNum'>): LemburItem {
    const rowNum = this.lembur.length > 0 ? Math.max(...this.lembur.map((l) => l.rowNum)) + 1 : 6;
    const fullItem: LemburItem = {
      ...item,
      rowNum,
    };
    this.lembur.unshift(fullItem);
    this.persistToLocalStorage();
    this.notify();
    this.silentSyncToGAS('addLembur', fullItem);
    return fullItem;
  }

  public getCalonList(): CalonKaryawanItem[] {
    return [...this.calon];
  }

  public addCalonKaryawan(item: Omit<CalonKaryawanItem, 'rowNum' | 'sisaHari' | 'durasi'>): CalonKaryawanItem {
    const rowNum = this.calon.length > 0 ? Math.max(...this.calon.map((c) => c.rowNum)) + 1 : 6;
    const tm = new Date(item.tanggalMulai);
    const ta = new Date(item.tanggalAkhir);
    const durasi = Math.max(1, Math.round((ta.getTime() - tm.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sisaHari = Math.round((ta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const fullItem: CalonKaryawanItem = {
      ...item,
      rowNum,
      durasi,
      sisaHari,
    };
    this.calon.unshift(fullItem);
    this.persistToLocalStorage();
    this.notify();
    this.silentSyncToGAS('addCalon', fullItem);
    return fullItem;
  }

  public updateCalonStatus(
    rowNum: number, 
    newStatus: CalonKaryawanItem['status'], 
    catatan?: string, 
    newTanggalAkhir?: string
  ): boolean {
    const item = this.calon.find((c) => c.rowNum === rowNum);
    if (!item) return false;

    item.status = newStatus;
    if (catatan) item.catatan = catatan;

    if (newStatus === 'Diperpanjang' && newTanggalAkhir) {
      item.tanggalAkhir = newTanggalAkhir;
      item.jumlahPerpanjangan = (item.jumlahPerpanjangan || 0) + 1;
      const tm = new Date(item.tanggalMulai);
      const ta = new Date(newTanggalAkhir);
      item.durasi = Math.max(1, Math.round((ta.getTime() - tm.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      item.sisaHari = Math.round((ta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (newStatus === 'Lolos') {
      const existing = this.getStaffByName(item.nama);
      if (!existing) {
        this.addStaff({
          nama: item.nama,
          status: 'PKWT 1',
          jabatan: item.proyeksiJabatan || 'Staff Operasional',
          level: 'Staff Pelaksana',
          sekup: item.sekup,
          statusAktif: 'Aktif',
          jk: 'Laki-laki',
          nik: `350712${1000000000 + this.staff.length}`,
          domisili: 'Malang',
          email: `${item.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@batukarang.id`,
          bank: 'BCA',
          gajiPokok: 3500000,
          tunjangan: 500000,
          statusPTKP: 'TK/0',
          bpjsKesehatanNominal: 100000,
          proyeksiJabatan: item.proyeksiJabatan,
          sanksi: '-',
          awalPKWT: item.tanggalAkhir,
          akhirPKWT: new Date(new Date(item.tanggalAkhir).setFullYear(new Date(item.tanggalAkhir).getFullYear() + 1))
            .toISOString()
            .slice(0, 10),
          limitPKWT: 'Maks 2 Tahun',
        });
      }
    }

    this.persistToLocalStorage();
    this.notify();
    this.silentSyncToGAS('updateCalonStatus', { rowNum, newStatus, catatan, newTanggalAkhir });
    return true;
  }

  public getMutasiList(): MutasiItem[] {
    return [...this.mutasi];
  }

  public addMutasi(item: Omit<MutasiItem, 'id'>): MutasiItem {
    const nextId = this.mutasi.length > 0 ? Math.max(...this.mutasi.map((m) => m.id)) + 1 : 1;
    const fullItem: MutasiItem = {
      ...item,
      id: nextId,
    };
    this.mutasi.unshift(fullItem);

    const staffMember = this.getStaffByName(item.namaStaff);
    if (staffMember) {
      this.updateStaff(staffMember.id, {
        status: item.keStatus,
        jabatan: item.keJabatan,
        level: item.keLevel,
        sekup: item.keSekup,
        gajiPokok: item.keGajiPokok,
        tunjangan: item.keTunjangan,
      });
    }

    this.persistToLocalStorage();
    this.notify();
    this.silentSyncToGAS('addMutasi', fullItem);
    return fullItem;
  }

  public hitungSlipGaji(bulan: number, tahun: number, staffId?: number): SlipGajiItem[] {
    const targetStaff = staffId ? this.staff.filter((s) => s.id === staffId) : this.staff;
    const listSlip: SlipGajiItem[] = [];

    const presensiBulan = this.presensi.filter((p) => p.bulan === bulan && p.tahun === tahun);
    const lemburBulan = this.lembur.filter((l) => l.bulan === bulan && l.tahun === tahun);

    for (const st of targetStaff) {
      const gp = st.gajiPokok || 3500000;
      const tunj = st.tunjangan || 500000;

      const pStaff = presensiBulan.filter((p) => p.nama.toLowerCase() === st.nama.toLowerCase());
      const lStaff = lemburBulan.filter((l) => l.nama.toLowerCase() === st.nama.toLowerCase());

      const ratePerHari = (gp + tunj) / 26;
      let totalPotonganIjin = 0;
      for (const p of pStaff) {
        totalPotonganIjin += (p.faktorPotongan || 0) * ratePerHari;
      }

      let totalNominalLembur = 0;
      for (const l of lStaff) {
        totalNominalLembur += l.nominal || 0;
      }

      const bpjsKesehatan = st.bpjsKesehatanNominal || 100000;
      const bpjsKetenagakerjaan = Math.round(gp * 0.03);

      const bruto = gp + tunj + totalNominalLembur;
      let pph21 = 0;
      if (bruto > 5000000) {
        const ratePph = st.statusPTKP === 'K/3' ? 0.005 : 0.015;
        pph21 = Math.round(bruto * ratePph);
      }

      const totalPotongan = Math.round(totalPotonganIjin + bpjsKesehatan + bpjsKetenagakerjaan + pph21);
      const gajiBersih = Math.max(0, bruto - totalPotongan);

      listSlip.push({
        id: `${st.id}-${bulan}-${tahun}`,
        staffId: st.id,
        nama: st.nama,
        jabatan: st.jabatan,
        sekup: st.sekup,
        bulan,
        tahun,
        gajiPokok: gp,
        tunjangan: tunj,
        nominalLembur: totalNominalLembur,
        potonganIjin: Math.round(totalPotonganIjin),
        bpjsKesehatan,
        bpjsKetenagakerjaan,
        pph21,
        totalGajiBersih: gajiBersih,
        statusTransfer: 'Pending',
      });
    }

    this.slipGaji = listSlip;
    this.persistToLocalStorage();
    this.notify();
    return listSlip;
  }

  public getSummaryStatistik(): SummaryStatistik {
    const totalStaff = this.staff.length;
    const staffTetap = this.staff.filter((s) => s.status === 'TETAP').length;
    const staffPKWT = this.staff.filter((s) => s.status.startsWith('PKWT')).length;
    const calonAktif = this.calon.filter((c) => c.status === 'Sedang Berjalan' || c.status === 'Diperpanjang').length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const presensiToday = this.presensi.filter((p) => p.tanggal === todayStr);

    const izinHariIni = presensiToday.filter((p) => p.jenisIjin !== 'Hadir').length;
    const totalIzinBulanIni = this.presensi.filter((p) => p.jenisIjin !== 'Hadir').length;
    const lemburBulanIni = this.lembur.length;

    return {
      totalStaff,
      staffTetap,
      staffPKWT,
      calonAktif,
      presensiHariIni: presensiToday.length,
      izinHariIni,
      lemburBulanIni,
      totalIzinBulanIni,
    };
  }

  public exportCacheJSON(): string {
    const data: LocalCacheSchema = {
      staff: this.staff,
      presensi: this.presensi,
      lembur: this.lembur,
      calon: this.calon,
      mutasi: this.mutasi,
      slipGaji: this.slipGaji,
      lastSync: this.lastSyncTime,
      endpointUrl: this.endpointUrl,
    };
    return JSON.stringify(data, null, 2);
  }

  public importCacheJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.staff && Array.isArray(parsed.staff)) {
        this.staff = parsed.staff;
        if (parsed.presensi) this.presensi = parsed.presensi;
        if (parsed.lembur) this.lembur = parsed.lembur;
        if (parsed.calon) this.calon = parsed.calon;
        if (parsed.mutasi) this.mutasi = parsed.mutasi;
        if (parsed.slipGaji) this.slipGaji = parsed.slipGaji;
        this.lastSyncTime = new Date().toISOString();
        this.persistToLocalStorage();
        this.notify();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private recalculateDynamicDates() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.calon.forEach((c) => {
      const tm = new Date(c.tanggalMulai);
      const ta = new Date(c.tanggalAkhir);
      c.durasi = Math.max(1, Math.round((ta.getTime() - tm.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      c.sisaHari = Math.round((ta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    });
  }

  private async silentSyncToGAS(action: string, payload: any) {
    if (!this.endpointUrl || this.endpointUrl === DEFAULT_GAS_ENDPOINT) {
      return;
    }
    try {
      fetch(this.endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload, timestamp: new Date().toISOString() }),
        mode: 'no-cors',
      }).catch((e) => console.warn('Silent sync error (normal under no-cors):', e));
    } catch {}
  }
}

export const gasStore = new GASServiceStore();
