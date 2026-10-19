import React, { useState } from 'react';
import { DatabaseStatus } from '../types';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FolderTree,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface GoogleIntegrationModalProps {
  dbStatus: DatabaseStatus | null;
}

export const GoogleIntegrationModal: React.FC<GoogleIntegrationModalProps> = ({ dbStatus }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleCopyCode = () => {
    // We can fetch or have the GAS snippet ready
    navigator.clipboard.writeText(`// Salin file gas/Code.gs dari repositori LMS MIN 1 Paser`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/database-status');
      const data = await res.json();
      if (data.isConfigured) {
        setTestResult('Koneksi Google Apps Script terverifikasi aktif dan tersambung!');
      } else {
        setTestResult(
          'Status: Penyimpanan Lokal Persisten Aktif. Variabel GAS_WEB_APP_URL belum diatur di file .env / environment server.'
        );
      }
    } catch (e: any) {
      setTestResult('Gagal menghubungi backend: ' + e.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
            <Database className="w-6 h-6 text-[#116B3A]" />
            <span>Integrasi Google Sheets & Google Drive</span>
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Konfigurasi database utama Google Sheets (17 Sheets) dan penyimpanan media Google Drive LMS MIN 1 Paser.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isTesting}
          className="bg-[#116B3A] hover:bg-[#16834A] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-2 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>{isTesting ? 'Menguji...' : 'Uji Koneksi Server'}</span>
        </button>
      </div>

      {testResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>{testResult}</div>
        </div>
      )}

      {/* Status Card */}
      <div className={`p-6 rounded-2xl border ${
        dbStatus?.isConfigured
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-amber-50/70 border-amber-200'
      }`}>
        <div className="flex items-start space-x-3">
          {dbStatus?.isConfigured ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          )}
          <div>
            <h3 className="font-bold text-base text-neutral-900">
              {dbStatus?.isConfigured
                ? 'TERHUBUNG KE GOOGLE APPS SCRIPT WEB APP'
                : 'STATUS: BELUM DIKONFIGURASI (MODE PENYIMPANAN PERSISTEN LOKAL AKTIF)'}
            </h3>
            <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
              {dbStatus?.isConfigured
                ? 'Database tersinkronisasi langsung dengan spreadsheet Google Sheets Anda.'
                : 'Aplikasi beroperasi normal menggunakan penyimpanan persisten server lokal. Seluruh fitur (login, impor Excel, manajemen siswa) dapat diuji 100%. Untuk menghubungkan dengan Google Sheets Anda, ikuti 4 langkah di bawah ini.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Panduan Langkah Integrasi */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 space-y-6">
        <h3 className="font-bold text-base text-neutral-900 flex items-center space-x-2">
          <FileCode className="w-5 h-5 text-[#116B3A]" />
          <span>Panduan Pengaturan Google Apps Script untuk Guru / Pengelola</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Langkah 1 */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-neutral-900">
              <span className="w-6 h-6 rounded-full bg-[#116B3A] text-white flex items-center justify-center text-xs">1</span>
              <span>Buat Spreadsheet Google Sheets</span>
            </div>
            <p className="text-neutral-600">
              Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-[#116B3A] font-semibold underline">sheets.new</a> dan beri nama:
            </p>
            <div className="p-2 bg-white rounded border font-mono text-[11px] font-bold text-neutral-800">
              DATABASE LMS MIN 1 PASER KELAS VI
            </div>
          </div>

          {/* Langkah 2 */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-neutral-900">
              <span className="w-6 h-6 rounded-full bg-[#116B3A] text-white flex items-center justify-center text-xs">2</span>
              <span>Salin Skrip ke Extensions &gt; Apps Script</span>
            </div>
            <p className="text-neutral-600">
              Di spreadsheet, buka menu <strong>Ekstensi &gt; Apps Script</strong>. Tempel kode dari berkas <code>gas/Code.gs</code>.
            </p>
            <p className="text-neutral-500 text-[11px]">
              Skrip memiliki fungsi <code>setupDatabase()</code> yang secara otomatis membuat 17 Sheet dengan header hijau resmi.
            </p>
          </div>

          {/* Langkah 3 */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-neutral-900">
              <span className="w-6 h-6 rounded-full bg-[#116B3A] text-white flex items-center justify-center text-xs">3</span>
              <span>Atur Script Properties</span>
            </div>
            <p className="text-neutral-600">
              Di Apps Script, buka <strong>Project Settings (Ikon Gerigi) &gt; Script Properties</strong>, tambahkan:
            </p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-neutral-700">
              <li><code>LMS_API_SECRET</code>: (kunci rahasia server)</li>
              <li><code>SPREADSHEET_ID</code>: (ID spreadsheet Anda)</li>
            </ul>
          </div>

          {/* Langkah 4 */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-neutral-900">
              <span className="w-6 h-6 rounded-full bg-[#116B3A] text-white flex items-center justify-center text-xs">4</span>
              <span>Deploy sebagai Web App</span>
            </div>
            <p className="text-neutral-600">
              Klik <strong>Deploy &gt; New Deployment &gt; Web app</strong>.
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-neutral-600 text-[11px]">
              <li>Execute as: <strong>Me (Akun Google Anda)</strong></li>
              <li>Who has access: <strong>Anyone</strong></li>
            </ul>
            <p className="text-neutral-600 mt-1">
              Salin URL Web App dan masukkan ke <code>GAS_WEB_APP_URL</code> di file .env server.
            </p>
          </div>
        </div>
      </div>

      {/* Struktur Google Drive */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 space-y-4">
        <h3 className="font-bold text-base text-neutral-900 flex items-center space-x-2">
          <FolderTree className="w-5 h-5 text-[#116B3A]" />
          <span>Struktur Folder Resmi Google Drive (Bagian 9)</span>
        </h3>
        <p className="text-xs text-neutral-600">
          Folder Google Drive untuk berkas dokumen dan media pembelajaran digital Kelas VI MIN 1 Paser:
        </p>

        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-800 space-y-1.5">
          <div className="font-bold text-[#116B3A]">📁 LMS MIN 1 PASER/</div>
          <div className="pl-5 text-neutral-700">├── 📁 01_PERANGKAT_PEMBELAJARAN (CP, TP, ATP, Modul Ajar)</div>
          <div className="pl-5 text-neutral-700">├── 📁 02_MATERI_BAHAN_AJAR (Buku & Modul Digital)</div>
          <div className="pl-5 text-neutral-700">├── 📁 03_LKPD_TUGAS (Lembar Kerja Peserta Didik)</div>
          <div className="pl-5 text-neutral-700">├── 📁 04_MEDIA_INTERAKTIF (Audio, Video, Media MPI)</div>
          <div className="pl-5 text-neutral-700">├── 📁 05_ASESMEN_INSTRUMEN (Kisi-kisi & Soal)</div>
          <div className="pl-5 text-neutral-700">├── 📁 06_LAPORAN (Rekap Nilai & Analisis)</div>
          <div className="pl-5 text-neutral-700">└── 📁 07_CADANGAN (Backup Database & Arsip)</div>
        </div>
      </div>

      {/* Daftar 17 Sheet Database */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
        <h3 className="font-bold text-base text-neutral-900 mb-3">
          17 Tabel Google Sheets Kanonis (Bagian 8)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
          {dbStatus?.sheetsList.map((name, i) => (
            <div
              key={name}
              className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center space-x-2"
            >
              <span className="w-5 h-5 rounded-full bg-white text-[#116B3A] text-[10px] font-bold flex items-center justify-center shadow-xs">
                {i + 1}
              </span>
              <span className="font-semibold text-neutral-800 truncate">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
