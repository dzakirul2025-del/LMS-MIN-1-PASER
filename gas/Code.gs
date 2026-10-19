/**
 * ============================================================================
 * LMS MIN 1 PASER - GOOGLE APPS SCRIPT BACKEND
 * Sistem Manajemen Pembelajaran Digital Terpadu Madrasah Ibtidaiyah Kelas VI
 * Penanggung Jawab: Dzakirul Husni, S.Pd. & Ismail, S.Ag.
 * Zona Waktu: Asia/Makassar
 * ============================================================================
 */

// Definisi 17 Sheets dan Header Kanonis Sesuai Spesifikasi Bagian 8
var SCHEMA_DEFINITIONS = {
  "PENGATURAN": ["setting_key", "setting_value", "updated_at"],
  "PENGGUNA": ["user_id", "full_name", "class_name", "role", "access_code_hash", "status", "created_at", "updated_at"],
  "MAPEL": ["subject_id", "subject_name", "description", "status"],
  "PERANGKAT_AJAR": ["resource_id", "subject_id", "class_name", "semester", "resource_type", "title", "description", "cp", "tp", "atp", "file_id", "status", "created_at", "updated_at"],
  "MATERI": ["material_id", "subject_id", "class_name", "title", "content", "learning_objective", "media_url", "status", "published_at", "updated_at"],
  "MEDIA": ["media_id", "subject_id", "title", "media_type", "description", "file_id", "external_url", "status"],
  "DOKUMEN": ["document_id", "title", "category", "file_id", "mime_type", "class_name", "access_scope", "status", "created_at"],
  "TUGAS": ["assignment_id", "title", "subject_id", "class_name", "instructions", "due_at", "attachment_id", "status", "created_at"],
  "PENGUMPULAN_TUGAS": ["submission_id", "assignment_id", "student_id", "submitted_at", "answer_text", "attachment_id", "score", "feedback", "status"],
  "BANK_SOAL": ["question_id", "subject_id", "topic", "question_type", "difficulty", "question_text", "options_json", "answer_key", "explanation", "score_weight", "status"],
  "ASESMEN": ["assessment_id", "title", "subject_id", "class_name", "duration_minutes", "start_at", "end_at", "attempts_allowed", "question_count", "shuffle_questions", "shuffle_options", "result_release_policy", "status"],
  "ASESMEN_SOAL": ["assessment_question_id", "assessment_id", "question_id", "question_order", "score_weight"],
  "HASIL_CBT": ["attempt_id", "assessment_id", "student_id", "started_at", "submitted_at", "answers_json", "score", "status", "graded_at"],
  "PROGRES": ["progress_id", "student_id", "material_id", "status", "started_at", "completed_at", "last_position"],
  "PENGUMUMAN": ["announcement_id", "title", "content", "target_class", "publish_at", "status"],
  "LOG_AKTIVITAS": ["log_id", "actor_id", "actor_role", "action", "resource_type", "resource_id", "timestamp", "outcome"],
  "RIWAYAT_IMPOR": ["import_id", "admin_id", "source_filename", "total_rows", "successful_rows", "failed_rows", "status", "started_at", "completed_at", "report_reference"]
};

/**
 * Inisialisasi atau pembaruan idempoten seluruh struktur spreadsheet
 */
function setupDatabase() {
  var ss = getSpreadsheet();
  var sheetNames = Object.keys(SCHEMA_DEFINITIONS);
  var created = [];
  var preserved = [];

  sheetNames.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    var expectedHeaders = SCHEMA_DEFINITIONS[sheetName];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(expectedHeaders);
      // Format header
      var headerRange = sheet.getRange(1, 1, 1, expectedHeaders.length);
      headerRange.setBackground("#116B3A");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
      created.push(sheetName);
    } else {
      // Periksa header baris pertama tanpa menghapus data
      var lastCol = sheet.getLastColumn();
      if (lastCol === 0) {
        sheet.appendRow(expectedHeaders);
        var hr = sheet.getRange(1, 1, 1, expectedHeaders.length);
        hr.setBackground("#116B3A");
        hr.setFontColor("#FFFFFF");
        hr.setFontWeight("bold");
        sheet.setFrozenRows(1);
      }
      preserved.push(sheetName);
    }
  });

  // Hapus sheet default "Sheet1" jika ada dan kosong
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }

  // Tanam pengaturan awal jika kosong
  var settingsSheet = ss.getSheetByName("PENGATURAN");
  if (settingsSheet && settingsSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    var defaultSettings = [
      ["APP_NAME", "LMS MIN 1 PASER", now],
      ["SUBTITLE", "Platform Manajemen Pembelajaran Digital Terpadu Kelas VI MI", now],
      ["SCHOOL_NAME", "MIN 1 Paser", now],
      ["HEADMASTER", "Ismail, S.Ag.", now],
      ["TEACHER_IN_CHARGE", "Dzakirul Husni, S.Pd.", now],
      ["TIMEZONE", "Asia/Makassar", now],
      ["VERSION", "1.0.0", now]
    ];
    defaultSettings.forEach(function(row) {
      settingsSheet.appendRow(row);
    });
  }

  return {
    success: true,
    message: "setupDatabase() berhasil dijalankan secara idempoten.",
    createdSheets: created,
    preservedSheets: preserved,
    totalSheets: sheetNames.length
  };
}

/**
 * Mengambil objek spreadsheet aktif
 */
function getSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty("SPREADSHEET_ID");
  if (sheetId && sheetId.trim() !== "") {
    return SpreadsheetApp.openById(sheetId.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Validasi token rahasia server-to-server
 */
function verifySecret(requestSecret) {
  var props = PropertiesService.getScriptProperties();
  var configuredSecret = props.getProperty("LMS_API_SECRET");
  if (!configuredSecret) {
    return false; // Wajib diset di Script Properties
  }
  return requestSecret === configuredSecret;
}

/**
 * Endpoint HTTP GET (Health check & status)
 */
function doGet(e) {
  var responseData = {
    app: "LMS MIN 1 PASER",
    service: "Google Apps Script Backend API",
    status: "READY",
    timestamp: new Date().toISOString(),
    timezone: "Asia/Makassar"
  };
  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Endpoint HTTP POST untuk operasi server-to-server
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // Tunggu hingga 15 detik jika ada operasi concurrent
  } catch (lockError) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Sistem sedang sibuk memproses permintaan lain. Silakan coba kembali."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Payload kosong"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var secret = payload.secret;
    var action = payload.action;

    // Verifikasi keamanan request
    if (!verifySecret(secret)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Otorisasi server-to-server ditolak: Secret tidak valid."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var result = { success: false, error: "Action tidak dikenal: " + action };

    switch (action) {
      case "health":
        result = { success: true, message: "Koneksi Google Apps Script terverifikasi aktif." };
        break;

      case "setupDatabase":
        result = setupDatabase();
        break;

      case "getStudents":
        result = handleGetStudents(payload);
        break;

      case "createStudent":
        result = handleCreateStudent(payload);
        break;

      case "batchImportStudents":
        result = handleBatchImportStudents(payload);
        break;

      case "resetStudentAccess":
        result = handleResetStudentAccess(payload);
        break;

      case "updateStudent":
        result = handleUpdateStudent(payload);
        break;

      case "logActivity":
        result = handleLogActivity(payload);
        break;

      default:
        result = { success: false, error: "Action '" + action + "' belum diimplementasikan." };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function handleGetStudents(payload) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName("PENGGUNA");
  if (!sheet) return { success: false, error: "Sheet PENGGUNA belum ada. Jalankan setupDatabase." };

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, students: [] };

  var headers = data[0];
  var students = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[3] === "student") {
      students.push({
        userId: row[0],
        fullName: row[1],
        className: row[2],
        role: row[3],
        accessCodeHash: row[4],
        status: row[5],
        createdAt: row[6],
        updatedAt: row[7]
      });
    }
  }

  return { success: true, students: students };
}

function handleCreateStudent(payload) {
  var student = payload.student;
  if (!student || !student.fullName || !student.className) {
    return { success: false, error: "Data siswa tidak lengkap." };
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName("PENGGUNA");
  var now = new Date().toISOString();

  sheet.appendRow([
    student.userId,
    student.fullName,
    student.className,
    "student",
    student.accessCodeHash,
    student.status || "aktif",
    now,
    now
  ]);

  return { success: true, message: "Siswa berhasil ditambahkan." };
}

function handleBatchImportStudents(payload) {
  var students = payload.students;
  if (!students || !Array.isArray(students) || students.length === 0) {
    return { success: false, error: "Daftar siswa impor kosong." };
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName("PENGGUNA");
  var now = new Date().toISOString();
  var rowsToAppend = [];

  students.forEach(function(s) {
    rowsToAppend.push([
      s.userId,
      s.fullName,
      s.className,
      "student",
      s.accessCodeHash,
      s.status || "aktif",
      now,
      now
    ]);
  });

  if (rowsToAppend.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    var range = sheet.getRange(startRow, 1, rowsToAppend.length, 8);
    range.setValues(rowsToAppend);
  }

  // Catat ke RIWAYAT_IMPOR
  var importSheet = ss.getSheetByName("RIWAYAT_IMPOR");
  if (importSheet) {
    importSheet.appendRow([
      payload.importId || ("IMP-" + new Date().getTime()),
      payload.adminId || "ADMIN",
      payload.sourceFilename || "import.xlsx",
      students.length,
      students.length,
      0,
      "selesai",
      now,
      now,
      "Batch import selesai"
    ]);
  }

  return {
    success: true,
    insertedCount: rowsToAppend.length,
    message: "Berhasil mengimpor " + rowsToAppend.length + " siswa."
  };
}

function handleResetStudentAccess(payload) {
  var userId = payload.userId;
  var newHash = payload.newAccessCodeHash;
  if (!userId || !newHash) return { success: false, error: "Parameter tidak lengkap." };

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName("PENGGUNA");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      sheet.getRange(i + 1, 5).setValue(newHash);
      sheet.getRange(i + 1, 8).setValue(new Date().toISOString());
      return { success: true, message: "Kode akses berhasil direset." };
    }
  }

  return { success: false, error: "Siswa dengan ID " + userId + " tidak ditemukan." };
}

function handleUpdateStudent(payload) {
  var student = payload.student;
  if (!student || !student.userId) return { success: false, error: "userId diperlukan." };

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName("PENGGUNA");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === student.userId) {
      if (student.fullName) sheet.getRange(i + 1, 2).setValue(student.fullName);
      if (student.className) sheet.getRange(i + 1, 3).setValue(student.className);
      if (student.status) sheet.getRange(i + 1, 6).setValue(student.status);
      sheet.getRange(i + 1, 8).setValue(new Date().toISOString());
      return { success: true, message: "Data siswa berhasil diperbarui." };
    }
  }

  return { success: false, error: "Siswa tidak ditemukan." };
}

function handleLogActivity(payload) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName("LOG_AKTIVITAS");
  if (!sheet) return { success: false, error: "Sheet LOG_AKTIVITAS belum ada." };

  sheet.appendRow([
    "LOG-" + new Date().getTime(),
    payload.actorId || "SYSTEM",
    payload.actorRole || "system",
    payload.action || "UNKNOWN",
    payload.resourceType || "APP",
    payload.resourceId || "",
    new Date().toISOString(),
    payload.outcome || "sukses"
  ]);

  return { success: true };
}
