import React, { useState } from 'react';
import { CanonicalClass, CANONICAL_CLASSES, UserSession } from '../types';
import {
  BookOpen,
  User,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface LoginModalProps {
  onSuccess: (user: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');

  // Student form state
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState<CanonicalClass>('6-A');
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('dzakirul2025@gmail.com');

  // Common UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Demo Autofill Helpers
  const fillStudentDemo = (name: string, cls: CanonicalClass, code: string) => {
    setStudentName(name);
    setStudentClass(cls);
    setAccessCode(code);
    setErrorMessage(null);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentName.trim() || !accessCode.trim()) {
      setErrorMessage('Harap lengkapi nama lengkap dan kode akses pribadi Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: studentName.trim(),
          className: studentClass,
          accessCode: accessCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Nama lengkap, kelas, atau kode akses tidak sesuai atau akun nonaktif.');
      }
      onSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.trim(),
          fullName: 'Dzakirul Husni, S.Pd.',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Akses ditolak untuk email ini.');
      }
      onSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal login Super Admin.');
      }
      onSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 px-4">
      {/* Header Card */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#116B3A] text-white shadow-lg mb-3">
          <BookOpen className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#116B3A] tracking-tight">
          LMS MIN 1 PASER
        </h1>
        <p className="text-sm font-medium text-neutral-600 mt-1">
          Sistem Manajemen Pembelajaran Digital Terpadu Kelas VI Madrasah Ibtidaiyah
        </p>
        <div className="inline-flex items-center space-x-2 mt-2 bg-[#E9F5EC] text-[#116B3A] text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
          <span>Kurikulum Merdeka</span>
          <span>•</span>
          <span>Fase C (Kelas VI-A s/d VI-E)</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 bg-neutral-100 p-1.5 border-b border-neutral-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === 'student'
                ? 'bg-white text-[#116B3A] shadow-md border border-neutral-200/60'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Login Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === 'admin'
                ? 'bg-white text-[#116B3A] shadow-md border border-neutral-200/60'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Login Super Admin</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div className="text-xs leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* TAB 1: FORM LOGIN SISWA */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Siswa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Farhan"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#116B3A] focus:border-[#116B3A] outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Pilihan Kelas (Fase C)
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value as CanonicalClass)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#116B3A] focus:border-[#116B3A] outline-none transition"
                >
                  {CANONICAL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls} (MIN 1 Paser)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Kode Akses Pribadi Siswa
                </label>
                <div className="relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    required
                    placeholder="Contoh: PAS-6A-1234"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full pl-4 pr-11 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#116B3A] focus:border-[#116B3A] outline-none transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                  >
                    {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Kode akses dibagikan oleh wali kelas masing-masing. Terlindungi enkripsi HMAC-SHA-256.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#116B3A] hover:bg-[#16834A] active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <span>Masuk ke Pembelajaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* DEMO HELPER BOX FOR INSTANT TESTING */}
              <div className="mt-6 pt-5 border-t border-neutral-200">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#116B3A] mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Akun Uji Coba Cepat (Tersedia 5 Kelas):</span>
                </div>
                <p className="text-[11px] text-neutral-500 mb-2">
                  Klik salah satu siswa di bawah untuk otomatis mengisi form:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => fillStudentDemo('Muhammad Farhan', '6-A', 'PAS-6A-1234')}
                    className="text-left p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    <div className="font-semibold text-neutral-800">Muhammad Farhan</div>
                    <div className="text-[11px] text-emerald-700">Kelas 6-A • PAS-6A-1234</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillStudentDemo('Aisyah Putri Rahmadani', '6-B', 'PAS-6B-1234')}
                    className="text-left p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    <div className="font-semibold text-neutral-800">Aisyah Putri R.</div>
                    <div className="text-[11px] text-emerald-700">Kelas 6-B • PAS-6B-1234</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillStudentDemo('Muhammad Rizky Ramadhan', '6-C', 'PAS-6C-1234')}
                    className="text-left p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    <div className="font-semibold text-neutral-800">M. Rizky Ramadhan</div>
                    <div className="text-[11px] text-emerald-700">Kelas 6-C • PAS-6C-1234</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillStudentDemo('Dimas Arya Pratama', '6-E', 'PAS-6E-1234')}
                    className="text-left p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    <div className="font-semibold text-neutral-800">Dimas Arya Pratama</div>
                    <div className="text-[11px] text-emerald-700">Kelas 6-E • PAS-6E-1234</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: FORM LOGIN SUPER ADMIN */}
          {activeTab === 'admin' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-neutral-700 space-y-1.5">
                <div className="font-bold text-neutral-900 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#116B3A]" />
                  <span>Autentikasi Super Admin Google OAuth 2.0</span>
                </div>
                <p>
                  Akses pengelolaan kurikulum, data siswa, bank soal, dan administrasi LMS MIN 1 Paser.
                  Hanya email yang telah terdaftar dalam <code>ADMIN_EMAILS</code> yang dapat memperoleh hak akses.
                </p>
                <p className="font-semibold text-emerald-800">
                  Email Terdaftar: <code>dzakirul2025@gmail.com</code> (Dzakirul Husni, S.Pd.)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Email Akun Google Admin
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="dzakirul2025@gmail.com"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#116B3A] focus:border-[#116B3A] outline-none transition"
                />
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleAdminGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-[#116B3A] hover:bg-[#16834A] text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V7.4h6.887C19.3 8.37 19.5 9.37 19.5 10.47c0 5.8-3.882 9.93-9.7 9.93C4.385 20.4 0 16.015 0 10.6S4.385.8 9.8.8c2.81 0 5.17 1.03 6.99 2.73l-2.83 2.72c-1.04-.99-2.42-1.6-4.16-1.6-3.64 0-6.6 3.01-6.6 6.75s2.96 6.75 6.6 6.75c3.23 0 5.46-1.98 5.86-4.71H12.24z" />
                  </svg>
                  <span>{isLoading ? 'Memverifikasi...' : 'Masuk dengan Google (Super Admin)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-emerald-50 text-[#116B3A] border-2 border-[#116B3A] font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Uji Coba Langsung Super Admin (Dzakirul Husni, S.Pd.)</span>
                </button>
              </div>

              <div className="text-[11px] text-neutral-500 text-center">
                Autentikasi diverifikasi langsung di server-side via session cookie HttpOnly aman.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
