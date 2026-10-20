import React, { useState, useEffect } from 'react';
import { UserSession } from '../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface CbtSimulationModalProps {
  user: UserSession;
}

interface CbtQuestion {
  id: number;
  subject: string;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

const OFFICIAL_CBT_QUESTIONS: CbtQuestion[] = [
  {
    id: 1,
    subject: 'Matematika',
    question: 'Sebuah balok memiliki panjang 10 cm, lebar 6 cm, dan tinggi 5 cm. Berapakah volume balok tersebut?',
    options: [
      { key: 'A', text: '300 cm³' },
      { key: 'B', text: '250 cm³' },
      { key: 'C', text: '350 cm³' },
      { key: 'D', text: '180 cm³' },
    ],
    correctAnswer: 'A',
    explanation: 'Volume balok = panjang × lebar × tinggi = 10 × 6 × 5 = 300 cm³.',
  },
  {
    id: 2,
    subject: 'IPAS',
    question: 'Kawasan hutan mangrove di pesisir Kabupaten Paser memiliki peranan ekologis yang sangat penting, yaitu...',
    options: [
      { key: 'A', text: 'Menghasilkan limbah industri pesisir' },
      { key: 'B', text: 'Mencegah abrasi air laut dan tempat pemijahan biota laut' },
      { key: 'C', text: 'Mempercepat pengikisan garis pantai' },
      { key: 'D', text: 'Mengurangi populasi ikan dan kepiting bakau' },
    ],
    correctAnswer: 'B',
    explanation: 'Akar mangrove mengikat lumpur dan memecah ombak sehingga efektif mencegah abrasi serta menjadi habitat pemijahan biota laut.',
  },
  {
    id: 3,
    subject: 'Fikih',
    question: 'Berdasarkan syariat Islam, makanan yang dinyatakan halal harus memenuhi kriteria halal zatnya dan...',
    options: [
      { key: 'A', text: 'Harganya mahal dan berasal dari luar negeri' },
      { key: 'B', text: 'Memiliki kemasan yang mewah' },
      { key: 'C', text: 'Halal cara memperolehnya serta halal cara mengolahnya' },
      { key: 'D', text: 'Hanya disukai oleh banyak orang' },
    ],
    correctAnswer: 'C',
    explanation: 'Kehalalan makanan meliputi halal zat (lidzatihi), halal cara memperoleh (lisababibihi), dan halal proses pengolahan.',
  },
  {
    id: 4,
    subject: 'Bahasa Indonesia',
    question: 'Teks yang menjelaskan proses terjadinya suatu fenomena alam atau sosial secara ilmiah disebut teks...',
    options: [
      { key: 'A', text: 'Eksplanasi' },
      { key: 'B', text: 'Fabel' },
      { key: 'C', text: 'Iklan' },
      { key: 'D', text: 'Puisi' },
    ],
    correctAnswer: 'A',
    explanation: 'Teks eksplanasi bertujuan menjelaskan hubungan sebab-akibat (kausalitas) terjadinya fenomena alam atau fenomena sosial.',
  },
  {
    id: 5,
    subject: 'Pendidikan Pancasila',
    question: 'Sikap saling menghormati antarumat beragama dan menjaga toleransi di lingkungan madrasah merupakan pengamalan sila...',
    options: [
      { key: 'A', text: 'Pertama (Ketuhanan Yang Maha Esa)' },
      { key: 'B', text: 'Kedua (Kemanusiaan yang Adil dan Beradab)' },
      { key: 'C', text: 'Ketiga (Persatuan Indonesia)' },
      { key: 'D', text: 'Kelima (Keadilan Sosial Bagi Seluruh Rakyat Indonesia)' },
    ],
    correctAnswer: 'A',
    explanation: 'Sila pertama menekankan kebebasan memeluk agama dan sikap toleransi antarsesama umat beragama.',
  },
  {
    id: 6,
    subject: 'Al-Qur\'an Hadis',
    question: 'Salah satu pesan akhlak utama yang ditekankan dalam kandungan QS. Ad-Duha ayat 9-10 adalah...',
    options: [
      { key: 'A', text: 'Menimbun harta kekayaan untuk diri sendiri' },
      { key: 'B', text: 'Larangan bersikap sewenang-wenang terhadap anak yatim dan jangan menghardik peminta-minta' },
      { key: 'C', text: 'Mengabaikan kebersihan madrasah' },
      { key: 'D', text: 'Mendahulukan kepentingan pribadi di atas jamaah' },
    ],
    correctAnswer: 'B',
    explanation: 'QS. Ad-Duha ayat 9-10 berbunyi "Fa ammal-yatiima fala taqhar, wa ammas-saa\'ila fala tanhar" yang memerintahkan memuliakan anak yatim dan tidak menghardik orang yang membutuhkan.',
  },
  {
    id: 7,
    subject: 'Akidah Akhlak',
    question: 'Lafaz kalimat thayyibah "Laa haula wa laa quwwata illaa billaahil \'aliyyil \'azhiim" disebut juga dengan...',
    options: [
      { key: 'A', text: 'Hauqalah' },
      { key: 'B', text: 'Istighfar' },
      { key: 'C', text: 'Tahmid' },
      { key: 'D', text: 'Takbir' },
    ],
    correctAnswer: 'A',
    explanation: 'Kalimah Hauqalah bermakna tiada daya dan tiada kekuatan melainkan dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.',
  },
  {
    id: 8,
    subject: 'Sejarah Kebudayaan Islam',
    question: 'Metode dakwah Wali Sanga di Nusantara dikenal sangat bijaksana karena...',
    options: [
      { key: 'A', text: 'Memaksakan kehendak dengan kekerasan senjata' },
      { key: 'B', text: 'Menggunakan pendekatan budaya, seni gamelan, dan wayang yang disisipi nilai-nilai tauhid' },
      { key: 'C', text: 'Mengisolasi diri dari masyarakat pribumi' },
      { key: 'D', text: 'Menghapus seluruh adat istiadat secara mendadak' },
    ],
    correctAnswer: 'B',
    explanation: 'Wali Sanga berdakwah secara damai (mau\'izhah hasanah) dengan mengakulturasi budaya dan kearifan lokal.',
  },
  {
    id: 9,
    subject: 'Bahasa Arab',
    question: 'Arti dari kata Bahasa Arab "الْمَدْرَسَةُ" (Al-Madrasatu) dan "الْفَصْلُ" (Al-Fashlu) berturut-turut adalah...',
    options: [
      { key: 'A', text: 'Rumah dan Kamar' },
      { key: 'B', text: 'Madrasah / Sekolah dan Kelas' },
      { key: 'C', text: 'Pasar dan Toko' },
      { key: 'D', text: 'Masjid dan Menara' },
    ],
    correctAnswer: 'B',
    explanation: 'Al-Madrasah bermakna sekolah/madrasah dan Al-Fashl bermakna ruang kelas belajar.',
  },
  {
    id: 10,
    subject: 'Muatan Lokal Budaya Paser',
    question: 'Semboyan resmi Kabupaten Paser "Olo Manin Aso Buen Si Olo Ndo" memiliki makna luhur...',
    options: [
      { key: 'A', text: 'Hari Esok Harus Lebih Baik daripada Hari Ini' },
      { key: 'B', text: 'Bersatu Kita Teguh Bercerai Kita Runtuh' },
      { key: 'C', text: 'Tanah yang Subur dan Makmur' },
      { key: 'D', text: 'Pantang Mundur Sebelum Berhasil' },
    ],
    correctAnswer: 'A',
    explanation: 'Semboyan Paser "Olo Manin Aso Buen Si Olo Ndo" mengajarkan semangat perbaikan diri berkelanjutan: hari esok harus lebih baik daripada hari ini.',
  },
];

export const CbtSimulationModal: React.FC<CbtSimulationModalProps> = ({ user }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 menit
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const handleSelectOption = (questionId: number, key: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: key,
    }));
  };

  const handleSubmitTest = () => {
    let correctCount = 0;
    SAMPLE_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / SAMPLE_QUESTIONS.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);

    if (calculatedScore >= 75) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  const handleResetTest = () => {
    setSelectedAnswers({});
    setTimeLeft(600);
    setIsSubmitted(false);
    setScore(null);
    setCurrentIdx(0);
  };

  const currentQ = SAMPLE_QUESTIONS[currentIdx];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-[#116B3A]" />
            <span>Latihan Computer-Based Test (CBT) Fase C</span>
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Simulasi asesmen digital terpadu dengan autosave jawaban dan rekap nilai otomatis.
          </p>
        </div>

        {!isSubmitted && (
          <div className="flex items-center space-x-2 bg-emerald-50 text-[#116B3A] border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold">
            <Clock className="w-4 h-4" />
            <span>
              Sisa Waktu: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} WITA
            </span>
          </div>
        )}
      </div>

      {/* CBT Finished View */}
      {isSubmitted ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#116B3A] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-neutral-900">
              Hasil Latihan CBT Selesai!
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              Peserta: <strong>{user.fullName}</strong> (Kelas {user.className})
            </p>
          </div>

          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 inline-block px-10">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Skor Perolehan
            </div>
            <div className="text-5xl font-extrabold text-[#116B3A] mt-1">{score}</div>
            <div className="text-xs text-emerald-700 font-semibold mt-1">
              {score && score >= 75 ? 'Tuntas Memenuhi KKTP Fase C' : 'Perlu Pendalaman Materi'}
            </div>
          </div>

          {/* Review of questions */}
          <div className="text-left space-y-4 pt-4 border-t border-neutral-200">
            <h4 className="font-bold text-sm text-neutral-900">Pembahasan Soal:</h4>
            {SAMPLE_QUESTIONS.map((q, idx) => {
              const studentAns = selectedAnswers[q.id];
              const isCorrect = studentAns === q.correctAnswer;

              return (
                <div key={q.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1.5">
                  <div className="font-bold text-neutral-800">
                    No {idx + 1}. {q.question}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-neutral-600">Jawaban Anda:</span>
                    <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {studentAns || 'Tidak Dijawab'} {isCorrect ? '(Benar)' : '(Salah)'}
                    </span>
                  </div>
                  <div className="text-emerald-900 bg-emerald-100/60 p-2 rounded-lg">
                    <span className="font-bold">Kunci: {q.correctAnswer}. </span>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleResetTest}
            className="bg-[#116B3A] hover:bg-[#16834A] text-white font-bold py-2.5 px-6 rounded-xl text-xs transition inline-flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Latihan CBT</span>
          </button>
        </div>
      ) : (
        /* CBT In-Progress View */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Box (3 Cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="bg-[#E9F5EC] text-[#116B3A] font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
                  {currentQ.subject}
                </span>
                <span className="text-xs font-bold text-neutral-500">
                  Soal No. {currentIdx + 1} dari {SAMPLE_QUESTIONS.length}
                </span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-neutral-900 leading-relaxed">
                {currentQ.question}
              </p>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.key;

                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleSelectOption(currentQ.id, opt.key)}
                      className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition flex items-center space-x-3 ${
                        isSelected
                          ? 'bg-emerald-50 border-[#116B3A] text-emerald-950 font-bold shadow-xs'
                          : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isSelected
                            ? 'bg-[#116B3A] text-white'
                            : 'bg-white border border-neutral-300 text-neutral-700'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-30 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {currentIdx < SAMPLE_QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                  className="bg-[#116B3A] hover:bg-[#16834A] text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1 shadow-sm"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Jawaban CBT</span>
                </button>
              )}
            </div>
          </div>

          {/* Question Grid Navigator (1 Col) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 space-y-4">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider">
              Daftar Nomor Soal
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {SAMPLE_QUESTIONS.map((q, idx) => {
                const isAnswered = Boolean(selectedAnswers[q.id]);
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-lg font-bold text-xs transition flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-[#116B3A] ring-offset-1 bg-[#116B3A] text-white'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#116B3A]"></span>
                <span>Soal Sedang Dibuka</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-300"></span>
                <span>Sudah Dijawab (Tersimpan)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-neutral-100"></span>
                <span>Belum Dijawab</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
