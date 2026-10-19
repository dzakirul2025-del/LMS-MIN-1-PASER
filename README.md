# LMS MIN 1 PASER
## Sistem Manajemen Pembelajaran Digital Terpadu Madrasah Ibtidaiyah Kelas VI

Platform pembelajaran digital resmi untuk **MIN 1 Paser**, Kabupaten Paser, Kalimantan Timur. Didesain secara khusus untuk **Fase C (Kelas VI)** yang mencakup 5 kelas kanonis: **6-A, 6-B, 6-C, 6-D, dan 6-E**.

- **Kepala Madrasah:** Ismail, S.Ag.
- **Guru / Pengelola Pembelajaran:** Dzakirul Husni, S.Pd.
- **Pengembang:** Dzakirul Husni, S.Pd.
- **Zona Waktu:** Asia/Makassar (WITA)
- **Kurikulum:** Kurikulum Merdeka (Fase C)

---

## 1. Arsitektur & Teknologi

1. **Frontend:** React SPA modern dengan TypeScript, Tailwind CSS, Lucide Icons, dan visualisasi data.
2. **Backend Server-Side:** Express API proxy dengan route handlers untuk autentikasi, manajemen sesi berbasis HttpOnly cookie, validasi server, serta proteksi keamanan.
3. **Keamanan Kode Akses Siswa:** Menggunakan **HMAC-SHA-256** dengan server pepper rahasia. Plaintext kode akses **tidak pernah** disimpan dalam database.
4. **Database Utama:** Google Sheets (17 Sheet Kanonis) terintegrasi via Google Apps Script Web App server-to-server.
5. **Mode Penyimpanan Persisten Lokal:** Bila URL Google Apps Script belum dikonfigurasi, sistem secara otomatis dan aman beralih ke penyimpanan persisten lokal sehingga seluruh fungsionalitas aplikasi dapat diuji dan digunakan seketika tanpa kendala.

---

## 2. Struktur Proyek

```text
├── gas/
│   ├── Code.gs                  # Skrip Google Apps Script untuk Google Sheets
│   └── appsscript.json          # Manifest Apps Script (Asia/Makassar)
├── server/
│   ├── db.ts                    # Layanan database dan data awal (seed)
│   ├── excelService.ts          # Generator template, parser impor, dan lembar distribusi
│   ├── security.ts              # Hash HMAC-SHA-256 & verifikasi sesi
│   └── data/                    # Penyimpanan persisten lokal
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Header & tab navigasi peran
│   │   ├── Footer.tsx           # Footer identitas resmi madrasah
│   │   ├── LoginModal.tsx       # Login Siswa (5 kelas) & Super Admin
│   │   ├── AdminDashboard.tsx   # Dashboard analitik & distribusi kelas
│   │   ├── StudentManager.tsx   # CRUD Siswa, reset kode, unduh template
│   │   ├── ExcelImportModal.tsx # Pratinjau & eksekusi impor Excel
│   │   ├── GoogleIntegrationModal.tsx # Panduan integrasi Google Sheets & Drive
│   │   ├── StudentDashboard.tsx # Portal siswa & jadwal Fase C
│   │   ├── LearningMaterialsView.tsx # Pembaca modul & bahan ajar
│   │   ├── AssignmentsView.tsx  # Manajemen tugas & pengumpulan
│   │   ├── CbtSimulationModal.tsx # Simulasi latihan CBT interaktif
│   │   └── LogsView.tsx         # Audit trail & riwayat impor
│   ├── types/
│   │   └── index.ts             # Definisi antarmuka TypeScript
│   ├── App.tsx                  # Komponen utama
│   ├── main.tsx
│   └── index.css
├── server.ts                    # Entry point server full-stack Express + Vite
├── package.json
├── metadata.json
├── .env.example
├── README.md
├── TESTING.md
└── DEPLOYMENT.md
```

---

## 3. Akun Uji Coba Cepat (FASE 1)

Untuk memudahkan pengujian fungsionalitas sistem:

### A. Super Admin (Guru/Pengelola)
- **Email:** `dzakirul2025@gmail.com`
- **Nama:** Dzakirul Husni, S.Pd.
- *Catatan:* Pada tab "Login Super Admin", tersedia tombol 1-klik: **"Uji Coba Langsung Super Admin (Dzakirul Husni, S.Pd.)"**.

### B. Akun Siswa Uji Coba (Tersedia di 5 Kelas)
| Kelas | Nama Siswa | Kode Akses Pribadi |
| :--- | :--- | :--- |
| **6-A** | Muhammad Farhan | `PAS-6A-1234` |
| **6-B** | Aisyah Putri Rahmadani | `PAS-6B-1234` |
| **6-C** | Muhammad Rizky Ramadhan | `PAS-6C-1234` |
| **6-D** | Nurul Hidayah | `PAS-6D-1234` |
| **6-E** | Dimas Arya Pratama | `PAS-6E-1234` |

*(Pada halaman Login Siswa, Anda juga dapat mengklik nama siswa di bagian "Akun Uji Coba Cepat" untuk mengisi formulir secara otomatis).*

---

## 4. Alur Manajemen Siswa & Impor Massal Excel

### A. Fitur Demo Impor Data Siswa (1-Klik Tanpa File)
Untuk menguji proses validasi dan impor seketika tanpa perlu menyiapkan berkas dari komputer/HP:
1. Masuk sebagai **Super Admin**.
2. Buka menu **Manajemen Siswa & Impor Excel**.
3. Klik tombol hijau **Demo Impor Data Siswa** (atau di dalam modal, klik **"Muat Data Demo Siswa"**).
4. Sistem memuat **10 data siswa contoh** (2 siswa untuk tiap kelas 6-A, 6-B, 6-C, 6-D, 6-E) langsung ke tabel pratinjau validasi.
5. Klik **Impor Sekarang (10 Siswa Valid)** untuk membuat akun dan kode akses siswa baru.
6. Klik **Unduh Lembar Distribusi (.xlsx)** untuk melihat lembar pembagian kode akses.

### B. Impor Berkas Excel / CSV Mandiri
1. Masuk sebagai **Super Admin** > menu **Manajemen Siswa & Impor Excel**.
2. Klik tombol **Template** untuk mengunduh template `TEMPLATE_IMPOR_SISWA_MIN1PASER.xlsx`.
3. Buka template tersebut, isi baris siswa dengan kolom:
   - `nama_lengkap`: Nama lengkap siswa.
   - `kelas`: Hanya pilih salah satu: **6-A, 6-B, 6-C, 6-D, atau 6-E**.
   - `nomor_absen`: Angka absen di kelas masing-masing.
   - `status`: "aktif" atau "nonaktif" (default: aktif).
4. Klik tombol **Impor Excel** lalu unggah file `.xlsx` atau `.csv`.
5. Sistem memvalidasi setiap baris dan menampilkan pratinjau:
   - Baris valid ditandai hijau siap impor.
   - Baris keliru/kelas tidak valid/nama kosong ditandai merah beserta pesan error per baris; baris kosong otomatis dilewati.
   - Duplikasi dideteksi otomatis.
6. Klik **Impor Sekarang**:
   - Sistem membuatkan kode akses acak unik berkekuatan tinggi (contoh: `PAS-6A-8492`).
   - Sistem menghitung hash HMAC-SHA-256 dan menyimpannya ke database.
   - Sistem menyajikan tombol **"Unduh Lembar Distribusi (.xlsx)"** yang berisi daftar kode akses awal untuk dibagikan oleh wali kelas.

---

## 5. Pemasangan Google Apps Script (17 Sheet Database)

Jika Anda ingin menghubungkan spreadsheet Google Sheets nyata:

1. Buat Google Sheets baru di [Google Sheets](https://sheets.new) dengan nama:
   `DATABASE LMS MIN 1 PASER KELAS VI`.
2. Buka menu **Ekstensi > Apps Script**.
3. Ganti kode default dengan isi dari file `gas/Code.gs`.
4. Buka **Project Settings (Ikon Gerigi) > Script Properties**, tambahkan:
   - `LMS_API_SECRET`: Kunci rahasia server (misal: `min1paser-lms-super-secret-key-change-me`).
   - `SPREADSHEET_ID`: ID Spreadsheet Anda dari URL browser.
5. Jalankan fungsi `setupDatabase()` sekali di editor Apps Script untuk membentuk 17 sheet dengan header warna hijau resmi.
6. Klik **Deploy > New Deployment > Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Salin URL Web App yang dihasilkan (berakhiran `/exec`) ke variabel environment `GAS_WEB_APP_URL`.
