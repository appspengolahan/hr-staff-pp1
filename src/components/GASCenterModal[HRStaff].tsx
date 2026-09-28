/**
 * GASCenterModal[HRStaff].tsx
 * Modal Pengaturan Endpoint Headless GAS, Payload Testing, & Cache Control Engine
 * Divisi Produksi I — PT Batu Karang
 * Developed by Lalu Mahendra
 */

import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  FileJson,
  HardDrive,
  RefreshCw,
  Send,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { DEFAULT_GAS_ENDPOINT, gasStore } from '../gasService[HRStaff]';

interface GASCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const GASCenterModal: React.FC<GASCenterModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const [url, setUrl] = useState<string>(gasStore.getEndpointUrl());
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success?: boolean;
    latencyMs?: number;
    message?: string;
  }>({ tested: false });
  const [isTesting, setIsTesting] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullResult, setPullResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [jsonViewerOpen, setJsonViewerOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const staffCount = gasStore.getStaffList().length;
  const presensiCount = gasStore.getPresensiList().length;
  const lemburCount = gasStore.getLemburList().length;
  const calonCount = gasStore.getCalonList().length;

  const handleSaveUrl = async () => {
    gasStore.setEndpointUrl(url);
    setIsPulling(true);
    const result = await gasStore.pullDataFromGAS();
    setIsPulling(false);
    if (result.success) {
      onDataChanged();
      alert(`Endpoint URL disimpan & berhasil menarik ${result.counts?.staff || 0} data staff asli!`);
    } else {
      alert('Endpoint URL berhasil disimpan.');
    }
  };

  const handleResetUrl = () => {
    setUrl(DEFAULT_GAS_ENDPOINT);
    gasStore.setEndpointUrl(DEFAULT_GAS_ENDPOINT);
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setPullResult(null);
    const result = await gasStore.testGASConnection();
    setIsTesting(false);
    setTestResult({
      tested: true,
      success: result.success,
      latencyMs: result.latencyMs,
      message: result.message,
    });

    if (result.success) {
      setIsPulling(true);
      const pullRes = await gasStore.pullDataFromGAS();
      setIsPulling(false);
      setPullResult({
        success: pullRes.success,
        message: pullRes.message,
      });
      if (pullRes.success) {
        onDataChanged();
      }
    }
  };

  const handlePullData = async () => {
    setIsPulling(true);
    setPullResult(null);
    const result = await gasStore.pullDataFromGAS();
    setIsPulling(false);
    setPullResult({
      success: result.success,
      message: result.message,
    });
    if (result.success) {
      onDataChanged();
    }
  };

  const handleExportJSON = () => {
    const dataStr = gasStore.exportCacheJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `HR_Staff_Backup_Divisi_Produksi_I_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleViewJSON = () => {
    setJsonContent(gasStore.exportCacheJSON());
    setJsonViewerOpen(true);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = gasStore.importCacheJSON(content);
      if (ok) {
        setImportNotice('Data JSON berhasil diimport ke sistem lokal!');
        onDataChanged();
      } else {
        setImportNotice('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDatabase = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh cache database lokal kembali ke bawaan pabrik?')) {
      gasStore.resetToDefaults();
      onDataChanged();
      alert('Database lokal berhasil direset.');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Headless GAS Center</h2>
              <p className="text-xs text-slate-500">Koneksi REST Web App & Offline-First Cache Engine</p>
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
          {/* Architecture info banner */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
            <Zap className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-950">Arsitektur Offline-First (0.01 detik load)</p>
              <p className="text-emerald-800 leading-relaxed">
                Aplikasi langsung membaca dari cache multi-layer <code>localStorage</code> super cepat tanpa menunggu
                koneksi internet, lalu menyinkronkan data secara silent di latar belakang ke Google Apps Script Web App.
              </p>
            </div>
          </div>

          {/* Endpoint URL Configuration */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              URL Endpoint Web App (doGet / doPost)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-100"
                />
              </div>
              <button
                onClick={copyUrl}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
                title="Salin URL"
                type="button"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleSaveUrl}
                className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
                type="button"
              >
                Simpan URL
              </button>
              <button
                onClick={handleResetUrl}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                type="button"
              >
                Reset Default
              </button>
              <button
                onClick={handleTestPing}
                disabled={isTesting}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors disabled:opacity-60"
                type="button"
              >
                <Send className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji...' : 'Uji Ping Koneksi'}</span>
              </button>
              <button
                onClick={handlePullData}
                disabled={isPulling}
                className="rounded-lg border border-emerald-300 bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
                type="button"
                title="Tarik seluruh data nama staff, presensi, dan lembur dari Google Spreadsheet asli"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPulling ? 'animate-spin' : ''}`} />
                <span>{isPulling ? 'Menarik Data...' : 'Tarik Data Asli Spreadsheet'}</span>
              </button>
            </div>

            {pullResult && (
              <div
                className={`mt-2 rounded-xl p-3 text-xs border ${
                  pullResult.success
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{pullResult.success ? 'Sinkronisasi Data Berhasil' : 'Sinkronisasi Gagal'}</span>
                </div>
                <p className="text-[11px] opacity-90">{pullResult.message}</p>
              </div>
            )}

            {testResult.tested && (
              <div
                className={`mt-2 rounded-xl p-3 text-xs border ${
                  testResult.success
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-0.5">
                  <span>{testResult.success ? 'Status: Terhubung (200 OK)' : 'Status: Timeout / Error'}</span>
                  <span>{testResult.latencyMs} ms</span>
                </div>
                <p className="text-[11px] opacity-90">{testResult.message}</p>
              </div>
            )}
          </div>

          {/* Local Cache Metrics */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-slate-700" />
              Statistik Cache Lokal Saat Ini
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                <span className="block text-lg font-black text-slate-900">{staffCount}</span>
                <span className="text-[11px] text-slate-500">Master Staff</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                <span className="block text-lg font-black text-slate-900">{presensiCount}</span>
                <span className="text-[11px] text-slate-500">Log Presensi</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                <span className="block text-lg font-black text-slate-900">{lemburCount}</span>
                <span className="text-[11px] text-slate-500">Log Lembur</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                <span className="block text-lg font-black text-slate-900">{calonCount}</span>
                <span className="text-[11px] text-slate-500">Calon Karyawan</span>
              </div>
            </div>

            {/* Actions for Backup and Restore */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                type="button"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                Export Backup (JSON)
              </button>

              <button
                onClick={handleViewJSON}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                type="button"
              >
                <FileJson className="h-3.5 w-3.5 text-blue-600" />
                Lihat Raw JSON
              </button>

              <label className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer">
                <Upload className="h-3.5 w-3.5 text-emerald-600" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                onClick={handleResetDatabase}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 shadow-xs ml-auto"
                type="button"
              >
                Reset Database Bawaan
              </button>
            </div>

            {importNotice && (
              <p className="text-xs text-blue-600 font-semibold mt-1">{importNotice}</p>
            )}
          </div>

          {/* JSON Preview Modal / Toggle */}
          {jsonViewerOpen && (
            <div className="space-y-2 rounded-xl border border-slate-300 bg-slate-900 p-4 text-slate-200">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="font-mono text-emerald-400">payload_cache_preview.json</span>
                <button
                  onClick={() => setJsonViewerOpen(false)}
                  className="text-slate-400 hover:text-white"
                  type="button"
                >
                  Tutup
                </button>
              </div>
              <textarea
                readOnly
                value={jsonContent}
                rows={10}
                className="w-full rounded bg-transparent font-mono text-[11px] text-slate-300 focus:outline-none resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>PT Batu Karang • Divisi Produksi I</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition-colors"
            type="button"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
