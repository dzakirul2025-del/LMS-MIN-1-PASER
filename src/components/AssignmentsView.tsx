import React, { useState, useEffect } from 'react';
import { Assignment, UserSession } from '../types';
import {
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  Send,
  AlertCircle,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { safeApiFetch } from '../lib/api';

interface AssignmentsViewProps {
  user: UserSession;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({ user }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    safeApiFetch('/api/assignments')
      .then((data) => {
        if (data && data.success && Array.isArray(data.assignments)) {
          setAssignments(data.assignments);
        }
      })
      .catch((err) => console.warn(err));
  }, []);

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionText.trim()) return;

    // Simulate submission recording
    setSubmittedIds((prev) => new Set(prev).add(selectedAssignment.assignmentId));
    setSuccessMessage(`Jawaban untuk tugas "${selectedAssignment.title}" berhasil dikumpulkan.`);
    setSubmissionText('');
    setTimeout(() => {
      setSelectedAssignment(null);
      setSuccessMessage(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-[#116B3A]" />
            <span>Tugas Mandiri & Lembar Kerja (LKPD)</span>
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Daftar penugasan terstruktur untuk siswa Kelas {user.className || 'VI'} MIN 1 Paser.
          </p>
        </div>
      </div>

      {/* Grid of Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.map((asg) => {
          const isSubmitted = submittedIds.has(asg.assignmentId);

          return (
            <div
              key={asg.assignmentId}
              className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#E9F5EC] text-[#116B3A] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {asg.subjectName}
                  </span>
                  {isSubmitted ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Terkumpul</span>
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Aktif</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-neutral-900">{asg.title}</h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  {asg.instructions}
                </p>

                <div className="mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500 space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      Tenggat Waktu: <strong>{new Date(asg.dueAt).toLocaleDateString('id-ID')} (23:59 WITA)</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                {user.role === 'student' ? (
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(asg)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
                      isSubmitted
                        ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        : 'bg-[#116B3A] hover:bg-[#16834A] text-white shadow-sm'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitted ? 'Lihat / Perbarui Jawaban' : 'Kerjakan & Kumpulkan Jawaban'}</span>
                  </button>
                ) : (
                  <div className="text-xs text-neutral-500 italic">
                    Dapat dilihat oleh seluruh siswa kelas target.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal for Student */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-100">
            <div className="px-6 py-4 bg-[#116B3A] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
                  {selectedAssignment.subjectName}
                </span>
                <h3 className="font-bold text-base">{selectedAssignment.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-emerald-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {successMessage ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-center text-xs space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">{successMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="font-bold text-neutral-700 block mb-1">Petunjuk Tugas:</span>
                    <p className="text-neutral-600 leading-relaxed">{selectedAssignment.instructions}</p>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 uppercase mb-1">
                      Tuliskan Jawaban Anda
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Ketik langkah pengerjaan atau uraian jawaban tugas di sini..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-[#116B3A]"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAssignment(null)}
                      className="px-4 py-2 font-semibold text-neutral-600 hover:text-neutral-900"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-[#116B3A] hover:bg-[#16834A] text-white font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Jawaban</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
