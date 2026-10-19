import React from 'react';
import { UserSession } from '../types';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface StudentDashboardProps {
  user: UserSession;
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Student Welcome Card */}
      <div className="bg-gradient-to-r from-[#116B3A] to-[#16834A] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-900/50 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30 mb-3">
            <GraduationCap className="w-4 h-4 text-emerald-300" />
            <span>Portal Siswa Kelas {user.className} • Fase C</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Assalamu’alaikum, {user.fullName}!
          </h1>
          <p className="text-sm text-emerald-100 mt-2 leading-relaxed">
            Selamat datang di Platform Pembelajaran Digital Terpadu MIN 1 Paser.
            Silakan akses materi ajar, kerjakan tugas mandiri, dan ikuti latihan Computer-Based Test (CBT) di bawah.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab('materials')}
              className="bg-white text-[#116B3A] hover:bg-emerald-50 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center space-x-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Buka Materi Ajar</span>
            </button>
            <button
              onClick={() => onNavigateTab('assignments')}
              className="bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-400/40 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm transition flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>Lihat Tugas Mandiri</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-6 translate-y-6">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Info Pengajar & Madrasah Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#116B3A] flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="text-neutral-500 font-medium">Guru & Pengelola Kelas VI:</span>
            <div className="font-bold text-neutral-900 text-sm">Dzakirul Husni, S.Pd.</div>
            <div className="text-emerald-700 font-semibold">MIN 1 Paser</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#116B3A] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="text-neutral-500 font-medium">Kepala Madrasah:</span>
            <div className="font-bold text-neutral-900 text-sm">Ismail, S.Ag.</div>
            <div className="text-neutral-600">Kabupaten Paser, Kalimantan Timur</div>
          </div>
        </div>
      </div>

      {/* 3 Shortcut Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Materi */}
        <div
          onClick={() => onNavigateTab('materials')}
          className="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-[#116B3A] hover:shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">Materi & Modul Digital</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Pelajari bahan ajar Matematika, IPAS, Bahasa Indonesia, dan PAI secara mandiri.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#116B3A]">
            <span>Pelajari Materi</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card Tugas */}
        <div
          onClick={() => onNavigateTab('assignments')}
          className="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-[#116B3A] hover:shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">Tugas Mandiri & LKPD</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Kirimkan jawaban tugas harian dan pantau batas waktu pengumpulan tugas.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#116B3A]">
            <span>Lihat Tugas</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card CBT */}
        <div
          onClick={() => onNavigateTab('cbt')}
          className="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-[#116B3A] hover:shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#116B3A] flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900">Latihan Asesmen CBT</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Uji pemahamanmu dengan Computer-Based Test interaktif dan penilaian langsung.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#116B3A]">
            <span>Mulai Latihan CBT</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
