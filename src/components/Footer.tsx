import React from 'react';
import { BookOpen, MapPin, UserCheck, ShieldCheck, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-emerald-100 text-neutral-600 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Identitas Madrasah */}
          <div>
            <div className="flex items-center space-x-2.5 text-[#116B3A] font-extrabold text-lg mb-2">
              <BookOpen className="w-6 h-6 text-[#16834A]" />
              <span>LMS MIN 1 PASER</span>
            </div>
            <p className="text-sm text-neutral-600 mb-3">
              Platform Manajemen Pembelajaran Digital Terpadu Madrasah Ibtidaiyah Kelas VI Fase C.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-neutral-500">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>MIN 1 Paser, Kabupaten Paser, Kalimantan Timur</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-neutral-500 mt-1">
              <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Zona Waktu: Asia/Makassar (WITA)</span>
            </div>
          </div>

          {/* Pengelola & Pimpinan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3 border-b pb-1">
              Pimpinan & Pengelola
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li className="flex items-start space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-800">Kepala Madrasah:</span>
                  <p>Ismail, S.Ag.</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-800">Guru / Pengembang:</span>
                  <p>Dzakirul Husni, S.Pd.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Cakupan Kelas & Status Sistem */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3 border-b pb-1">
              Cakupan Pembelajaran Kelas VI
            </h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['Kelas 6-A', 'Kelas 6-B', 'Kelas 6-C', 'Kelas 6-D', 'Kelas 6-E'].map((cls) => (
                <span
                  key={cls}
                  className="bg-[#E9F5EC] text-[#116B3A] text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200"
                >
                  {cls}
                </span>
              ))}
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Memenuhi standar Kurikulum Merdeka Fase C. Terintegrasi dengan sistem keamanan HMAC-SHA-256 dan Google Apps Script.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-100 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} LMS MIN 1 Paser. Seluruh hak cipta dilindungi.</p>
          <p className="mt-2 sm:mt-0 font-medium text-emerald-800">
            Fase 1: Fondasi Pembelajaran Terpadu & Impor Data Siswa
          </p>
        </div>
      </div>
    </footer>
  );
};
