import * as XLSX from 'xlsx';
import { CanonicalClass, CANONICAL_CLASSES, ExcelImportRow, ImportPreviewResult } from '../src/types';

/**
 * Buat buffer template resmi TEMPLATE_IMPOR_SISWA_MIN1PASER.xlsx
 */
export function generateExcelTemplate(): Buffer {
  const wb = XLSX.utils.book_new();

  // Header dan contoh data
  const data: any[][] = [
    ['nama_lengkap', 'kelas', 'nomor_absen', 'status'],
    ['Ahmad Fauzan', '6-A', 1, 'aktif'],
    ['Siti Nur Aisyah', '6-B', 1, 'aktif'],
    ['Muhammad Rizky', '6-C', 1, 'aktif'],
    ['Fatima Zahra', '6-D', 1, 'aktif'],
    ['Bilal Al-Farisi', '6-E', 1, 'aktif'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set lebar kolom
  ws['!cols'] = [
    { wch: 30 }, // nama_lengkap
    { wch: 12 }, // kelas
    { wch: 15 }, // nomor_absen
    { wch: 12 }, // status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'DATA_SISWA');

  // Sheet Petunjuk Pengisian
  const guideData = [
    ['PETUNJUK PENGISIAN TEMPLATE IMPOR SISWA MIN 1 PASER'],
    ['1. Kolom "nama_lengkap" wajib diisi dengan nama lengkap siswa.'],
    ['2. Kolom "kelas" hanya menerima pilihan kanonis: 6-A, 6-B, 6-C, 6-D, atau 6-E.'],
    ['3. Kolom "nomor_absen" disarankan berupa angka urut absen siswa di kelas masing-masing.'],
    ['4. Kolom "status" bersifat opsional: isi "aktif" atau "nonaktif" (default: aktif).'],
    ['5. Jangan mengubah nama header di baris 1.'],
    ['6. Setelah diimpor, sistem akan secara otomatis membuatkan kode akses unik untuk setiap siswa.'],
  ];
  const guideWs = XLSX.utils.aoa_to_sheet(guideData);
  guideWs['!cols'] = [{ wch: 75 }];
  XLSX.utils.book_append_sheet(wb, guideWs, 'PETUNJUK');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Hasilkan data demo siap impor untuk 5 kelas (6-A s/d 6-E)
 */
export function getDemoImportRows(existingStudentNames: Set<string>): ImportPreviewResult {
  const demoList = [
    { namaLengkap: 'Muhammad Fauzan Azhima', kelas: '6-A', nomorAbsen: 2, status: 'aktif' },
    { namaLengkap: 'Nur Halimah Syabaniyah', kelas: '6-A', nomorAbsen: 3, status: 'aktif' },
    { namaLengkap: 'Zaidan Athallah Putra', kelas: '6-B', nomorAbsen: 2, status: 'aktif' },
    { namaLengkap: 'Rayyan Al-Ghifari', kelas: '6-B', nomorAbsen: 3, status: 'aktif' },
    { namaLengkap: 'Annisa Shaliha Zahirah', kelas: '6-C', nomorAbsen: 2, status: 'aktif' },
    { namaLengkap: 'Hafiz Al-Baqir Paser', kelas: '6-C', nomorAbsen: 3, status: 'aktif' },
    { namaLengkap: 'Syifa Nur Fadhilah', kelas: '6-D', nomorAbsen: 2, status: 'aktif' },
    { namaLengkap: 'Ibrahim Maulana Akbar', kelas: '6-D', nomorAbsen: 3, status: 'aktif' },
    { namaLengkap: 'Kayla Azzahra Humaira', kelas: '6-E', nomorAbsen: 2, status: 'aktif' },
    { namaLengkap: 'Fajar Siddiq Al-Mansyur', kelas: '6-E', nomorAbsen: 3, status: 'aktif' },
  ];

  const rows: ExcelImportRow[] = [];
  const seenInFile = new Set<string>();
  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;

  demoList.forEach((item, idx) => {
    const rowNumber = idx + 2;
    const errors: string[] = [];
    const uniqueKey = `${item.namaLengkap.toLowerCase()}::${item.kelas}`;

    let isDuplicate = false;
    if (seenInFile.has(uniqueKey) || existingStudentNames.has(uniqueKey)) {
      isDuplicate = true;
      errors.push('Siswa dengan nama dan kelas ini sudah terdaftar di sistem');
      duplicateCount++;
    }
    seenInFile.add(uniqueKey);

    const isValid = errors.length === 0;
    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }

    rows.push({
      rowNumber,
      namaLengkap: item.namaLengkap,
      kelas: item.kelas,
      nomorAbsen: item.nomorAbsen,
      status: item.status,
      isValid,
      errors,
      isDuplicate,
    });
  });

  return {
    fileName: 'DEMO_DATA_SISWA_KELAS_6_MIN1PASER.xlsx',
    totalRows: demoList.length,
    validRows: validCount,
    invalidRows: invalidCount,
    duplicateRows: duplicateCount,
    rows,
  };
}

/**
 * Parse dan validasi buffer file Excel/CSV sebelum impor
 */
export function parseAndValidateExcel(
  fileBuffer: Buffer,
  fileName: string,
  existingStudentNames: Set<string>
): ImportPreviewResult {
  const wb = XLSX.read(fileBuffer, { type: 'buffer' });

  // Cari sheet target: prioritaskan DATA_SISWA atau sheet yang memiliki header 'nama'
  let targetSheetName = wb.SheetNames[0];
  if (wb.SheetNames.includes('DATA_SISWA')) {
    targetSheetName = 'DATA_SISWA';
  } else {
    for (const sName of wb.SheetNames) {
      const s = wb.Sheets[sName];
      const jsonSample: any[] = XLSX.utils.sheet_to_json(s, { header: 1, range: 0 });
      if (jsonSample && jsonSample[0] && Array.isArray(jsonSample[0])) {
        const rowHeaderStr = jsonSample[0].map((h: any) => String(h).toLowerCase()).join(' ');
        if (rowHeaderStr.includes('nama')) {
          targetSheetName = sName;
          break;
        }
      }
    }
  }

  const ws = wb.Sheets[targetSheetName];

  // Baca sebagai array of objects atau JSON
  const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

  const rows: ExcelImportRow[] = [];
  const seenInFile = new Set<string>();

  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2; // Baris 1 adalah header di spreadsheet
    const errors: string[] = [];

    // Normalisasi kunci baris (mengantisipasi spasi ekstra atau huruf kapital di header)
    const normalizedRow: Record<string, any> = {};
    Object.keys(row).forEach((k) => {
      const cleanKey = k.trim().toLowerCase().replace(/\s+/g, '_');
      normalizedRow[cleanKey] = row[k];
    });

    const namaLengkap = String(normalizedRow['nama_lengkap'] || normalizedRow['nama'] || '').trim();
    let kelasRaw = String(normalizedRow['kelas'] || '').trim().toUpperCase();
    const nomorAbsenRaw = normalizedRow['nomor_absen'] || normalizedRow['no_absen'] || '';
    const statusRaw = String(normalizedRow['status'] || 'aktif').trim().toLowerCase();

    // Lewati jika baris benar-benar kosong
    if (!namaLengkap && !kelasRaw && !nomorAbsenRaw) {
      return;
    }

    // 1. Validasi Nama Lengkap
    if (!namaLengkap) {
      errors.push('Nama lengkap tidak boleh kosong');
    } else if (namaLengkap.length < 2) {
      errors.push('Nama lengkap terlalu pendek (minimal 2 huruf)');
    }

    // 2. Normalisasi & Validasi Kelas (Hanya 6-A, 6-B, 6-C, 6-D, 6-E)
    // Tangani kemungkinan format guru seperti "6A" atau "VI-A"
    if (kelasRaw === '6A' || kelasRaw === 'VI-A' || kelasRaw === 'VIA' || kelasRaw === 'KELAS 6-A' || kelasRaw === 'KELAS 6A') kelasRaw = '6-A';
    if (kelasRaw === '6B' || kelasRaw === 'VI-B' || kelasRaw === 'VIB' || kelasRaw === 'KELAS 6-B' || kelasRaw === 'KELAS 6B') kelasRaw = '6-B';
    if (kelasRaw === '6C' || kelasRaw === 'VI-C' || kelasRaw === 'VIC' || kelasRaw === 'KELAS 6-C' || kelasRaw === 'KELAS 6C') kelasRaw = '6-C';
    if (kelasRaw === '6D' || kelasRaw === 'VI-D' || kelasRaw === 'VID' || kelasRaw === 'KELAS 6-D' || kelasRaw === 'KELAS 6D') kelasRaw = '6-D';
    if (kelasRaw === '6E' || kelasRaw === 'VI-E' || kelasRaw === 'VIE' || kelasRaw === 'KELAS 6-E' || kelasRaw === 'KELAS 6E') kelasRaw = '6-E';

    if (!CANONICAL_CLASSES.includes(kelasRaw as CanonicalClass)) {
      errors.push(`Kelas "${kelasRaw || '-'}" tidak valid. Pilihan kanonis: 6-A, 6-B, 6-C, 6-D, 6-E`);
    }

    // 3. Validasi Status
    const normalizedStatus = statusRaw === 'nonaktif' ? 'nonaktif' : 'aktif';

    // 4. Periksa Duplikasi
    const uniqueKey = `${namaLengkap.toLowerCase()}::${kelasRaw}`;
    let isDuplicate = false;
    if (namaLengkap && kelasRaw) {
      if (seenInFile.has(uniqueKey)) {
        isDuplicate = true;
        errors.push('Duplikat di dalam file ini');
        duplicateCount++;
      } else if (existingStudentNames.has(uniqueKey)) {
        isDuplicate = true;
        errors.push('Siswa dengan nama dan kelas ini sudah terdaftar di sistem');
        duplicateCount++;
      }
      seenInFile.add(uniqueKey);
    }

    const isValid = errors.length === 0;
    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }

    rows.push({
      rowNumber,
      namaLengkap,
      kelas: kelasRaw,
      nomorAbsen: nomorAbsenRaw ? Number(nomorAbsenRaw) || nomorAbsenRaw : undefined,
      status: normalizedStatus,
      isValid,
      errors,
      isDuplicate,
    });
  });

  return {
    fileName,
    totalRows: rows.length,
    validRows: validCount,
    invalidRows: invalidCount,
    duplicateRows: duplicateCount,
    rows,
  };
}

/**
 * Buat Lembar Distribusi Kode Akses dalam format .xlsx untuk dicetak / dibagikan wali kelas
 */
export function generateDistributionExcel(
  students: {
    userId: string;
    fullName: string;
    className: CanonicalClass;
    attendanceNumber?: number;
    plainAccessCode: string;
  }[]
): Buffer {
  const wb = XLSX.utils.book_new();

  const data: any[][] = [
    ['LEMBAR DISTRIBUSI KODE AKSES SISWA - LMS MIN 1 PASER'],
    ['Peringatan: Dokumen rahasia. Bagikan kode akses hanya kepada siswa/wali murid yang bersangkutan.'],
    ['Dicetak pada:', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }) + ' WITA'],
    [],
    ['No', 'ID Siswa', 'Nama Lengkap', 'Kelas', 'No. Absen', 'Kode Akses Siswa', 'Tanda Tangan Siswa'],
  ];

  students.forEach((s, idx) => {
    data.push([
      idx + 1,
      s.userId,
      s.fullName,
      s.className,
      s.attendanceNumber || '-',
      s.plainAccessCode,
      '',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 30 },
    { wch: 10 },
    { wch: 12 },
    { wch: 20 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'DISTRIBUSI_KODE');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
