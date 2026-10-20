import React, { useState, useEffect } from 'react';
import { Student, CanonicalClass, CANONICAL_CLASSES } from '../types';
import { ExcelImportModal } from './ExcelImportModal';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  KeyRound,
  Edit2,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  X,
  Loader2,
  ShieldCheck,
  Trash2,
  CheckSquare,
  Square,
  ArrowRightLeft,
  Eye,
  RefreshCw,
  FileText,
  Printer,
  Share2,
} from 'lucide-react';
import { safeApiFetch, getStoredToken } from '../lib/api';

export const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected students for batch action
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [batchTargetClass, setBatchTargetClass] = useState<CanonicalClass>('6-A');
  const [isBatchApplying, setIsBatchApplying] = useState(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentDetail, setStudentDetail] = useState<Student | null>(null);

  // Non-blocking in-app confirmation modals (replaces window.confirm)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [studentToReset, setStudentToReset] = useState<Student | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{
    studentName: string;
    studentClass: string;
    plainCode: string;
  } | null>(null);

  // New Student Form
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState<CanonicalClass>('6-A');
  const [newAbsen, setNewAbsen] = useState<string>('');
  const [newCreatedCode, setNewCreatedCode] = useState<string | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShareText, setCopiedShareText] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const fetchStudents = async (showLoadingSpinner: boolean = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass !== 'Semua') params.append('className', selectedClass);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const data = await safeApiFetch(`/api/admin/students?${params.toString()}`);
      if (data && data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (e: any) {
      console.warn('Gagal mengambil data siswa:', e.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents(true);
  }, [selectedClass, searchQuery]);

  // Class counts for all 5 canonical classes
  const classCounts = CANONICAL_CLASSES.reduce((acc, cls) => {
    acc[cls] = students.filter((s) => s.className === cls && s.status === 'aktif').length;
    return acc;
  }, {} as Record<CanonicalClass, number>);

  // Unduh Template Excel Resmi
  const handleDownloadTemplate = async () => {
    try {
      const token = getStoredToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/students/template', { headers });
      if (!res.ok) throw new Error('Gagal mengunduh template');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TEMPLATE_IMPOR_SISWA_MIN1PASER.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('success', 'Template Excel resmi berhasil diunduh.');
    } catch (e: any) {
      showToast('error', e.message || 'Gagal mengunduh template.');
    }
  };

  // Unduh Lembar Resmi Distribusi Kode Akses Seluruh Siswa
  const handleDownloadDistributionSheet = async () => {
    try {
      const token = getStoredToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/students/export-all-distribution', { headers });
      if (!res.ok) throw new Error('Gagal mengunduh lembar distribusi');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LEMBAR_DISTRIBUSI_KODE_AKSES_MIN1PASER.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('success', 'Lembar distribusi kode akses siswa (.xlsx) berhasil diunduh.');
    } catch (e: any) {
      showToast('error', e.message || 'Gagal mengunduh lembar distribusi.');
    }
  };

  // Submit Tambah Siswa Manual
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsAddingStudent(true);
    try {
      const data = await safeApiFetch('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify({
          fullName: newName.trim(),
          className: newClass,
          attendanceNumber: newAbsen ? Number(newAbsen) : undefined,
          status: 'aktif',
        }),
      });

      if (data && data.success) {
        setNewCreatedCode(data.plainAccessCode);
        showToast('success', `Siswa ${newName} berhasil ditambahkan ke Kelas ${newClass}.`);
        fetchStudents(false);
      } else {
        showToast('error', data?.error || 'Gagal menambahkan siswa.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menambahkan siswa.');
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Submit Edit Siswa
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const data = await safeApiFetch(`/api/admin/students/${editingStudent.userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: editingStudent.fullName,
          className: editingStudent.className,
          attendanceNumber: editingStudent.attendanceNumber,
          status: editingStudent.status,
        }),
      });

      if (data && data.success) {
        showToast('success', `Data siswa ${editingStudent.fullName} berhasil diperbarui.`);
        setEditingStudent(null);
        fetchStudents(false);
      } else {
        showToast('error', data?.error || 'Gagal memperbarui data siswa.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memperbarui data siswa.');
    }
  };

  // Quick In-Row Class Reassignment
  const handleQuickAssignClass = async (student: Student, newTargetClass: CanonicalClass) => {
    if (student.className === newTargetClass) return;

    try {
      const data = await safeApiFetch(`/api/admin/students/${student.userId}/assign-class`, {
        method: 'POST',
        body: JSON.stringify({ targetClass: newTargetClass }),
      });

      if (data && data.success) {
        showToast('success', `Siswa ${student.fullName} berhasil dipindahkan ke Kelas ${newTargetClass}.`);
        setStudents((prev) =>
          prev.map((s) => (s.userId === student.userId ? { ...s, className: newTargetClass } : s))
        );
      } else {
        showToast('error', data?.error || 'Gagal mengubah kelas.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Gagal mengubah kelas.');
    }
  };

  // Quick Status Toggle (Aktif <-> Nonaktif)
  const handleToggleStatus = async (student: Student) => {
    try {
      const data = await safeApiFetch(`/api/admin/students/${student.userId}/toggle-status`, {
        method: 'POST',
      });

      if (data && data.success) {
        const nextStatus = data.newStatus;
        showToast('success', `Status ${student.fullName} diubah menjadi ${nextStatus.toUpperCase()}.`);
        setStudents((prev) =>
          prev.map((s) => (s.userId === student.userId ? { ...s, status: nextStatus } : s))
        );
        if (studentDetail && studentDetail.userId === student.userId) {
          setStudentDetail({ ...studentDetail, status: nextStatus });
        }
      } else {
        showToast('error', data?.error || 'Gagal mengubah status siswa.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Gagal mengubah status siswa.');
    }
  };

  // Batch Class Reassignment
  const handleBatchAssign = async () => {
    if (selectedStudentIds.length === 0) {
      showToast('error', 'Pilih minimal satu siswa yang ingin dipindahkan.');
      return;
    }

    setIsBatchApplying(true);
    try {
      const data = await safeApiFetch('/api/admin/students/batch-assign-class', {
        method: 'POST',
        body: JSON.stringify({
          studentIds: selectedStudentIds,
          targetClass: batchTargetClass,
        }),
      });

      if (data && data.success) {
        showToast('success', `Berhasil memindahkan ${data.count} siswa ke Kelas ${batchTargetClass}.`);
        setSelectedStudentIds([]);
        fetchStudents(false);
      } else {
        showToast('error', data?.error || 'Gagal memindahkan siswa.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Gagal memindahkan siswa.');
    } finally {
      setIsBatchApplying(false);
    }
  };

  // Confirm Single Delete
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);

    try {
      const data = await safeApiFetch(`/api/admin/students/${studentToDelete.userId}`, {
        method: 'DELETE',
      });
      if (data && data.success) {
        showToast('success', `Data siswa ${studentToDelete.fullName} berhasil dihapus permanen.`);
        setSelectedStudentIds((prev) => prev.filter((id) => id !== studentToDelete.userId));
        if (studentDetail?.userId === studentToDelete.userId) {
          setStudentDetail(null);
        }
        setStudentToDelete(null);
        fetchStudents(false);
      } else {
        showToast('error', data?.error || 'Gagal menghapus siswa.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Gagal menghapus siswa.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm Batch Delete
  const handleConfirmBatchDelete = async () => {
    if (selectedStudentIds.length === 0) return;
    setIsBatchDeleting(true);

    try {
      const data = await safeApiFetch('/api/admin/students/batch-delete', {
        method: 'POST',
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      });

      if (data && data.success) {
        showToast('success', `Berhasil menghapus ${data.count} siswa terpilih secara permanen.`);
        setSelectedStudentIds([]);
        setIsBatchDeleteModalOpen(false);
        fetchStudents(false);
      } else {
        showToast('error', data?.error || 'Gagal menghapus masal siswa.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Gagal menghapus masal siswa.');
    } finally {
      setIsBatchDeleting(false);
    }
  };

  // Confirm Reset Access Code
  const handleConfirmReset = async () => {
    if (!studentToReset) return;
    setIsResetting(true);

    try {
      const data = await safeApiFetch(`/api/admin/students/${studentToReset.userId}/reset-access`, {
        method: 'POST',
      });
      if (data && data.success) {
        const studentName = studentToReset.fullName;
        const studentClass = studentToReset.className;
        const plainCode = data.newPlainAccessCode;

        setStudentToReset(null);
        setResetResult({
          studentName,
          studentClass,
          plainCode,
        });

        // Update local state if detail modal is open
        if (studentDetail?.userId === studentToReset.userId) {
          setStudentDetail({
            ...studentDetail,
            plainAccessCode: plainCode,
          });
        }

        showToast('success', `Kode akses untuk ${studentName} berhasil direset.`);
        fetchStudents(false);
      } else {
        showToast('error', data?.error || 'Gagal mereset kode akses.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Gagal mereset kode akses.');
    } finally {
      setIsResetting(false);
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === students.length && students.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.userId));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyShareText = (student: Student) => {
    const text = `Assalamu'alaikum Wr. Wb.
Informasi Akun LMS Madrasah MIN 1 Paser:
Nama Siswa: ${student.fullName}
Kelas: ${student.className} (Fase C)
Nomor Absen: ${student.attendanceNumber || '-'}
ID Pengguna: ${student.userId}
Kode Akses Pribadi: ${student.plainAccessCode || 'Hubungi Super Admin (Bpk. Dzakirul Husni, S.Pd.)'}

Gunakan informasi di atas untuk masuk ke LMS MIN 1 Paser pada menu Siswa. Simpan dengan baik dan jangan disebarkan kepada yang tidak berkepentingan.`;

    navigator.clipboard.writeText(text);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 2000);
    showToast('success', 'Teks informasi akun berhasil disalin untuk dibagikan.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-sm transition animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BANNER ATURAN KHUSUS KELAS 6 & TOMBOL AKSI UTAMA */}
      <div className="bg-gradient-to-r from-[#116B3A] via-[#16834A] to-emerald-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-emerald-700/50 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-950/50 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>MANAJEMEN RESMI DATA SISWA KELAS 6 MI</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Penataan & Manajemen Siswa Kelas 6 MIN 1 Paser
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-3xl leading-relaxed">
            Sesuai ketentuan baku madrasah, <strong>siswa tidak dapat mendaftar mandiri</strong>. Seluruh siswa Kelas 6 harus <strong>diatur dan diverifikasi oleh Super Admin</strong> (Bpk. Dzakirul Husni, S.Pd.) ke dalam kelas kanonis <strong>6-A, 6-B, 6-C, 6-D, atau 6-E</strong> sebelum dapat login dan mengikuti evaluasi CBT/LMS.
          </p>

          {/* Action Buttons Header - Fully Functional & Valid Data */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setNewCreatedCode(null);
                setNewName('');
                setNewAbsen('');
                setIsAddModalOpen(true);
              }}
              className="bg-white hover:bg-emerald-50 text-[#116B3A] text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-[#116B3A]" />
              <span>Tambah Siswa Manual</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="bg-emerald-800/90 hover:bg-emerald-800 text-white border border-emerald-400/40 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Impor Berkas Excel Siswa</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="bg-emerald-950/60 hover:bg-emerald-950 text-emerald-100 border border-emerald-400/20 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-2"
              title="Unduh format template Excel resmi untuk entri data massal"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Unduh Format Excel</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDistributionSheet}
              className="bg-emerald-950/60 hover:bg-emerald-950 text-emerald-100 border border-emerald-400/20 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-2"
              title="Unduh lembar distribusi kode akses resmi seluruh siswa untuk wali murid"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Lembar Distribusi Kode (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => fetchStudents(false)}
              disabled={isRefreshing}
              className="bg-emerald-950/40 hover:bg-emerald-950 text-emerald-200 border border-emerald-400/20 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5 ml-auto"
              title="Segarkan data tabel siswa sekarang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
              <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KARTU DISTRIBUSI KELAS (6-A s/d 6-E) DENGAN FILTER AKTIF */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {CANONICAL_CLASSES.map((cls) => {
          const count = classCounts[cls] || 0;
          const isSelected = selectedClass === cls;
          return (
            <div
              key={cls}
              onClick={() => setSelectedClass(cls === selectedClass ? 'Semua' : cls)}
              className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden select-none ${
                isSelected
                  ? 'bg-[#116B3A] text-white border-[#116B3A] shadow-md ring-2 ring-emerald-400'
                  : 'bg-white hover:bg-emerald-50/50 text-neutral-800 border-emerald-100 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-extrabold uppercase ${isSelected ? 'text-emerald-200' : 'text-neutral-500'}`}>
                  Kelas
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-[#116B3A]'}`}>
                  Fase C
                </span>
              </div>
              <div className="text-2xl font-black">{cls}</div>
              <div className={`text-xs mt-1 font-semibold ${isSelected ? 'text-emerald-100' : 'text-neutral-500'}`}>
                {count} Siswa Terdaftar
              </div>
            </div>
          );
        })}
      </div>

      {/* TOOLBAR AKSI MASAL (BATCH ASSIGN & BATCH DELETE) */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2 text-xs text-amber-900 font-bold">
            <CheckSquare className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>{selectedStudentIds.length} Siswa Terpilih</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-amber-900 font-medium">Atur Rombel ke:</span>
            <select
              value={batchTargetClass}
              onChange={(e) => setBatchTargetClass(e.target.value as CanonicalClass)}
              className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-amber-500"
            >
              {CANONICAL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleBatchAssign}
              disabled={isBatchApplying}
              className="bg-[#116B3A] hover:bg-[#16834A] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center space-x-1 disabled:opacity-50"
            >
              {isBatchApplying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowRightLeft className="w-3.5 h-3.5" />
              )}
              <span>Terapkan Pemindahan</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBatchDeleteModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStudentIds([])}
              className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
            >
              Batal Pilih
            </button>
          </div>
        </div>
      )}

      {/* FILTER & PENCARIAN SISWA */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama, kelas, atau ID siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-[#116B3A] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Kelas */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">Filter Kelas:</span>
          {['Semua', ...CANONICAL_CLASSES].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedClass === cls
                  ? 'bg-[#116B3A] text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cls === 'Semua' ? 'Semua Kelas' : `Kelas ${cls}`}
            </button>
          ))}
        </div>
      </div>

      {/* TABEL DATA SISWA DENGAN TOMBOL AKSI FUNGSIONAL PENUH */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-xs text-left">
            <thead className="bg-[#E9F5EC] text-[#116B3A] font-bold">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    title="Pilih Semua Siswa"
                    className="text-neutral-500 hover:text-neutral-800"
                  >
                    {selectedStudentIds.length === students.length && students.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#116B3A]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 w-12 text-center">No</th>
                <th className="px-3 py-3">ID Siswa</th>
                <th className="px-4 py-3">Nama Lengkap Siswa</th>
                <th className="px-4 py-3">Rombel Kelas 6</th>
                <th className="px-4 py-3">Pindahkan Rombel Cepat</th>
                <th className="px-3 py-3 text-center">No. Absen</th>
                <th className="px-3 py-3 text-center">Status Akun</th>
                <th className="px-4 py-3 text-center w-36">Aksi Lengkap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-neutral-500">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#116B3A] mb-2" />
                    <span className="font-semibold text-xs">Memuat daftar siswa madrasah...</span>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-neutral-500">
                    <div className="max-w-md mx-auto space-y-2">
                      <Users className="w-10 h-10 text-neutral-300 mx-auto mb-1" />
                      <p className="font-bold text-neutral-700 text-sm">Tidak ada siswa ditemukan.</p>
                      <p className="text-xs text-neutral-400">
                        {searchQuery || selectedClass !== 'Semua'
                          ? 'Coba ganti filter kelas atau kata kunci pencarian Anda.'
                          : 'Belum ada siswa terdaftar. Silakan gunakan tombol Tambah Siswa Manual atau Impor Excel di atas.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const isChecked = selectedStudentIds.includes(student.userId);
                  return (
                    <tr
                      key={student.userId}
                      className={`hover:bg-neutral-50/80 transition ${isChecked ? 'bg-emerald-50/50' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectStudent(student.userId)}
                          className="text-neutral-500 hover:text-neutral-800"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#116B3A]" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-300" />
                          )}
                        </button>
                      </td>

                      {/* Nomor Urut */}
                      <td className="px-3 py-3 font-mono text-neutral-400 text-center">{idx + 1}</td>

                      {/* ID Siswa */}
                      <td className="px-3 py-3 font-mono font-medium text-neutral-600 whitespace-nowrap">
                        {student.userId}
                      </td>

                      {/* Nama Siswa */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-neutral-900">{student.fullName}</div>
                        <div className="text-[10px] text-neutral-400">Fase C • MIN 1 Paser</div>
                      </td>

                      {/* Kelas Badge */}
                      <td className="px-4 py-3">
                        <span className="bg-emerald-100 text-[#116B3A] font-extrabold px-2.5 py-1 rounded-md text-xs border border-emerald-200 whitespace-nowrap">
                          Kelas {student.className}
                        </span>
                      </td>

                      {/* Quick Assign Dropdown */}
                      <td className="px-4 py-3">
                        <select
                          value={student.className}
                          onChange={(e) => handleQuickAssignClass(student, e.target.value as CanonicalClass)}
                          className="bg-neutral-50 border border-neutral-300 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-800 outline-none hover:border-[#116B3A] focus:ring-1 focus:ring-[#116B3A]"
                          title="Pindahkan siswa ini ke kelas 6 lainnya secara manual"
                        >
                          {CANONICAL_CLASSES.map((cls) => (
                            <option key={cls} value={cls}>
                              Pindah ke {cls}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Absen */}
                      <td className="px-3 py-3 text-center font-mono font-bold text-neutral-700">
                        {student.attendanceNumber ? `#${student.attendanceNumber}` : '-'}
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(student)}
                          title={`Klik untuk ${student.status === 'aktif' ? 'menonaktifkan' : 'mengaktifkan'} akses siswa ini`}
                          className={`inline-flex items-center space-x-1 font-semibold px-2.5 py-0.5 rounded-full border text-[11px] transition ${
                            student.status === 'aktif'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
                          }`}
                        >
                          {student.status === 'aktif' ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-neutral-400" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Aksi Baris Lengkap (4 Action Buttons) */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center justify-center space-x-1">
                          {/* 1. Detail / Kartu Siswa */}
                          <button
                            type="button"
                            onClick={() => setStudentDetail(student)}
                            title="Lihat Detail & Kartu Akun Siswa"
                            className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Edit Siswa */}
                          <button
                            type="button"
                            onClick={() => setEditingStudent(student)}
                            title="Edit Data Siswa"
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Reset Kode Akses */}
                          <button
                            type="button"
                            onClick={() => setStudentToReset(student)}
                            title="Reset Kode Akses Pribadi Siswa"
                            className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. Hapus Siswa */}
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(student)}
                            title="Hapus Siswa Permanen"
                            className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Counter */}
        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
          <div>
            Menampilkan <strong>{students.length}</strong> siswa
            {selectedClass !== 'Semua' && ` pada Kelas ${selectedClass}`}
          </div>
          <div className="text-[11px] text-neutral-400">
            Penataan kelas dikelola oleh Super Admin: Dzakirul Husni, S.Pd.
          </div>
        </div>
      </div>

      {/* Modal Impor Excel */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchStudents(false);
        }}
      />

      {/* Modal Tambah Siswa Manual */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-emerald-100">
            <div className="px-6 py-4 bg-[#116B3A] text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-200" />
                <span>Tambah Siswa Manual (Khusus Kelas 6)</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-emerald-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {newCreatedCode ? (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#116B3A] mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-lg">Siswa Berhasil Ditambahkan!</h4>
                  <p className="text-xs text-neutral-600">
                    Siswa telah didaftarkan ke <strong>Kelas {newClass}</strong>. Berikut kode akses login pribadi siswa:
                  </p>

                  <div className="p-4 bg-neutral-100 rounded-xl border border-neutral-300 flex items-center justify-between font-mono font-bold text-lg text-[#116B3A]">
                    <span>{newCreatedCode}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(newCreatedCode)}
                      className="p-1.5 text-neutral-500 hover:text-[#116B3A] transition"
                      title="Salin Kode Akses"
                    >
                      {copiedCode ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-left">
                    Serahkan kode akses ini kepada siswa/wali murid. Kode ini digunakan untuk masuk ke LMS MIN 1 Paser.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setNewCreatedCode(null);
                    }}
                    className="w-full bg-[#116B3A] hover:bg-[#16834A] text-white font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Selesai
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 uppercase mb-1">
                      Nama Lengkap Siswa *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Farhan"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 uppercase mb-1">
                      Pilihan Kelas (Khusus Kelas 6 MI) *
                    </label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value as CanonicalClass)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A] font-bold text-neutral-800"
                    >
                      {CANONICAL_CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          Kelas {cls} (MIN 1 Paser)
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      LMS ini dikhususkan secara kanonis hanya untuk jenjang Kelas 6 (6-A s/d 6-E).
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 uppercase mb-1">
                      Nomor Absen Siswa (Opsional)
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 1"
                      value={newAbsen}
                      onChange={(e) => setNewAbsen(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 font-semibold text-neutral-600 hover:text-neutral-900"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingStudent}
                      className="bg-[#116B3A] hover:bg-[#16834A] text-white font-bold px-5 py-2 rounded-xl transition flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      {isAddingStudent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Simpan & Terbitkan Kode</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Siswa */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-emerald-100">
            <div className="px-6 py-4 bg-[#116B3A] text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-emerald-200" />
                <span>Edit Data Siswa</span>
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-lg text-emerald-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.fullName}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, fullName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Atur Rombel Kelas 6 *
                </label>
                <select
                  value={editingStudent.className}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      className: e.target.value as CanonicalClass,
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A] font-bold"
                >
                  {CANONICAL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls} (MIN 1 Paser)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Nomor Absen
                </label>
                <input
                  type="number"
                  value={editingStudent.attendanceNumber || ''}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      attendanceNumber: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Status Akun Siswa
                </label>
                <select
                  value={editingStudent.status}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      status: e.target.value as 'aktif' | 'nonaktif',
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A] font-medium"
                >
                  <option value="aktif">Aktif (Dapat Login ke LMS)</option>
                  <option value="nonaktif">Nonaktif (Akses Sementara Ditutup)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#116B3A] hover:bg-[#16834A] text-white font-bold px-4 py-2 rounded-xl transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: KONFIRMASI HAPUS SISWA (In-App Interactive Modal, Replaces window.confirm) */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4 border border-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="font-bold text-neutral-900 text-base">Hapus Data Siswa Secara Permanen?</h4>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-left text-xs space-y-1">
              <div>
                <span className="text-neutral-500">Nama Siswa: </span>
                <strong className="text-neutral-900">{studentToDelete.fullName}</strong>
              </div>
              <div>
                <span className="text-neutral-500">Rombel: </span>
                <strong className="text-[#116B3A]">Kelas {studentToDelete.className}</strong>
              </div>
              <div>
                <span className="text-neutral-500">ID Pengguna: </span>
                <span className="font-mono text-neutral-600">{studentToDelete.userId}</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 text-left leading-relaxed">
              Tindakan ini akan menghapus data siswa secara permanen dari basis data madrasah. Siswa tidak akan dapat masuk kembali ke LMS.
            </p>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="w-1/2 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: KONFIRMASI HAPUS MASAL (Batch Delete Modal) */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4 border border-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h4 className="font-bold text-neutral-900 text-base">Hapus {selectedStudentIds.length} Siswa Terpilih?</h4>

            <p className="text-xs text-neutral-600 text-left leading-relaxed">
              Anda akan menghapus <strong>{selectedStudentIds.length} siswa</strong> yang ditandai dari sistem secara permanen.
            </p>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="w-1/2 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                disabled={isBatchDeleting}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {isBatchDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Hapus Semua</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI RESET KODE AKSES */}
      {studentToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4 border border-amber-100">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>

            <h4 className="font-bold text-neutral-900 text-base">Reset Kode Akses Pribadi?</h4>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left text-xs space-y-1">
              <div>
                <span className="text-neutral-500">Siswa: </span>
                <strong className="text-neutral-900">{studentToReset.fullName}</strong>
              </div>
              <div>
                <span className="text-neutral-500">Kelas: </span>
                <strong className="text-[#116B3A]">Kelas {studentToReset.className}</strong>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 text-left leading-relaxed">
              Kode akses lama akan langsung dibatalkan. Sistem akan menerbitkan kombinasi kode akses baru yang dapat Anda bagikan ke siswa.
            </p>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToReset(null)}
                className="w-1/2 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="w-1/2 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                <span>Terbitkan Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: HASIL RESET KODE AKSES */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4 border border-emerald-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#116B3A] mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-neutral-900 text-base">Kode Akses Baru Berhasil Terbit!</h4>

            <div className="text-xs text-neutral-600">
              Siswa: <strong>{resetResult.studentName}</strong> (Kelas {resetResult.studentClass})
            </div>

            <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-300 flex items-center justify-between font-mono font-bold text-base text-[#116B3A]">
              <span>{resetResult.plainCode}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(resetResult.plainCode)}
                className="p-1 text-neutral-500 hover:text-[#116B3A] transition"
                title="Salin Kode Akses"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 text-left leading-relaxed">
              Kode akses lama telah dinonaktifkan. Berikan kode baru ini kepada siswa/wali murid yang bersangkutan.
            </p>

            <button
              type="button"
              onClick={() => setResetResult(null)}
              className="w-full bg-[#116B3A] hover:bg-[#16834A] text-white font-bold py-2 rounded-xl text-xs transition"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: DETAIL SISWA & KARTU LOGIN (Student Detail Modal) */}
      {studentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-100">
            <div className="px-6 py-4 bg-gradient-to-r from-[#116B3A] to-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Eye className="w-5 h-5 text-emerald-200" />
                <span>Kartu Akun & Detail Siswa</span>
              </h3>
              <button
                onClick={() => setStudentDetail(null)}
                className="p-1 rounded-lg text-emerald-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Kartu Cetak Akun Siswa */}
              <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-4 bg-[#F8FCF9] relative space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-[#116B3A] text-white flex items-center justify-center font-bold text-sm">
                      M1
                    </div>
                    <div>
                      <div className="font-black text-[#116B3A] text-xs uppercase tracking-wide">MIN 1 PASER</div>
                      <div className="text-[10px] text-neutral-500">Kartu Akses Login LMS Madrasah</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-[#116B3A] text-white px-2 py-0.5 rounded-full">
                    Kelas {studentDetail.className}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 block uppercase">Nama Siswa</span>
                    <strong className="text-neutral-900 text-sm">{studentDetail.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 block uppercase">Nomor Absen</span>
                    <strong className="text-neutral-800">{studentDetail.attendanceNumber || 'Belum diisi'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 block uppercase">ID Pengguna</span>
                    <span className="font-mono text-neutral-700 font-semibold">{studentDetail.userId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 block uppercase">Status Akun</span>
                    <span className={`inline-flex items-center space-x-1 font-bold text-[11px] ${
                      studentDetail.status === 'aktif' ? 'text-emerald-700' : 'text-neutral-500'
                    }`}>
                      {studentDetail.status === 'aktif' ? 'Aktif (Dapat Login)' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">Kode Akses Pribadi</span>
                    <span className="font-mono font-black text-sm text-[#116B3A]">
                      {studentDetail.plainAccessCode || 'DIRESET / LIHAT LEMBAR'}
                    </span>
                  </div>
                  {studentDetail.plainAccessCode && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(studentDetail.plainAccessCode!)}
                      className="p-1.5 text-neutral-500 hover:text-[#116B3A] transition rounded-lg hover:bg-emerald-50"
                      title="Salin Kode Akses"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons for Detail Card */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => copyShareText(studentDetail)}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-[#116B3A] border border-emerald-200 font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShareText ? 'Tersalin!' : 'Bagikan ke Wali'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingStudent(studentDetail);
                    setStudentDetail(null);
                  }}
                  className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Data Siswa</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStudentDetail(null)}
                  className="w-full bg-[#116B3A] hover:bg-[#16834A] text-white font-bold py-2.5 rounded-xl transition"
                >
                  Tutup Kartu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
