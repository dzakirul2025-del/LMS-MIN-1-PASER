import React from 'react';
import { UserSession } from '../types';
import { BookOpen, LogOut, User, ShieldCheck, Database, Clock } from 'lucide-react';

interface NavbarProps {
  user: UserSession | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dbStatus?: {
    isConfigured: boolean;
    statusText: string;
    mode: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  dbStatus,
}) => {
  return (
    <header className="bg-[#116B3A] text-white shadow-md sticky top-0 z-40 border-b border-[#0e5830]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identitas Resmi Madrasah */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 rounded-xl bg-white text-[#116B3A] flex items-center justify-center font-bold text-xl shadow-inner border border-emerald-100 flex-shrink-0">
              <BookOpen className="w-7 h-7 text-[#116B3A]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight">LMS MIN 1 PASER</span>
                <span className="bg-[#16834A] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/40">
                  Fase C
                </span>
              </div>
              <p className="text-xs text-emerald-100 hidden sm:block">
                Platform Manajemen Pembelajaran Digital Terpadu Kelas VI MI
              </p>
              <p className="text-[10px] text-emerald-200 sm:hidden">
                MIN 1 Paser - Kelas VI
              </p>
            </div>
          </div>

          {/* User info & Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Status Database Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/50">
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-emerald-200">
                {dbStatus?.isConfigured ? 'Google Sheets Aktif' : 'Penyimpanan Lokal Persisten'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* WITA Timezone badge */}
            <div className="hidden md:flex items-center space-x-1 text-xs text-emerald-100 bg-emerald-800/40 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>WITA</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-white flex items-center justify-end space-x-1">
                    {user.role === 'superadmin' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-300 inline" />
                    ) : (
                      <User className="w-4 h-4 text-emerald-300 inline" />
                    )}
                    <span>{user.fullName}</span>
                  </div>
                  <div className="text-xs text-emerald-200">
                    {user.role === 'superadmin' ? 'Super Admin / Pengelola' : `Siswa Kelas ${user.className}`}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar dari akun"
                  className="flex items-center space-x-1.5 bg-[#16834A] hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg border border-emerald-500/40 transition shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Secondary Navigation Bar (For Admin) */}
        {user?.role === 'superadmin' && (
          <nav className="flex space-x-1 sm:space-x-4 border-t border-emerald-800/50 py-2 overflow-x-auto scrollbar-none text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#116B3A] shadow-sm font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Dashboard Analitik
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                activeTab === 'students'
                  ? 'bg-white text-[#116B3A] shadow-sm font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Pengaturan Kelas 6 & Siswa
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                activeTab === 'materials'
                  ? 'bg-white text-[#116B3A] shadow-sm font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Perangkat Ajar & Mapel
            </button>
            <button
              onClick={() => setActiveTab('google')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                activeTab === 'google'
                  ? 'bg-white text-[#116B3A] shadow-sm font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Integrasi Google Sheets & Drive
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'bg-white text-[#116B3A] shadow-sm font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Log Aktivitas
            </button>
          </nav>
        )}

        {/* Secondary Navigation Bar (For Student) */}
        {user?.role === 'student' && (
          <nav className="flex space-x-1 sm:space-x-4 border-t border-emerald-800/50 py-2 overflow-x-auto scrollbar-none text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#116B3A] shadow-sm font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Beranda Siswa
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                activeTab === 'materials'
                  ? 'bg-white text-[#116B3A] shadow-sm font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Materi & Bahan Ajar
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                activeTab === 'assignments'
                  ? 'bg-white text-[#116B3A] shadow-sm font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Tugas Mandiri & LKPD
            </button>
            <button
              onClick={() => setActiveTab('cbt')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                activeTab === 'cbt'
                  ? 'bg-white text-[#116B3A] shadow-sm font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Latihan Asesmen CBT
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
