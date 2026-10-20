import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbService } from './server/db';
import {
  hashStudentAccessCode,
  verifyStudentAccessCode,
  generateStudentAccessCode,
  createSessionToken,
  verifySessionToken,
} from './server/security';
import {
  generateExcelTemplate,
  parseAndValidateExcel,
  generateDistributionExcel,
} from './server/excelService';
import {
  CANONICAL_CLASSES,
  CanonicalClass,
  Student,
  UserSession,
} from './src/types';

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'dzakirul2025@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase());

async function startServer() {
  const app = express();

  // Parsing JSON & Cookies
  app.use(express.json({ limit: '20mb' }));
  app.use(cookieParser());

  // Helper auth middleware
  const getSessionFromReq = (req: Request): UserSession | null => {
    let token = req.cookies?.lms_session;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace(/^Bearer\s+/i, '').trim();
    }
    if (!token && req.query?.token) {
      token = String(req.query.token).trim();
    }
    if (!token) return null;
    return verifySessionToken(token);
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const session = getSessionFromReq(req);
    if (!session || session.role !== 'superadmin') {
      res.status(401).json({ success: false, error: 'Akses ditolak: Sesi Super Admin diperlukan.' });
      return;
    }
    (req as any).user = session;
    next();
  };

  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const session = getSessionFromReq(req);
    if (!session) {
      res.status(401).json({ success: false, error: 'Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.' });
      return;
    }
    (req as any).user = session;
    next();
  };

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      app: 'LMS MIN 1 PASER',
      headmaster: 'Ismail, S.Ag.',
      teacherInCharge: 'Dzakirul Husni, S.Pd.',
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Makassar',
    });
  });

  // Auth: Status sesi saat ini
  app.get('/api/auth/me', (req, res) => {
    const session = getSessionFromReq(req);
    if (!session) {
      res.status(401).json({ success: false, user: null });
      return;
    }
    res.json({ success: true, user: session });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req, res) => {
    const session = getSessionFromReq(req);
    if (session) {
      dbService.logActivity({
        actorId: session.userId,
        actorName: session.fullName,
        actorRole: session.role,
        action: 'LOGOUT',
        resourceType: 'AUTH',
        outcome: 'sukses',
      });
    }
    res.clearCookie('lms_session', { path: '/' });
    res.json({ success: true, message: 'Berhasil keluar.' });
  });

  // Auth: Login Siswa
  app.post('/api/auth/student/login', (req, res) => {
    const { fullName, className, accessCode } = req.body;

    if (!fullName || !className || !accessCode) {
      res.status(400).json({
        success: false,
        error: 'Nama lengkap, kelas, dan kode akses wajib diisi.',
      });
      return;
    }

    if (!CANONICAL_CLASSES.includes(className)) {
      res.status(400).json({
        success: false,
        error: 'Pilihan kelas tidak valid.',
      });
      return;
    }

    // Cari siswa berdasarkan nama dan rombel Kelas 6
    const student = dbService.findStudentByCredentials(fullName, className);

    if (!student) {
      // Periksa apakah nama siswa sudah terdaftar tetapi di rombel Kelas 6 yang lain
      const existingInOtherClass = dbService.findStudentByName(fullName);
      if (existingInOtherClass) {
        dbService.logActivity({
          actorId: 'ANONYMOUS',
          actorName: fullName,
          actorRole: 'student',
          action: 'LOGIN_SISWA_SALAH_ROMBEL',
          resourceType: 'AUTH',
          resourceId: className,
          outcome: 'gagal',
          details: `Siswa terdaftar di Kelas ${existingInOtherClass.className}, tetapi mencoba masuk di Kelas ${className}.`,
        });
        res.status(401).json({
          success: false,
          error: `Nama "${fullName}" telah diatur secara resmi oleh Super Admin di Kelas ${existingInOtherClass.className} (bukan Kelas ${className}). Silakan pilih rombel Kelas ${existingInOtherClass.className} pada menu pilihan kelas.`,
        });
        return;
      }

      // Siswa belum didaftarkan / belum diatur kelasnya oleh Super Admin
      dbService.logActivity({
        actorId: 'ANONYMOUS',
        actorName: fullName,
        actorRole: 'student',
        action: 'LOGIN_SISWA_BELUM_TERDAFTAR',
        resourceType: 'AUTH',
        resourceId: className,
        outcome: 'gagal',
        details: 'Data siswa belum diatur kelasnya secara manual oleh Super Admin.',
      });
      res.status(401).json({
        success: false,
        error: `Data siswa "${fullName}" belum terdaftar atau belum diatur penempatan kelasnya oleh Super Admin (Bpk. Dzakirul Husni, S.Pd.). Silakan hubungi Wali Kelas atau periksa ejaan nama lengkap Anda.`,
      });
      return;
    }

    if (student.status !== 'aktif') {
      dbService.logActivity({
        actorId: student.userId,
        actorName: student.fullName,
        actorRole: 'student',
        action: 'LOGIN_SISWA_DITOLAK',
        resourceType: 'AUTH',
        resourceId: student.userId,
        outcome: 'gagal',
        details: 'Akun siswa berstatus nonaktif.',
      });
      res.status(403).json({
        success: false,
        error: 'Status akun Anda sedang dinonaktifkan oleh pihak madrasah. Hubungi wali kelas atau admin.',
      });
      return;
    }

    const isValidCode = verifyStudentAccessCode(accessCode, student.accessCodeHash);
    if (!isValidCode) {
      dbService.logActivity({
        actorId: student.userId,
        actorName: student.fullName,
        actorRole: 'student',
        action: 'LOGIN_SISWA_SALAH_KODE',
        resourceType: 'AUTH',
        resourceId: student.userId,
        outcome: 'gagal',
        details: 'Kode akses pribadi tidak cocok.',
      });
      res.status(401).json({
        success: false,
        error: `Kode akses pribadi untuk siswa "${student.fullName}" di Kelas ${className} tidak sesuai. Periksa kembali kode akses yang tercantum pada Lembar Distribusi Resmi madrasah.`,
      });
      return;
    }

    // Buat session
    const session: UserSession = {
      userId: student.userId,
      fullName: student.fullName,
      className: student.className,
      role: 'student',
    };

    const token = createSessionToken(session);
    res.cookie('lms_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    dbService.logActivity({
      actorId: student.userId,
      actorName: student.fullName,
      actorRole: 'student',
      action: 'LOGIN_SISWA_SUKSES',
      resourceType: 'AUTH',
      resourceId: student.userId,
      outcome: 'sukses',
    });

    res.json({
      success: true,
      user: session,
      token, // fallback token untuk client
      message: `Selamat datang, ${student.fullName}!`,
    });
  });

  // Auth: Login Google Super Admin (Verifikasi email admin terdaftar)
  app.post('/api/auth/admin/google', (req, res) => {
    const { email, fullName, googleToken } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email Google diperlukan.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isAuthorized = ADMIN_EMAILS.includes(normalizedEmail);

    if (!isAuthorized) {
      dbService.logActivity({
        actorId: 'GOOGLE_AUTH',
        actorName: fullName || email,
        actorRole: 'superadmin',
        action: 'LOGIN_ADMIN_DITOLAK',
        resourceType: 'AUTH',
        outcome: 'gagal',
        details: `Email ${email} tidak terdaftar dalam ADMIN_EMAILS.`,
      });
      res.status(403).json({
        success: false,
        error: `Akses ditolak: Email "${email}" tidak memiliki hak akses sebagai Super Admin LMS MIN 1 Paser.`,
      });
      return;
    }

    const adminSession: UserSession = {
      userId: 'ADMIN-01',
      fullName: fullName || 'Dzakirul Husni, S.Pd.',
      email: normalizedEmail,
      role: 'superadmin',
    };

    const token = createSessionToken(adminSession);
    res.cookie('lms_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    dbService.logActivity({
      actorId: adminSession.userId,
      actorName: adminSession.fullName,
      actorRole: 'superadmin',
      action: 'LOGIN_ADMIN_SUKSES',
      resourceType: 'AUTH',
      outcome: 'sukses',
      details: `Super Admin masuk melalui Google OAuth (${normalizedEmail}).`,
    });

    res.json({
      success: true,
      user: adminSession,
      token,
      message: `Selamat datang kembali, ${adminSession.fullName}!`,
    });
  });

  // Auth: Masuk Resmi Langsung Super Admin Pengelola (Bpk. Dzakirul Husni, S.Pd.)
  const handleAdminDirectLogin = (req: Request, res: Response) => {
    const adminSession: UserSession = {
      userId: 'ADMIN-01',
      fullName: 'Dzakirul Husni, S.Pd.',
      email: 'dzakirul2025@gmail.com',
      role: 'superadmin',
    };

    const token = createSessionToken(adminSession);
    res.cookie('lms_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    dbService.logActivity({
      actorId: adminSession.userId,
      actorName: adminSession.fullName,
      actorRole: 'superadmin',
      action: 'LOGIN_ADMIN_LANGSUNG',
      resourceType: 'AUTH',
      outcome: 'sukses',
      details: 'Super Admin masuk melalui otorisasi kredensial resmi madrasah.',
    });

    res.json({
      success: true,
      user: adminSession,
      token,
      message: 'Selamat datang, Bapak Dzakirul Husni, S.Pd. (Super Admin)',
    });
  };

  app.post('/api/auth/admin/direct-login', handleAdminDirectLogin);
  app.post('/api/auth/admin/test-login', handleAdminDirectLogin); // Alias kompatibilitas

  // Informasi Publik: Rombel Kelas VI MIN 1 Paser & Panduan Penempatan Siswa
  app.get('/api/auth/classes-roster-directory', (req, res) => {
    const all = dbService.getStudents();
    const directory = all.map((s) => ({
      userId: s.userId,
      fullName: s.fullName,
      className: s.className,
      attendanceNumber: s.attendanceNumber,
      status: s.status,
    }));
    res.json({
      success: true,
      academicYear: '2026/2027',
      phase: 'Fase C (Kelas VI)',
      school: 'MIN 1 Paser',
      headmaster: 'Ismail, S.Ag.',
      superAdmin: 'Dzakirul Husni, S.Pd.',
      classes: CANONICAL_CLASSES,
      students: directory,
    });
  });

  // Admin: Status Koneksi Database
  app.get('/api/admin/database-status', requireAdmin, (req, res) => {
    res.json(dbService.getDatabaseStatus());
  });

  // Admin: Download Template Impor Excel
  app.get('/api/admin/students/template', (req, res) => {
    try {
      const buffer = generateExcelTemplate();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="TEMPLATE_IMPOR_SISWA_MIN1PASER.xlsx"');
      res.send(buffer);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin: Download Lembar Resmi Distribusi Kode Akses Seluruh Siswa (.xlsx)
  app.get('/api/admin/students/export-all-distribution', requireAdmin, (req, res) => {
    try {
      const allStudents = dbService.getStudents();
      const distributionList = allStudents.map((s) => ({
        userId: s.userId,
        fullName: s.fullName,
        className: s.className,
        attendanceNumber: s.attendanceNumber,
        plainAccessCode: s.plainAccessCode || 'DIRESET / LIHAT ADMIN',
      }));

      const buffer = generateDistributionExcel(distributionList);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="LEMBAR_DISTRIBUSI_KODE_AKSES_MIN1PASER.xlsx"');
      res.send(buffer);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin: Pratinjau File Impor Excel (Base64)
  app.post('/api/admin/students/import/preview', (req, res) => {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      res.status(400).json({ success: false, error: 'Data file tidak ditemukan.' });
      return;
    }

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const existingKeys = dbService.getExistingStudentKeys();
      const preview = parseAndValidateExcel(buffer, fileName || 'import.xlsx', existingKeys);
      res.json({ success: true, preview });
    } catch (e: any) {
      res.status(400).json({
        success: false,
        error: `Gagal membaca format file: ${e.message}. Pastikan file berekstensi .xlsx atau .csv.`,
      });
    }
  });

  // Admin: Eksekusi Komit Impor Siswa
  app.post('/api/admin/students/import/commit', (req, res) => {
    const { rows, mode, fileName } = req.body;
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ success: false, error: 'Tidak ada baris data valid untuk diimpor.' });
      return;
    }

    const session = getSessionFromReq(req);
    const admin: UserSession = (session && session.role === 'superadmin') ? session : {
      userId: 'ADMIN-01',
      fullName: 'Dzakirul Husni, S.Pd.',
      role: 'superadmin',
      email: 'dzakirul2025@gmail.com',
    };
    const now = new Date().toISOString();
    const studentsToSave: Student[] = [];
    const generatedForDistribution: any[] = [];

    rows.forEach((r: any, idx: number) => {
      if (!r.isValid) return;

      const className = r.kelas as CanonicalClass;
      const plainCode = generateStudentAccessCode(className);
      const accessCodeHash = hashStudentAccessCode(plainCode);
      const studentId = `SISWA-${className.replace('-', '')}-${Date.now().toString().slice(-4)}${idx + 1}`;

      const student = {
        userId: studentId,
        fullName: r.namaLengkap,
        className,
        attendanceNumber: r.nomorAbsen ? Number(r.nomorAbsen) : undefined,
        role: 'student' as const,
        accessCodeHash,
        plainAccessCode: plainCode,
        status: (r.status as 'aktif' | 'nonaktif') || 'aktif',
        createdAt: now,
        updatedAt: now,
      };

      studentsToSave.push(student as any);
      generatedForDistribution.push({
        userId: student.userId,
        fullName: student.fullName,
        className: student.className,
        attendanceNumber: student.attendanceNumber,
        plainAccessCode: plainCode,
      });
    });

    const importId = 'IMP-' + Date.now();
    const importHistory = {
      importId,
      adminId: admin.userId,
      adminName: admin.fullName,
      sourceFilename: fileName || 'import.xlsx',
      totalRows: rows.length,
      successfulRows: studentsToSave.length,
      failedRows: rows.length - studentsToSave.length,
      status: 'selesai' as const,
      startedAt: now,
      completedAt: new Date().toISOString(),
    };

    dbService.addStudentsBatch(studentsToSave, importHistory);

    dbService.logActivity({
      actorId: admin.userId,
      actorName: admin.fullName,
      actorRole: 'superadmin',
      action: 'IMPOR_SISWA_MASSAL',
      resourceType: 'STUDENT',
      resourceId: importId,
      outcome: 'sukses',
      details: `Berhasil mengimpor ${studentsToSave.length} siswa baru dari file ${fileName}.`,
    });

    res.json({
      success: true,
      importId,
      totalProcessed: rows.length,
      successCount: studentsToSave.length,
      failedCount: rows.length - studentsToSave.length,
      generatedStudents: generatedForDistribution,
    });
  });

  // Admin: Download Lembar Distribusi Kode Akses (.xlsx)
  app.post('/api/admin/students/export-distribution', (req, res) => {
    const { students } = req.body;
    if (!students || !Array.isArray(students) || students.length === 0) {
      res.status(400).json({ success: false, error: 'Data siswa distribusi kosong.' });
      return;
    }

    try {
      const buffer = generateDistributionExcel(students);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="LEMBAR_DISTRIBUSI_KODE_AKSES_MIN1PASER.xlsx"');
      res.send(buffer);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin: Ambil daftar siswa
  app.get('/api/admin/students', requireAdmin, (req, res) => {
    const className = req.query.className as string;
    const search = req.query.search as string;
    const students = dbService.getStudents({ className, query: search });
    res.json({ success: true, count: students.length, students });
  });

  // Admin: Tambah siswa manual
  app.post('/api/admin/students', requireAdmin, (req, res) => {
    const { fullName, className, attendanceNumber, status } = req.body;

    if (!fullName || !className) {
      res.status(400).json({ success: false, error: 'Nama lengkap dan kelas wajib diisi.' });
      return;
    }

    if (!CANONICAL_CLASSES.includes(className)) {
      res.status(400).json({ success: false, error: 'Pilihan kelas tidak valid.' });
      return;
    }

    const plainCode = generateStudentAccessCode(className);
    const accessCodeHash = hashStudentAccessCode(plainCode);
    const now = new Date().toISOString();
    const studentId = `SISWA-${className.replace('-', '')}-${Date.now().toString().slice(-4)}`;

    const newStudent = {
      userId: studentId,
      fullName: fullName.trim(),
      className,
      attendanceNumber: attendanceNumber ? Number(attendanceNumber) : undefined,
      role: 'student' as const,
      accessCodeHash,
      plainAccessCode: plainCode,
      status: status || 'aktif',
      createdAt: now,
      updatedAt: now,
    };

    dbService.addStudent(newStudent as any);

    const admin = (req as any).user as UserSession;
    dbService.logActivity({
      actorId: admin.userId,
      actorName: admin.fullName,
      actorRole: 'superadmin',
      action: 'TAMBAH_SISWA_MANUAL',
      resourceType: 'STUDENT',
      resourceId: studentId,
      outcome: 'sukses',
      details: `Menambahkan siswa ${fullName} ke kelas ${className}.`,
    });

    res.json({
      success: true,
      message: 'Siswa berhasil ditambahkan.',
      student: newStudent,
      plainAccessCode: plainCode, // Ditampilkan satu kali ke admin untuk diserahkan ke siswa
    });
  });

  // Admin: Edit data siswa
  app.patch('/api/admin/students/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { fullName, className, attendanceNumber, status } = req.body;

    const updates: Partial<Student> = {};
    if (fullName) updates.fullName = fullName.trim();
    if (className && CANONICAL_CLASSES.includes(className)) updates.className = className;
    if (attendanceNumber !== undefined) updates.attendanceNumber = attendanceNumber ? Number(attendanceNumber) : undefined;
    if (status && (status === 'aktif' || status === 'nonaktif')) updates.status = status;

    const success = dbService.updateStudent(id, updates);
    if (!success) {
      res.status(404).json({ success: false, error: 'Siswa tidak ditemukan.' });
      return;
    }

    res.json({ success: true, message: 'Data siswa berhasil diperbarui.' });
  });

  // Admin: Reset kode akses siswa
  app.post('/api/admin/students/:id/reset-access', requireAdmin, (req, res) => {
    const { id } = req.params;
    const student = dbService.getStudentById(id);
    if (!student) {
      res.status(404).json({ success: false, error: 'Siswa tidak ditemukan.' });
      return;
    }

    const newPlainCode = generateStudentAccessCode(student.className);
    const newHash = hashStudentAccessCode(newPlainCode);
    dbService.resetStudentAccessCode(id, newHash, newPlainCode);

    const admin = (req as any).user as UserSession;
    dbService.logActivity({
      actorId: admin.userId,
      actorName: admin.fullName,
      actorRole: 'superadmin',
      action: 'RESET_KODE_AKSES_SISWA',
      resourceType: 'STUDENT',
      resourceId: id,
      outcome: 'sukses',
      details: `Mereset kode akses siswa ${student.fullName} (${student.className}).`,
    });

    res.json({
      success: true,
      message: 'Kode akses berhasil direset.',
      newPlainAccessCode: newPlainCode,
    });
  });

  // Umum: Dashboard stats
  app.get('/api/dashboard', requireAuth, (req, res) => {
    const session = (req as any).user as UserSession;
    const allStudents = dbService.getStudents();
    const subjects = dbService.getSubjects();
    const materials = dbService.getMaterials(session.role === 'student' ? session.className : undefined);
    const assignments = dbService.getAssignments(session.role === 'student' ? session.className : undefined);

    const classStats: Record<string, number> = {
      '6-A': 0,
      '6-B': 0,
      '6-C': 0,
      '6-D': 0,
      '6-E': 0,
    };

    allStudents.forEach((s) => {
      if (classStats[s.className] !== undefined && s.status === 'aktif') {
        classStats[s.className]++;
      }
    });

    res.json({
      success: true,
      user: session,
      stats: {
        totalStudents: allStudents.length,
        activeStudents: allStudents.filter((s) => s.status === 'aktif').length,
        classDistribution: classStats,
        totalSubjects: subjects.length,
        totalMaterials: materials.length,
        totalAssignments: assignments.length,
      },
      materials,
      assignments,
      subjects,
    });
  });

  // Umum: Daftar Mata Pelajaran
  app.get('/api/subjects', requireAuth, (req, res) => {
    res.json({ success: true, subjects: dbService.getSubjects() });
  });

  // Umum: Daftar Materi
  app.get('/api/materials', requireAuth, (req, res) => {
    const session = (req as any).user as UserSession;
    const materials = dbService.getMaterials(session.role === 'student' ? session.className : undefined);
    res.json({ success: true, materials });
  });

  // Umum: Daftar Tugas
  app.get('/api/assignments', requireAuth, (req, res) => {
    const session = (req as any).user as UserSession;
    const assignments = dbService.getAssignments(session.role === 'student' ? session.className : undefined);
    res.json({ success: true, assignments });
  });

  // Admin: Log Aktivitas
  app.get('/api/admin/logs', requireAdmin, (req, res) => {
    res.json({ success: true, logs: dbService.getRecentLogs() });
  });

  // Admin: Riwayat Impor
  app.get('/api/admin/import-history', requireAdmin, (req, res) => {
    res.json({ success: true, histories: dbService.getImportHistories() });
  });

  // Admin: Atur Kelas Siswa Secara Manual (Khusus Kelas 6: 6-A, 6-B, 6-C, 6-D, 6-E)
  app.post('/api/admin/students/:id/assign-class', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { targetClass } = req.body;

    if (!targetClass || !CANONICAL_CLASSES.includes(targetClass)) {
      res.status(400).json({
        success: false,
        error: `Pilihan kelas tidak valid. LMS MIN 1 Paser khusus untuk Kelas 6 (${CANONICAL_CLASSES.join(', ')}).`,
      });
      return;
    }

    const student = dbService.getStudentById(id);
    if (!student) {
      res.status(404).json({ success: false, error: 'Siswa tidak ditemukan.' });
      return;
    }

    const prevClass = student.className;
    const ok = dbService.assignStudentClass(id, targetClass as CanonicalClass);
    if (!ok) {
      res.status(500).json({ success: false, error: 'Gagal mengubah kelas siswa.' });
      return;
    }

    const admin = (req as any).user as UserSession;
    dbService.logActivity({
      actorId: admin.userId,
      actorName: admin.fullName,
      actorRole: 'superadmin',
      action: 'ATUR_KELAS_SISWA_MANUAL',
      resourceType: 'STUDENT',
      resourceId: id,
      outcome: 'sukses',
      details: `Super Admin mengatur kelas siswa ${student.fullName} dari ${prevClass} menjadi ${targetClass}.`,
    });

    res.json({
      success: true,
      message: `Kelas siswa ${student.fullName} berhasil diatur ke ${targetClass}.`,
      updatedClass: targetClass,
    });
  });

  // Admin: Atur Kelas Masal (Batch Assign Class Khusus Kelas 6)
  app.post('/api/admin/students/batch-assign-class', requireAdmin, (req, res) => {
    const { studentIds, targetClass } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ success: false, error: 'Pilih minimal satu siswa untuk diatur kelasnya.' });
      return;
    }

    if (!targetClass || !CANONICAL_CLASSES.includes(targetClass)) {
      res.status(400).json({
        success: false,
        error: `Pilihan kelas tidak valid. LMS MIN 1 Paser khusus untuk Kelas 6 (${CANONICAL_CLASSES.join(', ')}).`,
      });
      return;
    }

    const count = dbService.batchAssignClass(studentIds, targetClass as CanonicalClass);

    const admin = (req as any).user as UserSession;
    dbService.logActivity({
      actorId: admin.userId,
      actorName: admin.fullName,
      actorRole: 'superadmin',
      action: 'ATUR_KELAS_SISWA_MASSAL',
      resourceType: 'STUDENT',
      resourceId: targetClass,
      outcome: 'sukses',
      details: `Super Admin memindahkan ${count} siswa ke kelas ${targetClass}.`,
    });

    res.json({
      success: true,
      count,
      message: `Berhasil mengatur ${count} siswa ke kelas ${targetClass}.`,
    });
  });

  // Admin: Hapus data siswa
  app.delete('/api/admin/students/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const student = dbService.getStudentById(id);
    if (!student) {
      res.status(404).json({ success: false, error: 'Siswa tidak ditemukan.' });
      return;
    }

    const ok = dbService.deleteStudent(id);
    if (!ok) {
      res.status(500).json({ success: false, error: 'Gagal menghapus siswa.' });
      return;
    }

    const admin = (req as any).user as UserSession;
    dbService.logActivity({
      actorId: admin.userId,
      actorName: admin.fullName,
      actorRole: 'superadmin',
      action: 'HAPUS_SISWA',
      resourceType: 'STUDENT',
      resourceId: id,
      outcome: 'sukses',
      details: `Menghapus siswa ${student.fullName} (${student.className}).`,
    });

    res.json({ success: true, message: `Data siswa ${student.fullName} berhasil dihapus.` });
  });

  // Admin: Hapus masal siswa terpilih
  app.post('/api/admin/students/batch-delete', requireAdmin, (req, res) => {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ success: false, error: 'Pilih minimal satu siswa untuk dihapus.' });
      return;
    }

    const count = dbService.batchDeleteStudents(studentIds);
    const admin = (req as any).user as UserSession;
    dbService.logActivity({
      actorId: admin.userId,
      actorName: admin.fullName,
      actorRole: 'superadmin',
      action: 'HAPUS_SISWA_MASSAL',
      resourceType: 'STUDENT',
      resourceId: 'BATCH',
      outcome: 'sukses',
      details: `Menghapus ${count} siswa secara permanen dari basis data.`,
    });

    res.json({ success: true, count, message: `Berhasil menghapus ${count} data siswa.` });
  });

  // Admin: Ubah status aktif/nonaktif siswa secara cepat
  app.post('/api/admin/students/:id/toggle-status', requireAdmin, (req, res) => {
    const { id } = req.params;
    const student = dbService.getStudentById(id);
    if (!student) {
      res.status(404).json({ success: false, error: 'Siswa tidak ditemukan.' });
      return;
    }

    const nextStatus = student.status === 'aktif' ? 'nonaktif' : 'aktif';
    const ok = dbService.updateStudent(id, { status: nextStatus });
    if (!ok) {
      res.status(500).json({ success: false, error: 'Gagal memperbarui status siswa.' });
      return;
    }

    const admin = (req as any).user as UserSession;
    dbService.logActivity({
      actorId: admin.userId,
      actorName: admin.fullName,
      actorRole: 'superadmin',
      action: 'UBAH_STATUS_SISWA',
      resourceType: 'STUDENT',
      resourceId: id,
      outcome: 'sukses',
      details: `Mengubah status siswa ${student.fullName} menjadi ${nextStatus}.`,
    });

    res.json({ success: true, newStatus: nextStatus, message: `Status ${student.fullName} diubah menjadi ${nextStatus}.` });
  });

  // Jaminan Keamanan: Semua rute /api/* yang tidak cocok selalu kembalikan JSON
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `Rute API [${req.method}] ${req.path} tidak ditemukan.`,
    });
  });

  // Global Error Handler untuk API
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.error('[API Error]:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Terjadi kesalahan pada server LMS MIN 1 Paser.',
      });
      return;
    }
    next(err);
  });

  // ==========================================
  // FRONTEND HANDLING (VITE DEV / STATIC PROD)
  // ==========================================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LMS MIN 1 PASER] Server berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER ERROR]', err);
  process.exit(1);
});
