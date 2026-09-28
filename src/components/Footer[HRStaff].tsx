/**
 * Footer[HRStaff].tsx
 * Footer Web App & PDF Export Footer sesuai Ketentuan Resmi Divisi Produksi I
 * Developed by Lalu Mahendra
 */

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <>
      {/* Footer Khusus Tampilan Layar Web App */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs font-medium text-slate-500 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <span className="font-semibold text-slate-700">HR Staff System All Rights Reserved</span>
          <span className="hidden sm:inline">•</span>
          <span>Divisi Produksi I</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-slate-600 font-medium">Developed by Lalu Mahendra</span>
        </div>
      </footer>

      {/* Footer Khusus Seluruh Hasil Export .PDF (Ketentuan Tambahan #1) */}
      <div className="pdf-print-footer">
        Divisi Produksi I - All Rights Reserved
      </div>
    </>
  );
};
