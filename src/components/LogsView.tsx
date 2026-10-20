import React, { useState, useEffect } from 'react';
import { ActivityLog, ImportHistory } from '../types';
import { Layers, FileSpreadsheet, History, CheckCircle2, XCircle } from 'lucide-react';
import { safeApiFetch } from '../lib/api';

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [importHistories, setImportHistories] = useState<ImportHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'import'>('activity');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      safeApiFetch('/api/admin/logs'),
      safeApiFetch('/api/admin/import-history'),
    ])
      .then(([logsData, historyData]) => {
        if (logsData && logsData.success && Array.isArray(logsData.logs)) setLogs(logsData.logs);
        if (historyData && historyData.success && Array.isArray(historyData.histories)) setImportHistories(historyData.histories);
      })
      .catch((e) => console.warn(e))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
            <Layers className="w-6 h-6 text-[#116B3A]" />
            <span>Audit Trail & Riwayat Aktivitas Sistem</span>
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Pencatatan aktivitas login, manajemen data siswa, impor Excel massal, dan administrasi LMS MIN 1 Paser.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
            activeTab === 'activity'
              ? 'border-[#116B3A] text-[#116B3A]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Log Aktivitas Pengguna ({logs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
            activeTab === 'import'
              ? 'border-[#116B3A] text-[#116B3A]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Riwayat Impor Excel ({importHistories.length})</span>
        </button>
      </div>

      {/* Tables */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {activeTab === 'activity' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-xs text-left">
              <thead className="bg-[#E9F5EC] text-[#116B3A] font-bold">
                <tr>
                  <th className="px-4 py-3">Waktu (WITA)</th>
                  <th className="px-4 py-3">Aktor</th>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3">Aksi</th>
                  <th className="px-4 py-3">Tipe Sumber</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {logs.map((log) => (
                  <tr key={log.logId} className="hover:bg-neutral-50/60 transition">
                    <td className="px-4 py-3 font-mono text-neutral-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        timeZone: 'Asia/Makassar',
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">{log.actorName}</td>
                    <td className="px-4 py-3 uppercase text-[10px] font-bold text-neutral-600">
                      {log.actorRole}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-800">{log.action}</td>
                    <td className="px-4 py-3 text-neutral-600">{log.resourceType}</td>
                    <td className="px-4 py-3">
                      {log.outcome === 'sukses' ? (
                        <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sukses</span>
                        </span>
                      ) : (
                        <span className="text-rose-700 font-semibold flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Gagal</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-xs text-left">
              <thead className="bg-[#E9F5EC] text-[#116B3A] font-bold">
                <tr>
                  <th className="px-4 py-3">ID Impor</th>
                  <th className="px-4 py-3">Waktu Eksekusi</th>
                  <th className="px-4 py-3">Nama Berkas</th>
                  <th className="px-4 py-3">Total Baris</th>
                  <th className="px-4 py-3">Berhasil</th>
                  <th className="px-4 py-3">Gagal</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {importHistories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                      Belum ada riwayat impor Excel.
                    </td>
                  </tr>
                ) : (
                  importHistories.map((h) => (
                    <tr key={h.importId}>
                      <td className="px-4 py-3 font-mono font-medium text-neutral-600">{h.importId}</td>
                      <td className="px-4 py-3 font-mono text-neutral-500">
                        {new Date(h.startedAt).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-900">{h.sourceFilename}</td>
                      <td className="px-4 py-3">{h.totalRows}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{h.successfulRows}</td>
                      <td className="px-4 py-3 font-bold text-rose-700">{h.failedRows}</td>
                      <td className="px-4 py-3 capitalize">{h.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
