/**
 * SuratIjinModal[HRStaff].tsx
 * Modal Preview & Cetak Formulir Baku "SURAT PERMOHONAN IJIN - Karyawan Bulanan"
 * Ukuran Resmi Standar Perusahaan (20.5cm x 16cm)
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React from 'react';
import { Printer, X } from 'lucide-react';
import { SuratIjinData } from '../types[HRStaff]';

interface SuratIjinModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SuratIjinData | null;
}

export const SuratIjinModal: React.FC<SuratIjinModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    document.body.classList.add('printing-surat-ijin');
    const originalTitle = document.title;
    // Ketentuan Tambahan #6: nama file export selalu: nama project diikuti nama tab/field
    document.title = `HR Staff System - Surat Permohonan Ijin - ${data.nama}`;
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-surat-ijin');
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="surat-ijin-container-active fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col rounded-2xl bg-slate-200 shadow-2xl border border-slate-300 overflow-hidden">
        {/* Modal Controls Header */}
        <div className="no-print flex items-center justify-between border-b border-slate-300 bg-white px-6 py-3.5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Preview Surat Permohonan Ijin Resmi</h2>
            <p className="text-xs text-slate-500">Format Kertas Standar Baku: 20,5 cm × 16,0 cm</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="allow-print flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors"
              type="button"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Paper Container */}
        <div className="overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-200/90">
          <div
            className="surat-ijin-paper bg-white text-black shadow-xl select-none"
            style={{
              width: '20.5cm',
              height: '16cm',
              padding: '0.25cm 0.5cm 0.6cm 0.5cm',
              boxSizing: 'border-box',
              fontFamily: 'Arial, sans-serif',
              fontSize: '12px',
              lineHeight: 1.35,
              position: 'relative',
            }}
          >
            {/* Title */}
            <div className="text-center font-bold text-base tracking-wide uppercase">
              SURAT PERMOHONAN IJIN
            </div>
            <div className="text-center italic font-bold text-xs mb-2">
              Karyawan Bulanan
            </div>

            {/* Introductory sentence */}
            <div className="text-[12px] mb-1">Yang bertanda tangan di bawah ini;</div>

            {/* Staff Data Fields */}
            <div className="space-y-0.5 text-[12px]">
              <div className="flex items-baseline">
                <span className="font-bold w-40 shrink-0">Nama</span>
                <span className="mr-1.5">:</span>
                <span className="font-bold border-b border-dotted border-black min-w-[220px] px-1">
                  {data.nama}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold w-40 shrink-0">Jabatan</span>
                <span className="mr-1.5">:</span>
                <span className="font-bold border-b border-dotted border-black min-w-[220px] px-1">
                  {data.jabatan}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold w-40 shrink-0">Divisi / Unit</span>
                <span className="mr-1.5">:</span>
                <span className="font-bold border-b border-dotted border-black min-w-[220px] px-1">
                  {data.divisi} / {data.unit}
                </span>
              </div>
            </div>

            {/* Checkbox Options Block */}
            <div className="my-2 text-[11.5px] leading-relaxed">
              <div className="font-bold mb-0.5">Dengan ini mengajukan*</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                <span>
                  {data.checkbox === 'normatif' ? '☑' : '☐'} Ijin Normatif,
                </span>
                <span>
                  {data.checkbox === 'tidakMasuk' ? '☑' : '☐'} Ijin Tidak Masuk Kerja,
                </span>
                <span>
                  {data.checkbox === 'terlambat' ? '☑' : '☐'} Ijin Datang Terlambat,
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                <span>
                  {data.checkbox === 'keluarSementara' ? '☑' : '☐'} Ijin Meninggalkan Tempat Kerja Sementara Waktu,
                </span>
                <span>
                  {data.checkbox === 'pulangCepat' ? '☑' : '☐'} Ijin Pulang Lebih Cepat,
                </span>
              </div>
              <div>
                <span>
                  {data.checkbox === 'eksternal' ? '☑' : '☐'} Ijin Melaksanakan Tugas Kerja Yang Bersifat Ekstern Perusahaan**,
                </span>
              </div>
              <div>
                <span>
                  {data.checkbox === 'formKehadiran' ? '☑' : '☐'} Form Kehadiran***
                </span>
              </div>
            </div>

            {/* Time and Duration Details */}
            <div className="space-y-0.5 text-[12px]">
              <div className="flex items-baseline">
                <span className="font-bold w-40 shrink-0">pada : Hari</span>
                <span className="mr-1.5">:</span>
                <span className="font-bold border-b border-dotted border-black min-w-[80px] px-1">
                  {data.hari}
                </span>
                <span className="mx-2 text-xs">s/d</span>
                <span className="font-bold border-b border-dotted border-black min-w-[80px] px-1">
                  {data.hari}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="font-bold w-40 shrink-0">Tanggal</span>
                <span className="mr-1.5">:</span>
                <span className="font-bold border-b border-dotted border-black min-w-[80px] px-1">
                  {data.tanggal}
                </span>
                <span className="mx-2 text-xs">s/d</span>
                <span className="font-bold border-b border-dotted border-black min-w-[80px] px-1">
                  {data.tanggal}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="font-bold w-40 shrink-0">Keterangan ijin / Form***</span>
                <span className="mr-1.5">:</span>
                <span className="font-bold border-b border-dotted border-black flex-1 px-1">
                  {data.keperluan || '-'}
                </span>
              </div>

              <div className="flex items-baseline flex-wrap gap-y-1">
                <span className="font-bold w-40 shrink-0">Jam masuk</span>
                <span className="mr-1.5">:</span>
                <span className="font-bold border-b border-dotted border-black min-w-[50px] px-1">
                  {data.jamMasuk || '-'}
                </span>
                <span className="ml-3 font-bold">Jam keluar:</span>
                <span className="font-bold border-b border-dotted border-black min-w-[50px] px-1 ml-1">
                  {data.jamKeluar || '-'}
                </span>
                <span className="ml-3 font-bold">Jam masuk kembali:</span>
                <span className="font-bold border-b border-dotted border-black min-w-[50px] px-1 ml-1">
                  {data.jamMasukKembali || '-'}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="font-bold w-40 shrink-0">Jumlah Ijin (Jam Kerja)</span>
                <span className="mr-1.5">:</span>
                <span className="font-bold border-b border-dotted border-black min-w-[30px] text-center px-1">
                  {data.jamBagian}
                </span>
                <span className="mx-1">Jam</span>
                <span className="font-bold border-b border-dotted border-black min-w-[30px] text-center px-1">
                  {data.menitBagian}
                </span>
                <span className="mx-1">Menit</span>
                <span className="text-[10px] text-slate-600 ml-2 italic">
                  (Diisi Hanya Jam Kerja Yang Diambil Untuk Ijin Saja)
                </span>
              </div>
            </div>

            {/* Statement */}
            <div className="text-[10.5px] leading-tight my-2">
              Demikian surat ijin ini kami buat dengan sebenarnya, kami bersedia menerima sanksi administrasi apabila dikemudian hari terjadi penyalahgunaan ijin / tidak sesuai dengan ijin yang kami ajukan.
            </div>

            {/* Signature Area */}
            <div className="flex justify-between items-start mt-2 text-[11px]">
              {/* Left signatures (Superiors) */}
              <div>
                <div className="font-bold mb-1">Pejabat yang berwenang</div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div>Mengetahui 3,<br />HRD II & Umum II</div>
                  <div>Mengetahui 2,</div>
                  <div>Mengetahui 1,</div>
                  <div>Menyetujui</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] mt-8">
                  <div>(....................)</div>
                  <div>(....................)</div>
                  <div>(....................)</div>
                  <div>(....................)</div>
                </div>
              </div>

              {/* Right signature (Employee) */}
              <div className="text-center min-w-[170px]">
                <div className="font-medium text-[11px]">
                  Malang, {data.tglCetak} 20{data.thnCetak}
                </div>
                <div className="text-[11px] mt-0.5">Karyawan ybs,</div>
                <div className="mt-8 font-bold border-b border-black inline-block px-4">
                  {data.nama}
                </div>
              </div>
            </div>

            {/* Footnotes */}
            <div className="text-[9.5px] text-slate-700 mt-2 space-y-0.5 border-t border-slate-300 pt-1">
              <div>* pilih salah satu (√).</div>
              <div>** Khusus tugas kerja yang bersifat ekstern Perusahaan tanpa dilengkapi Surat Tugas dari atasan.</div>
              <div>*** Jika salah satu dari cecklok masuk / pulang tidak terdeteksi di mesin absen sidik jari.</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="no-print border-t border-slate-300 bg-white px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>* Formulir siap dicetak langsung atau disimpan sebagai PDF</span>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
