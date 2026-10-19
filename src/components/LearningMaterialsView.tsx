import React, { useState, useEffect } from 'react';
import { LearningMaterial, Subject } from '../types';
import {
  BookOpen,
  FileText,
  Search,
  Tag,
  Calendar,
  X,
  ExternalLink,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

export const LearningMaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('Semua');
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const [matRes, subRes] = await Promise.all([
          fetch('/api/materials'),
          fetch('/api/subjects'),
        ]);
        const matData = await matRes.json();
        const subData = await subRes.json();

        if (matData.success) setMaterials(matData.materials);
        if (subData.success) setSubjects(subData.subjects);
      } catch (e) {
        console.error('Gagal mengambil data materi:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter((m) => {
    const matchSubject = selectedSubject === 'Semua' || m.subjectName === selectedSubject;
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-[#116B3A]" />
            <span>Materi & Perangkat Pembelajaran Fase C</span>
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Bahan ajar digital interaktif, tujuan pembelajaran (TP), dan rangkuman materi Kelas VI MIN 1 Paser.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari materi pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-[#116B3A] outline-none"
          />
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedSubject('Semua')}
          className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap ${
            selectedSubject === 'Semua'
              ? 'bg-[#116B3A] text-white shadow-sm'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Semua Mata Pelajaran
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.subjectId}
            onClick={() => setSelectedSubject(sub.subjectName)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              selectedSubject === sub.subjectName
                ? 'bg-[#116B3A] text-white shadow-sm font-bold'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            {sub.subjectName}
          </button>
        ))}
      </div>

      {/* Material Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-neutral-500 text-xs">
            Memuat materi pembelajaran...
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-neutral-500 text-xs bg-white rounded-2xl border border-dashed border-neutral-300">
            Tidak ada materi pembelajaran yang cocok dengan filter ini.
          </div>
        ) : (
          filteredMaterials.map((mat) => (
            <div
              key={mat.materialId}
              onClick={() => setSelectedMaterial(mat)}
              className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-[#116B3A] hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-[#E9F5EC] text-[#116B3A] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {mat.subjectName}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Kelas {mat.className}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-neutral-900 mt-2 line-clamp-2">
                  {mat.title}
                </h3>

                <p className="text-xs text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                  {mat.learningObjective}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(mat.publishedAt).toLocaleDateString('id-ID')}</span>
                </span>
                <span className="font-bold text-[#116B3A] hover:underline">
                  Baca Modul →
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Material Reader Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-emerald-100">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#116B3A] text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
                  {selectedMaterial.subjectName} • Kelas {selectedMaterial.className}
                </span>
                <h3 className="font-bold text-base mt-0.5">{selectedMaterial.title}</h3>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-emerald-100 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-neutral-700 leading-relaxed">
              {/* TP Box */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="font-bold text-[#116B3A] mb-1 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tujuan Pembelajaran (TP) Fase C:</span>
                </div>
                <p className="text-neutral-800">{selectedMaterial.learningObjective}</p>
              </div>

              {/* Content Body */}
              <div className="prose prose-xs max-w-none text-neutral-800 whitespace-pre-line leading-relaxed text-xs">
                {selectedMaterial.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setSelectedMaterial(null)}
                className="bg-[#116B3A] hover:bg-[#16834A] text-white font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Tutup Modul
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
