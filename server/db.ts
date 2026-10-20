import fs from 'fs';
import path from 'path';
import {
  Student,
  Subject,
  LearningMaterial,
  Assignment,
  ActivityLog,
  ImportHistory,
  DatabaseStatus,
  CanonicalClass,
} from '../src/types';
import { hashStudentAccessCode } from './security';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const DB_FILE = path.join(DATA_DIR, 'lms_database.json');

interface DatabaseSchema {
  settings: Record<string, string>;
  students: Student[];
  subjects: Subject[];
  materials: LearningMaterial[];
  assignments: Assignment[];
  logs: ActivityLog[];
  importHistories: ImportHistory[];
}

// Data awal (Seed) resmi Fase C Madrasah Ibtidaiyah Kelas VI MIN 1 Paser
function getInitialSeed(): DatabaseSchema {
  const now = new Date().toISOString();

  const subjects: Subject[] = [
    { subjectId: 'MP-01', subjectName: 'Matematika', category: 'Umum', description: 'Bilangan Bulat, Lingkaran, dan Bangun Ruang Kelas VI', status: 'aktif' },
    { subjectId: 'MP-02', subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', category: 'Umum', description: 'Sistem Organ Tubuh, Tata Surya, dan Ekosistem Lingkungan Paser', status: 'aktif' },
    { subjectId: 'MP-03', subjectName: 'Bahasa Indonesia', category: 'Umum', description: 'Teks Eksplanasi, Laporan Hasil Observasi, dan Pidato', status: 'aktif' },
    { subjectId: 'MP-04', subjectName: 'Pendidikan Pancasila', category: 'Umum', description: 'Penerapan Nilai-Nilai Pancasila dalam Kehidupan Bermasyarakat', status: 'aktif' },
    { subjectId: 'MP-05', subjectName: 'Bahasa Arab', category: 'Pendidikan Agama Islam', description: 'Kosa Kata & Percakapan Tematik Kelas VI MI (Fi al-Madrasah, dsb)', status: 'aktif' },
    { subjectId: 'MP-06', subjectName: "Al-Qur'an Hadis", category: 'Pendidikan Agama Islam', description: "Kandungan QS. Ad-Duha, Al-Insyirah, dan Hadis Keutamaan Memberi", status: 'aktif' },
    { subjectId: 'MP-07', subjectName: 'Akidah Akhlak', category: 'Pendidikan Agama Islam', description: 'Kalimah Thayyibah, Asmaul Husna, dan Adab Bergaul Remaja', status: 'aktif' },
    { subjectId: 'MP-08', subjectName: 'Fikih', category: 'Pendidikan Agama Islam', description: 'Ketentuan Makanan Halal & Haram, Jual Beli, dan Khitan', status: 'aktif' },
    { subjectId: 'MP-09', subjectName: 'Sejarah Kebudayaan Islam (SKI)', category: 'Pendidikan Agama Islam', description: 'Peran Wali Sanga dan Perkembangan Islam di Nusantara', status: 'aktif' },
    { subjectId: 'MP-10', subjectName: 'PJOK', category: 'Umum', description: 'Permainan Bola Besar, Senam Irama, dan Kebugaran Jasmani', status: 'aktif' },
    { subjectId: 'MP-11', subjectName: 'Seni Budaya dan Prakarya (SBdP)', category: 'Muatan Lokal', description: 'Motif Seni Tradisional Kalimantan Timur dan Musik Nusantara', status: 'aktif' },
  ];

  // Buat contoh siswa awal untuk ke-5 kelas (6-A s/d 6-E) dengan kode akses demo yang tercatat
  // Siswa demo memiliki kode akses tertera di panduan: e.g. "PAS-6A-1234"
  const demoStudents: Student[] = [
    {
      userId: 'SISWA-6A-001',
      fullName: 'Muhammad Farhan',
      className: '6-A',
      attendanceNumber: 1,
      role: 'student',
      accessCodeHash: hashStudentAccessCode('PAS-6A-1234'),
      status: 'aktif',
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: 'SISWA-6B-001',
      fullName: 'Aisyah Putri Rahmadani',
      className: '6-B',
      attendanceNumber: 1,
      role: 'student',
      accessCodeHash: hashStudentAccessCode('PAS-6B-1234'),
      status: 'aktif',
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: 'SISWA-6C-001',
      fullName: 'Muhammad Rizky Ramadhan',
      className: '6-C',
      attendanceNumber: 1,
      role: 'student',
      accessCodeHash: hashStudentAccessCode('PAS-6C-1234'),
      status: 'aktif',
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: 'SISWA-6D-001',
      fullName: 'Nurul Hidayah',
      className: '6-D',
      attendanceNumber: 1,
      role: 'student',
      accessCodeHash: hashStudentAccessCode('PAS-6D-1234'),
      status: 'aktif',
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: 'SISWA-6E-001',
      fullName: 'Dimas Arya Pratama',
      className: '6-E',
      attendanceNumber: 1,
      role: 'student',
      accessCodeHash: hashStudentAccessCode('PAS-6E-1234'),
      status: 'aktif',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const initialMaterials: LearningMaterial[] = [
    {
      materialId: 'MAT-01',
      subjectId: 'MP-01',
      subjectName: 'Matematika',
      className: 'Semua',
      title: 'Geometri Ruang: Menghitung Volume Bangun Gabungan',
      learningObjective: 'Peserta didik mampu menghitung volume gabungan kubus dan balok dengan teliti.',
      content: `### Capaian Pembelajaran Fase C - Matematika
Pada materi ini kita mempelajari cara menghitung bangun gabungan antara kubus dan balok dalam kehidupan nyata di Paser.

**Rumus Utama:**
1. Volume Kubus = s x s x s
2. Volume Balok = p x l x t
3. Volume Gabungan = V1 + V2

Kerjakan lembar latihan yang telah dibagikan oleh guru di menu Tugas.`,
      status: 'terbit',
      publishedAt: now,
      updatedAt: now,
    },
    {
      materialId: 'MAT-02',
      subjectId: 'MP-02',
      subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
      className: 'Semua',
      title: 'Ekosistem Hutan Mangrove dan Keanekaragaman Hayati Pesisir Paser',
      learningObjective: 'Mengidentifikasi komponen biotik dan abiotik ekosistem mangrove di wilayah Kabupaten Paser.',
      content: `Kabupaten Paser memiliki kawasan pesisir yang kaya akan hutan mangrove.
Mangrove berfungsi mencegah abrasi air laut dan menjadi habitat berbagai biota laut seperti kepiting bakau, bekantan, dan burung pesisir.`,
      status: 'terbit',
      publishedAt: now,
      updatedAt: now,
    },
    {
      materialId: 'MAT-03',
      subjectId: 'MP-08',
      subjectName: 'Fikih',
      className: 'Semua',
      title: 'Prinsip Makanan dan Minuman Halal Menurut Syariat Islam',
      learningObjective: 'Membedakan kriteria halal dan thayyib serta menjauhi makanan yang diharamkan.',
      content: `Allah SWT berfirman dalam QS. Al-Baqarah ayat 168: *"Hai sekalian manusia, makanlah yang halal lagi baik dari apa yang terdapat di bumi..."*
Halal mencakup: Halal zatnya, Halal cara memperolehnya, dan Halal cara mengolahnya.`,
      status: 'terbit',
      publishedAt: now,
      updatedAt: now,
    },
  ];

  const initialAssignments: Assignment[] = [
    {
      assignmentId: 'TUGAS-01',
      title: 'Latihan Menghitung Volume Bangun Ruang di Sekitar Kita',
      subjectId: 'MP-01',
      subjectName: 'Matematika',
      className: 'Semua',
      instructions: 'Amati 2 benda berbentuk balok dan kubus di rumah/madrasah. Ukur panjang, lebar, dan tinggi, kemudian hitung volumenya dan tuliskan langkah pengerjaannya.',
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'aktif',
      createdAt: now,
    },
    {
      assignmentId: 'TUGAS-02',
      title: 'Resume Karakteristik Ekosistem Mangrove',
      subjectId: 'MP-02',
      subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
      className: 'Semua',
      instructions: 'Tuliskan rangkuman 1 halaman mengenai 3 manfaat utama hutan mangrove bagi lingkungan pesisir.',
      dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'aktif',
      createdAt: now,
    },
  ];

  const initialLogs: ActivityLog[] = [
    {
      logId: 'LOG-INIT-01',
      actorId: 'SYSTEM',
      actorName: 'Sistem LMS MIN 1 Paser',
      actorRole: 'superadmin',
      action: 'INISIALISASI_DATABASE',
      resourceType: 'SYSTEM',
      resourceId: 'Fase C Kelas VI',
      timestamp: now,
      outcome: 'sukses',
      details: 'Sistem fondasi LMS MIN 1 Paser Fase 1 siap digunakan.',
    },
  ];

  return {
    settings: {
      APP_NAME: 'LMS MIN 1 PASER',
      SCHOOL_NAME: 'MIN 1 Paser',
      TEACHER_IN_CHARGE: 'Dzakirul Husni, S.Pd.',
      HEADMASTER: 'Ismail, S.Ag.',
      PHASE: 'Fase C (Kelas VI)',
      TIMEZONE: 'Asia/Makassar',
    },
    students: demoStudents,
    subjects,
    materials: initialMaterials,
    assignments: initialAssignments,
    logs: initialLogs,
    importHistories: [],
  };
}

class DatabaseService {
  private inMemoryDb: DatabaseSchema;

  constructor() {
    this.inMemoryDb = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('[DB] Gagal memuat file database lokal, menggunakan seed baru:', e);
    }
    const seed = getInitialSeed();
    this.saveDatabase(seed);
    return seed;
  }

  private saveDatabase(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Gagal menyimpan ke file lokal:', e);
    }
  }

  public getDatabaseStatus(): DatabaseStatus {
    const gasUrl = process.env.GAS_WEB_APP_URL || '';
    const gasSecret = process.env.GAS_SHARED_SECRET || '';
    const isGasConfigured = Boolean(gasUrl && gasUrl.trim() !== '' && gasSecret && gasSecret.trim() !== '');

    return {
      isConfigured: isGasConfigured,
      statusText: isGasConfigured
        ? 'TERHUBUNG KE GOOGLE APPS SCRIPT WEB APP'
        : 'BELUM DIKONFIGURASI (MODE PENYIMPANAN PERSISTEN LOKAL AKTIF)',
      mode: isGasConfigured ? 'GOOGLE_APPS_SCRIPT' : 'LOCAL_PERSISTENT',
      gasUrlConfigured: Boolean(gasUrl),
      gasSecretConfigured: Boolean(gasSecret),
      totalStudents: this.inMemoryDb.students.length,
      totalSubjects: this.inMemoryDb.subjects.length,
      totalMaterials: this.inMemoryDb.materials.length,
      lastChecked: new Date().toISOString(),
      sheetsList: [
        'PENGATURAN', 'PENGGUNA', 'MAPEL', 'PERANGKAT_AJAR', 'MATERI',
        'MEDIA', 'DOKUMEN', 'TUGAS', 'PENGUMPULAN_TUGAS', 'BANK_SOAL',
        'ASESMEN', 'ASESMEN_SOAL', 'HASIL_CBT', 'PROGRES', 'PENGUMUMAN',
        'LOG_AKTIVITAS', 'RIWAYAT_IMPOR',
      ],
    };
  }

  // --- Operasi Siswa ---
  public getStudents(filters?: { className?: string; query?: string }): Student[] {
    let list = [...this.inMemoryDb.students];
    if (filters?.className && filters.className !== 'Semua') {
      list = list.filter((s) => s.className === filters.className);
    }
    if (filters?.query && filters.query.trim() !== '') {
      const q = filters.query.toLowerCase().trim();
      list = list.filter((s) => s.fullName.toLowerCase().includes(q) || s.userId.toLowerCase().includes(q));
    }
    return list;
  }

  public findStudentByCredentials(name: string, className: string): Student | null {
    const cleanName = name.trim().toLowerCase();
    const cleanClass = className.trim().toUpperCase();
    return (
      this.inMemoryDb.students.find(
        (s) => s.fullName.toLowerCase() === cleanName && s.className === cleanClass
      ) || null
    );
  }

  public getStudentById(userId: string): Student | null {
    return this.inMemoryDb.students.find((s) => s.userId === userId) || null;
  }

  public addStudent(student: Student): void {
    this.inMemoryDb.students.push(student);
    this.saveDatabase(this.inMemoryDb);
  }

  public addStudentsBatch(students: Student[], importRecord?: ImportHistory): void {
    this.inMemoryDb.students.push(...students);
    if (importRecord) {
      this.inMemoryDb.importHistories.unshift(importRecord);
    }
    this.saveDatabase(this.inMemoryDb);
  }

  public updateStudent(userId: string, updates: Partial<Student>): boolean {
    const idx = this.inMemoryDb.students.findIndex((s) => s.userId === userId);
    if (idx === -1) return false;
    this.inMemoryDb.students[idx] = {
      ...this.inMemoryDb.students[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase(this.inMemoryDb);
    return true;
  }

  public assignStudentClass(userId: string, targetClass: CanonicalClass): boolean {
    return this.updateStudent(userId, { className: targetClass });
  }

  public batchAssignClass(userIds: string[], targetClass: CanonicalClass): number {
    let count = 0;
    const now = new Date().toISOString();
    this.inMemoryDb.students = this.inMemoryDb.students.map((s) => {
      if (userIds.includes(s.userId)) {
        count++;
        return {
          ...s,
          className: targetClass,
          updatedAt: now,
        };
      }
      return s;
    });
    if (count > 0) {
      this.saveDatabase(this.inMemoryDb);
    }
    return count;
  }

  public deleteStudent(userId: string): boolean {
    const beforeLen = this.inMemoryDb.students.length;
    this.inMemoryDb.students = this.inMemoryDb.students.filter((s) => s.userId !== userId);
    if (this.inMemoryDb.students.length !== beforeLen) {
      this.saveDatabase(this.inMemoryDb);
      return true;
    }
    return false;
  }

  public batchDeleteStudents(userIds: string[]): number {
    const beforeLen = this.inMemoryDb.students.length;
    this.inMemoryDb.students = this.inMemoryDb.students.filter((s) => !userIds.includes(s.userId));
    const deletedCount = beforeLen - this.inMemoryDb.students.length;
    if (deletedCount > 0) {
      this.saveDatabase(this.inMemoryDb);
    }
    return deletedCount;
  }

  public resetStudentAccessCode(userId: string, newHash: string, newPlainCode?: string): boolean {
    const updates: Partial<StudentRecord> = { accessCodeHash: newHash };
    if (newPlainCode) {
      updates.plainAccessCode = newPlainCode;
    }
    return this.updateStudent(userId, updates);
  }

  public getExistingStudentKeys(): Set<string> {
    const set = new Set<string>();
    this.inMemoryDb.students.forEach((s) => {
      set.add(`${s.fullName.toLowerCase()}::${s.className}`);
    });
    return set;
  }

  // --- Operasi Mapel & Konten ---
  public getSubjects(): Subject[] {
    return this.inMemoryDb.subjects;
  }

  public getMaterials(className?: string): LearningMaterial[] {
    let list = [...this.inMemoryDb.materials];
    if (className && className !== 'Semua') {
      list = list.filter((m) => m.className === 'Semua' || m.className === className);
    }
    return list;
  }

  public getAssignments(className?: string): Assignment[] {
    let list = [...this.inMemoryDb.assignments];
    if (className && className !== 'Semua') {
      list = list.filter((a) => a.className === 'Semua' || a.className === className);
    }
    return list;
  }

  // --- Operasi Log & Riwayat ---
  public logActivity(log: Omit<ActivityLog, 'logId' | 'timestamp'>): void {
    const newLog: ActivityLog = {
      ...log,
      logId: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
    };
    this.inMemoryDb.logs.unshift(newLog);
    if (this.inMemoryDb.logs.length > 200) {
      this.inMemoryDb.logs = this.inMemoryDb.logs.slice(0, 200);
    }
    this.saveDatabase(this.inMemoryDb);
  }

  public getRecentLogs(limit: number = 30): ActivityLog[] {
    return this.inMemoryDb.logs.slice(0, limit);
  }

  public getImportHistories(): ImportHistory[] {
    return this.inMemoryDb.importHistories;
  }
}

export const dbService = new DatabaseService();
