import React, { useState, useEffect } from 'react';
import { Student, CanonicalClass, CANONICAL_CLASSES } from '../types';
import { ExcelImportModal } from './ExcelImportModal';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
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
  Sparkles,
} from 'lucide-react';

export const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [resetResult, setResetResult] = useState<{
    studentName: string;
    plainCode: string;
  } | null>(null);

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch('/api/admin/students/template');
      if (!res.ok) throw new Error('Gagal mengunduh template');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TEMPLATE_IMPOR_SISWA_MIN1PASER.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // New Student Form
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState<CanonicalClass>('6-A');
  const [newAbsen, setNewAbsen] = useState<string>('');
  const [newCreatedCode, setNewCreatedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass !== 'Semua') params.append('className', selectedClass);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (e) {
      console.error('Gagal mengambil data siswa:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, searchQuery]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newName.trim(),
          className: newClass,
          attendanceNumber: newAbsen ? Number(newAbsen) : undefined,
          status: 'aktif',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewCreatedCode(data.plainAccessCode);
        fetchStudents();
      } else {
        alert(data.error || 'Gagal menambahkan siswa.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const res = await fetch(`/api/admin/students/${editingStudent.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editingStudent.fullName,
          className: editingStudent.className,
          attendanceNumber: editingStudent.attendanceNumber,
          status: editingStudent.status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingStudent(null);
        fetchStudents();
      } else {
        alert(data.error || 'Gagal memperbarui siswa.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetAccessCode = async (student: Student) => {
    if (!confirm(`Reset kode akses untuk ${student.fullName} (${student.className})? Kode akses lama akan langsung tidak berlaku.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/students/${student.userId}/reset-access`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setResetResult({
          studentName: student.fullName,
          plainCode: data.newPlainAccessCode,
        });
        fetchStudents();
      } else {
        alert(data.error || 'Gagal mereset kode.');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#116B3A]" />
            <span>Manajemen Siswa Kelas VI MIN 1 Paser</span>
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Kelola data siswa, lakukan impor massal dari Excel, dan kelola distribusi kode akses pribadi siswa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsDemoMode(true);
              setIsImportModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-1.5"
            title="Muat data demo 10 siswa untuk uji coba langsung"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Demo Impor Data Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewCreatedCode(null);
              setNewName('');
              setNewAbsen('');
              setIsAddModalOpen(true);
            }}
            className="bg-[#116B3A] hover:bg-[#16834A] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsDemoMode(false);
              setIsImportModalOpen(true);
            }}
            className="bg-emerald-50 hover:bg-emerald-100 text-[#116B3A] border border-emerald-300 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Impor Excel</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-300 text-xs font-semibold px-3 py-2.5 rounded-xl transition flex items-center space-x-1.5"
            title="Unduh format template Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Template</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama atau ID siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-[#116B3A] outline-none"
          />
        </div>

        {/* Filter Kelas */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
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
              {cls === 'Semua' ? 'Semua Kelas' : cls}
            </button>
          ))}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-xs text-left">
            <thead className="bg-[#E9F5EC] text-[#116B3A] font-bold">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">ID Siswa</th>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">No. Absen</th>
                <th className="px-4 py-3">Status Akun</th>
                <th className="px-4 py-3 text-right">Aksi & Kode Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#116B3A] mb-2" />
                    <span>Memuat data siswa...</span>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-neutral-500">
                    Belum ada siswa terdaftar pada kelas ini. Silakan tambahkan manual atau impor dari Excel.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student.userId} className="hover:bg-neutral-50/70 transition">
                    <td className="px-4 py-3 font-mono text-neutral-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-medium text-neutral-600">{student.userId}</td>
                    <td className="px-4 py-3 font-bold text-neutral-900">{student.fullName}</td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-[#116B3A] font-extrabold px-2 py-0.5 rounded">
                        {student.className}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{student.attendanceNumber || '-'}</td>
                    <td className="px-4 py-3">
                      {student.status === 'aktif' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-neutral-500 font-semibold bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-300">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Nonaktif</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleResetAccessCode(student)}
                          title="Reset Kode Akses Siswa"
                          className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStudent(student)}
                          title="Edit Data Siswa"
                          className="p-1.5 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-300 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Impor Excel */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        initialLoadDemo={isDemoMode}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchStudents();
        }}
      />

      {/* Modal Tambah Siswa Manual */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-emerald-100">
            <div className="px-6 py-4 bg-[#116B3A] text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Tambah Siswa Manual</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-emerald-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {newCreatedCode ? (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#116B3A] mx-auto flex items-center justify-center">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-lg">Siswa Berhasil Ditambahkan!</h4>
                  <p className="text-xs text-neutral-600">
                    Berikut adalah kode akses pribadi siswa yang baru dibuat:
                  </p>

                  <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-300 flex items-center justify-between font-mono font-bold text-base text-[#116B3A]">
                    <span>{newCreatedCode}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(newCreatedCode)}
                      className="p-1.5 text-neutral-500 hover:text-[#116B3A] transition"
                      title="Salin Kode Akses"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-left">
                    Catat atau serahkan kode ini kepada siswa. Kode asli tidak tersimpan lagi di database.
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
                      Nama Lengkap Siswa
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Farhan"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 uppercase mb-1">
                      Kelas (Fase C)
                    </label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value as CanonicalClass)}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A]"
                    >
                      {CANONICAL_CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          Kelas {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 uppercase mb-1">
                      Nomor Absen (Opsional)
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 12"
                      value={newAbsen}
                      onChange={(e) => setNewAbsen(e.target.value)}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A]"
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
                      className="bg-[#116B3A] hover:bg-[#16834A] text-white font-bold px-4 py-2 rounded-xl transition"
                    >
                      Simpan & Buat Kode Akses
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-emerald-100">
            <div className="px-6 py-4 bg-[#116B3A] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Edit Data Siswa</h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-emerald-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  ID Siswa (Tidak Dapat Diubah)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingStudent.userId}
                  className="w-full px-3.5 py-2 bg-neutral-100 border border-neutral-300 rounded-xl font-mono text-neutral-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Nama Lengkap
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
                  Kelas (Fase C)
                </label>
                <select
                  value={editingStudent.className}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      className: e.target.value as CanonicalClass,
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A]"
                >
                  {CANONICAL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
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
                  Status Akun
                </label>
                <select
                  value={editingStudent.status}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      status: e.target.value as 'aktif' | 'nonaktif',
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A]"
                >
                  <option value="aktif">Aktif (Dapat Login)</option>
                  <option value="nonaktif">Nonaktif (Akses Ditutup)</option>
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

      {/* Modal Hasil Reset Kode Akses */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4 border border-emerald-100">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-neutral-900 text-base">Kode Akses Baru Diterbitkan</h4>
            <p className="text-xs text-neutral-600">
              Siswa: <strong>{resetResult.studentName}</strong>
            </p>

            <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-300 flex items-center justify-between font-mono font-bold text-base text-[#116B3A]">
              <span>{resetResult.plainCode}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(resetResult.plainCode)}
                className="p-1 text-neutral-500 hover:text-[#116B3A] transition"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 text-left">
              Kode akses lama telah langsung dibatalkan. Berikan kode baru ini kepada siswa.
            </p>

            <button
              type="button"
              onClick={() => setResetResult(null)}
              className="w-full bg-[#116B3A] hover:bg-[#16834A] text-white font-bold py-2 rounded-xl text-xs transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
