import React, { useState, useRef, useEffect } from 'react';
import { ImportPreviewResult, CanonicalClass } from '../types';
import { safeApiFetch, getStoredToken } from '../lib/api';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Loader2,
  X,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [commitResult, setCommitResult] = useState<{
    successCount: number;
    failedCount: number;
    generatedStudents: any[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPreview(null);
      setFile(null);
      setCommitResult(null);
      setErrorMessage(null);
      setSuccessInfo(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal mengunduh template');
    }
  };



  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage(null);
    setSuccessInfo(null);
    setCommitResult(null);
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = (event.target?.result as string).split(',')[1];
          const data = await safeApiFetch('/api/admin/students/import/preview', {
            method: 'POST',
            body: JSON.stringify({
              fileName: selectedFile.name,
              base64Data,
            }),
          });

          if (!data || !data.success) {
            throw new Error(data?.error || 'Gagal memproses file Excel.');
          }

          setPreview(data.preview);
        } catch (postErr: any) {
          setErrorMessage(postErr.message || 'Gagal memproses file Excel.');
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setErrorMessage('Gagal membaca file dari komputer.');
        setIsLoading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membaca berkas.');
      setIsLoading(false);
    }
  };

  const handleCommitImport = async () => {
    if (!preview || preview.validRows === 0) return;

    setIsCommitting(true);
    setErrorMessage(null);

    try {
      const validRows = preview.rows.filter((r) => r.isValid);
      const data = await safeApiFetch('/api/admin/students/import/commit', {
        method: 'POST',
        body: JSON.stringify({
          fileName: preview.fileName,
          rows: validRows,
          mode: 'add_new',
        }),
      });

      if (!data || !data.success) {
        throw new Error(data?.error || 'Gagal menyimpan data impor.');
      }

      setCommitResult({
        successCount: data.successCount,
        failedCount: data.failedCount,
        generatedStudents: data.generatedStudents,
      });

      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data ke sistem.');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleDownloadDistributionSheet = async () => {
    if (!commitResult?.generatedStudents) return;

    try {
      const token = getStoredToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/students/export-distribution', {
        method: 'POST',
        headers,
        body: JSON.stringify({ students: commitResult.generatedStudents }),
      });

      if (!res.ok) throw new Error('Gagal mengunduh berkas distribusi');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LEMBAR_DISTRIBUSI_KODE_AKSES_MIN1PASER.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal mengunduh berkas lembar distribusi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="px-6 py-4 bg-[#116B3A] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
            <div>
              <h3 className="font-bold text-lg">Impor Siswa Massal dari Excel / CSV</h3>
              <p className="text-xs text-emerald-100">
                LMS MIN 1 Paser • Khusus Kelas VI (6-A s/d 6-E)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2.5">
              <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {successInfo && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* Sukses Setelah Komit */}
          {commitResult ? (
            <div className="space-y-5 text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#116B3A] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-neutral-900">
                  Impor Siswa Berhasil Disimpan!
                </h4>
                <p className="text-sm text-neutral-600 mt-1">
                  Sebanyak <strong>{commitResult.successCount} siswa</strong> berhasil didaftarkan ke kelasnya masing-masing dan dibuatkan kode akses unik.
                </p>
              </div>

              {/* Tabel Singkat Hasil Kode Akses yang Baru Dibuat */}
              <div className="max-h-56 overflow-y-auto border border-neutral-200 rounded-xl text-left">
                <table className="min-w-full divide-y divide-neutral-200 text-xs">
                  <thead className="bg-[#E9F5EC] text-[#116B3A] font-bold sticky top-0">
                    <tr>
                      <th className="px-3.5 py-2">Nama Siswa</th>
                      <th className="px-3.5 py-2">Kelas</th>
                      <th className="px-3.5 py-2">No. Absen</th>
                      <th className="px-3.5 py-2 font-mono">Kode Akses Baru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {commitResult.generatedStudents.map((st, i) => (
                      <tr key={i} className="hover:bg-neutral-50">
                        <td className="px-3.5 py-2 font-bold text-neutral-900">{st.fullName}</td>
                        <td className="px-3.5 py-2">
                          <span className="bg-emerald-100 text-[#116B3A] font-extrabold px-1.5 py-0.5 rounded">
                            {st.className}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-neutral-600">{st.attendanceNumber || '-'}</td>
                        <td className="px-3.5 py-2 font-mono font-bold text-[#116B3A]">{st.plainAccessCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-lg mx-auto text-left text-xs text-amber-900 flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Penting: Unduh Lembar Distribusi Kode Akses</div>
                  <p className="mt-0.5">
                    Kode akses siswa hanya dibuatkan dan ditampilkan saat proses ini. Database hanya menyimpan nilai hash HMAC-SHA-256. Unduh berkas Excel lembar distribusi sekarang untuk dibagikan ke siswa/wali murid.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadDistributionSheet}
                  className="bg-[#116B3A] hover:bg-[#16834A] text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Lembar Distribusi (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-2.5 px-5 rounded-xl transition text-sm"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Panduan Baku Impor Siswa Kelas 6 MIN 1 Paser */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-[#116B3A] text-sm mb-1">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      <span>Ketentuan Berkas Excel Impor Siswa (Khusus Kelas 6)</span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">
                      Gunakan format kolom resmi: <strong>nama_lengkap</strong>, <strong>kelas</strong> (wajib 6-A, 6-B, 6-C, 6-D, atau 6-E), <strong>nomor_absen</strong>, dan <strong>status</strong> (aktif/nonaktif).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="bg-white hover:bg-emerald-50 text-[#116B3A] border border-emerald-300 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-xs whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 text-[#116B3A]" />
                    <span>Unduh Format Template</span>
                  </button>
                </div>
              </div>

              {/* Upload Box */}
              <div>
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-2">
                  Atau Unggah Berkas Excel / CSV Anda:
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-300 hover:border-[#116B3A] bg-neutral-50 hover:bg-emerald-50/40 rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-neutral-400 mb-1.5" />
                  <p className="text-sm font-semibold text-neutral-800">
                    {file ? file.name : 'Klik untuk memilih berkas Excel (.xlsx / .csv)'}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Maksimum ukuran file: 10MB • Header: nama_lengkap, kelas, nomor_absen, status
                  </p>
                </div>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-6 space-x-2 text-sm text-emerald-800">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memvalidasi baris data siswa Kelas 6...</span>
                </div>
              )}

              {/* Tabel Pratinjau Validasi */}
              {preview && !isLoading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Pratinjau Validasi: <strong className="text-neutral-900 font-mono">{preview.fileName}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleLoadDemoData}
                      className="text-xs text-[#116B3A] font-bold hover:underline flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Muat Ulang Demo</span>
                    </button>
                  </div>

                  {/* Summary Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 bg-neutral-100 rounded-xl text-neutral-700 border border-neutral-200">
                      <div className="font-semibold text-neutral-500">Total Baris</div>
                      <div className="text-lg font-extrabold">{preview.totalRows}</div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 border border-emerald-200">
                      <div className="font-semibold text-emerald-600">Baris Valid</div>
                      <div className="text-lg font-extrabold text-emerald-700">{preview.validRows}</div>
                    </div>
                    <div className="p-2.5 bg-rose-50 rounded-xl text-rose-800 border border-rose-200">
                      <div className="font-semibold text-rose-600">Tidak Valid</div>
                      <div className="text-lg font-extrabold text-rose-700">{preview.invalidRows}</div>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-800 border border-amber-200">
                      <div className="font-semibold text-amber-600">Duplikat</div>
                      <div className="text-lg font-extrabold text-amber-700">{preview.duplicateRows}</div>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="min-w-full divide-y divide-neutral-200 text-xs">
                        <thead className="bg-[#E9F5EC] sticky top-0 font-bold text-[#116B3A]">
                          <tr>
                            <th className="px-3.5 py-2.5 text-left">Baris</th>
                            <th className="px-3.5 py-2.5 text-left">Nama Lengkap</th>
                            <th className="px-3.5 py-2.5 text-left">Kelas (Khusus 6)</th>
                            <th className="px-3.5 py-2.5 text-left">No. Absen</th>
                            <th className="px-3.5 py-2.5 text-left">Status</th>
                            <th className="px-3.5 py-2.5 text-left">Validasi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 bg-white">
                          {preview.rows.map((row) => (
                            <tr
                              key={row.rowNumber}
                              className={!row.isValid ? 'bg-rose-50/50' : row.isDuplicate ? 'bg-amber-50/50' : ''}
                            >
                              <td className="px-3.5 py-2 font-mono text-neutral-500">#{row.rowNumber}</td>
                              <td className="px-3.5 py-2 font-bold text-neutral-900">{row.namaLengkap || '-'}</td>
                              <td className="px-3.5 py-2">
                                <span className="bg-emerald-100 text-[#116B3A] font-extrabold px-2 py-0.5 rounded">
                                  {row.kelas || '-'}
                                </span>
                              </td>
                              <td className="px-3.5 py-2 text-neutral-600">{row.nomorAbsen || '-'}</td>
                              <td className="px-3.5 py-2 capitalize font-semibold">{row.status}</td>
                              <td className="px-3.5 py-2">
                                {row.isValid ? (
                                  <span className="inline-flex items-center text-emerald-700 font-bold space-x-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Siap Impor</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-rose-700 font-semibold space-x-1" title={row.errors.join(', ')}>
                                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>{row.errors.join('; ')}</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!commitResult && (
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-4 py-2"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={!preview || preview.validRows === 0 || isCommitting}
              onClick={handleCommitImport}
              className="bg-[#116B3A] hover:bg-[#16834A] text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-40 flex items-center space-x-2"
            >
              {isCommitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Impor Sekarang ({preview ? preview.validRows : 0} Siswa Kelas 6 Valid)
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
