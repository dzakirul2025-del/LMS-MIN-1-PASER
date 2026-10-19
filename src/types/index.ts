export type CanonicalClass = '6-A' | '6-B' | '6-C' | '6-D' | '6-E';

export const CANONICAL_CLASSES: CanonicalClass[] = ['6-A', '6-B', '6-C', '6-D', '6-E'];

export type UserRole = 'student' | 'superadmin';

export interface UserSession {
  userId: string;
  fullName: string;
  className?: CanonicalClass;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
}

export interface Student {
  userId: string;
  fullName: string;
  className: CanonicalClass;
  attendanceNumber?: number;
  role: 'student';
  accessCodeHash: string;
  status: 'aktif' | 'nonaktif';
  createdAt: string;
  updatedAt: string;
}

export interface StudentWithPlainCode extends Student {
  plainAccessCode?: string;
}

export interface ExcelImportRow {
  rowNumber: number;
  namaLengkap: string;
  kelas: string;
  nomorAbsen?: number | string;
  status?: string;
  isValid: boolean;
  errors: string[];
  isDuplicate?: boolean;
}

export interface ImportPreviewResult {
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  rows: ExcelImportRow[];
}

export interface ImportCommitResult {
  importId: string;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  generatedStudents: {
    userId: string;
    fullName: string;
    className: CanonicalClass;
    attendanceNumber?: number;
    plainAccessCode: string;
  }[];
}

export interface Subject {
  subjectId: string;
  subjectName: string;
  category: 'Umum' | 'Pendidikan Agama Islam' | 'Muatan Lokal';
  description: string;
  iconName?: string;
  status: 'aktif' | 'nonaktif';
}

export interface LearningMaterial {
  materialId: string;
  subjectId: string;
  subjectName: string;
  className: CanonicalClass | 'Semua';
  title: string;
  content: string;
  learningObjective: string;
  mediaUrl?: string;
  status: 'terbit' | 'draf';
  publishedAt: string;
  updatedAt: string;
}

export interface Assignment {
  assignmentId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  className: CanonicalClass | 'Semua';
  instructions: string;
  dueAt: string;
  attachmentUrl?: string;
  status: 'aktif' | 'selesai' | 'draf';
  createdAt: string;
}

export interface AssignmentSubmission {
  submissionId: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  className: CanonicalClass;
  submittedAt: string;
  answerText: string;
  score?: number;
  feedback?: string;
  status: 'belum_dikerjakan' | 'terkumpul' | 'terlambat' | 'dinilai';
}

export interface Question {
  questionId: string;
  subjectId: string;
  topic: string;
  questionType: 'pilihan_ganda' | 'isian' | 'uraian';
  difficulty: 'mudah' | 'sedang' | 'sukar';
  questionText: string;
  options?: string[];
  answerKey: string;
  explanation?: string;
  scoreWeight: number;
}

export interface Assessment {
  assessmentId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  className: CanonicalClass | 'Semua';
  durationMinutes: number;
  startAt: string;
  endAt: string;
  questionCount: number;
  questions?: Question[];
  status: 'terjadwal' | 'berlangsung' | 'selesai' | 'draf';
}

export interface CbtAttempt {
  attemptId: string;
  assessmentId: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string;
  answers: Record<string, string>;
  score?: number;
  status: 'sedang_mengerjakan' | 'selesai' | 'waktu_habis';
}

export interface ActivityLog {
  logId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  outcome: 'sukses' | 'gagal';
  details?: string;
}

export interface ImportHistory {
  importId: string;
  adminId: string;
  adminName: string;
  sourceFilename: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  status: 'selesai' | 'sebagian_gagal' | 'gagal';
  startedAt: string;
  completedAt: string;
}

export interface DatabaseStatus {
  isConfigured: boolean;
  statusText: string;
  mode: 'GOOGLE_APPS_SCRIPT' | 'LOCAL_PERSISTENT';
  gasUrlConfigured: boolean;
  gasSecretConfigured: boolean;
  totalStudents: number;
  totalSubjects: number;
  totalMaterials: number;
  lastChecked: string;
  sheetsList: string[];
}
