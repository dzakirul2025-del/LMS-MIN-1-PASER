import React, { useState, useEffect } from 'react';
import { DatabaseStatus, ActivityLog, CanonicalClass, CANONICAL_CLASSES } from '../types';
import {
  Users,
  BookOpen,
  FileText,
  Database,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react';
import { safeApiFetch } from '../lib/api';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashJson, statusJson, logsJson] = await Promise.all([
          safeApiFetch('/api/dashboard'),
          safeApiFetch('/api/admin/database-status'),
          safeApiFetch('/api/admin/logs'),
        ]);

        if (dashJson && dashJson.success) setDashboardData(dashJson);
        if (statusJson && statusJson.isConfigured !== undefined) setDbStatus(statusJson);
        if (logsJson && logsJson.success && Array.isArray(logsJson.logs)) setLogs(logsJson.logs);
      } catch (err) {
        console.warn('Gagal mengambil data dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const classDistribution = dashboardData?.stats?.classDistribution || {
    '6-A': 0,
    '6-B': 0,
    '6-C': 0,
    '6-D': 0,
    '6-E': 0,
  };

  const totalActiveStudents = dashboardData?.stats?.activeStudents || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#116B3A] via-[#16834A] to-emerald-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-950/40 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Portal Super Admin & Pengelola Madrasah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, Bapak Dzakirul Husni, S.Pd.
          </h1>
          <p className="text-sm text-emerald-100 mt-2 leading-relaxed">
            Sistem Manajemen Pembelajaran Digital Terpadu Kelas VI Madrasah Ibtidaiyah Negeri 1 Paser.
            Fondasi FASE 1 telah aktif dan siap digunakan untuk manajemen kelas, siswa, dan perangkat pembelajaran.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab('students')}
              className="bg-white text-[#116B3A] hover:bg-emerald-50 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Atur Kelas 6 & Siswa</span>
            </button>
            <button
              onClick={() => onNavigateTab('google')}
              className="bg-emerald-900/60 hover:bg-emerald-900 text-white border border-emerald-400/40 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm transition flex items-center space-x-2"
            >
              <Database className="w-4 h-4 text-emerald-300" />
              <span>Pengaturan Google Sheets</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
          <BookOpen className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Siswa Aktif */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-500">Siswa Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#116B3A] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 mt-2">
            {totalActiveStudents} <span className="text-xs font-normal text-neutral-500">siswa</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Tersebar di Kelas 6-A s/d 6-E
          </div>
        </div>

        {/* Mata Pelajaran */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-500">Mata Pelajaran</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 mt-2">
            11 <span className="text-xs font-normal text-neutral-500">mapel</span>
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            Fase C (Umum, PAI & Mulok)
          </div>
        </div>

        {/* Perangkat & Materi */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-500">Materi Terbit</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 mt-2">
            {dashboardData?.stats?.totalMaterials || 3} <span className="text-xs font-normal text-neutral-500">modul</span>
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            Siap diakses siswa
          </div>
        </div>

        {/* Database Mode */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-500">Status Database</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              dbStatus?.isConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="text-sm font-bold text-neutral-900 mt-2 truncate">
            {dbStatus?.isConfigured ? 'Google Sheets' : 'Lokal Persisten'}
          </div>
          <div className={`text-[11px] font-semibold mt-1 flex items-center space-x-1 ${
            dbStatus?.isConfigured ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              dbStatus?.isConfigured ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></span>
            <span>{dbStatus?.isConfigured ? 'Sinkron Cloud' : 'Penyimpanan Aktif'}</span>
          </div>
        </div>
      </div>

      {/* Row: Distribusi Kelas & Status Integrasi Google */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribusi Kelas VI (2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#116B3A]" />
              <h3 className="font-bold text-base text-neutral-900">
                Penataan & Distribusi Siswa Khusus Kelas 6 (Fase C)
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Khusus 5 Rombel (6-A s/d 6-E)
            </span>
          </div>
          <p className="text-xs text-neutral-500 mb-4">
            Siswa hanya dapat masuk ke LMS setelah kelasnya diatur secara manual oleh Super Admin.
          </p>

          <div className="space-y-3.5">
            {CANONICAL_CLASSES.map((cls) => {
              const count = classDistribution[cls] || 0;
              const maxScale = Math.max(...Object.values(classDistribution).map(Number), 10);
              const percentage = Math.min(Math.round((count / maxScale) * 100), 100);

              return (
                <div key={cls} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-neutral-800">Kelas {cls}</span>
                    <span className="font-semibold text-neutral-600">{count} Siswa Terdaftar</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#116B3A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">
              Format kelas kanonis: <strong>6-A, 6-B, 6-C, 6-D, 6-E</strong>.
            </span>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-[#116B3A] font-bold hover:underline flex items-center space-x-1"
            >
              <span>Buka Data Siswa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Panel Integrasi Google Sheets (1 Kolom) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Database className="w-5 h-5 text-[#116B3A]" />
              <h3 className="font-bold text-base text-neutral-900">Status Google Sheets</h3>
            </div>

            <div className={`p-4 rounded-xl text-xs mb-4 ${
              dbStatus?.isConfigured
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border border-amber-200 text-amber-900'
            }`}>
              <div className="font-bold flex items-center space-x-1.5 mb-1">
                {dbStatus?.isConfigured ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {dbStatus?.isConfigured
                    ? 'Koneksi Cloud Terhubung'
                    : 'Penyimpanan Lokal Aktif (GAS Belum Dikonfigurasi)'}
                </span>
              </div>
              <p className="leading-relaxed">
                {dbStatus?.isConfigured
                  ? 'Aplikasi telah berhasil tersambung ke Google Apps Script Web App.'
                  : 'Aplikasi berjalan lancar menggunakan penyimpanan lokal yang persisten. Ikuti panduan untuk menghubungkan Google Sheets.'}
              </p>
            </div>

            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span>Total 17 Sheets:</span>
                <span className="font-bold text-neutral-800">Tersedia</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span>Zona Waktu:</span>
                <span className="font-bold text-neutral-800">Asia/Makassar (WITA)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span>Google Apps Script:</span>
                <span className="font-bold text-neutral-800">
                  {dbStatus?.isConfigured ? 'Terverifikasi' : 'Belum Terhubung'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('google')}
            className="w-full mt-6 bg-[#E9F5EC] hover:bg-emerald-100 text-[#116B3A] font-bold py-2.5 rounded-xl text-xs border border-emerald-300 transition flex items-center justify-center space-x-2"
          >
            <span>Buka Panduan & Script Google</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Aktivitas Terbaru */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#116B3A]" />
            <h3 className="font-bold text-base text-neutral-900">
              Log Aktivitas Sistem & Pengguna
            </h3>
          </div>
          <span className="text-xs text-neutral-500">Mencatat aktivitas autentikasi & pengelolaan data</span>
        </div>

        <div className="divide-y divide-neutral-100 text-xs">
          {logs.slice(0, 6).map((log) => (
            <div key={log.logId} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-900">{log.action}</span>
                <span className="text-neutral-500 mx-1.5">•</span>
                <span className="text-neutral-700 font-medium">{log.actorName}</span>
                {log.details && (
                  <span className="text-neutral-500 block text-[11px] mt-0.5">
                    {log.details}
                  </span>
                )}
              </div>
              <div className="text-right text-neutral-400 font-mono text-[11px]">
                {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })} WITA
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
