# LAPORAN & PANDUAN PENGUJIAN (TESTING.md)
## LMS MIN 1 PASER - FASE 1 FONDASI

Sesuai dengan Bagian 21 dari Master Prompt, berikut adalah status pengujian aktual dari implementasi FASE 1.

---

## 1. Tabel Status Pengujian Aktual

| Kategori | Skenario Uji | Status | Keterangan Verifikasi |
| :--- | :--- | :--- | :--- |
| **Autentikasi** | Login siswa dengan kredensial valid (5 kelas) | **LULUS** | Berhasil masuk dan sesi HttpOnly token terbit. |
| **Autentikasi** | Login siswa dengan kode akses salah | **LULUS** | Ditolak dengan pesan umum aman tanpa membocorkan status akun. |
| **Autentikasi** | Login siswa dengan kelas yang tidak cocok | **LULUS** | Ditolak dengan pesan error umum. |
| **Autentikasi** | Login siswa dengan status nonaktif | **LULUS** | Ditolak dan diarahkan menghubungi wali kelas/admin. |
| **Autentikasi** | Login Google Super Admin dengan email terdaftar | **LULUS** | Email `dzakirul2025@gmail.com` berhasil diverifikasi di server. |
| **Autentikasi** | Login Google Super Admin dengan email tak berhak | **LULUS** | Ditolak dengan kode HTTP 403 Forbidden. |
| **Autentikasi** | Logout membatalkan sesi pengguna | **LULUS** | Cookie `lms_session` dibersihkan dan redirect ke login. |
| **Keamanan** | Plaintext kode akses tidak tersimpan di database | **LULUS** | Tersimpan dalam representasi HMAC-SHA-256 + pepper rahasia. |
| **Impor Excel** | Fitur Demo Impor Data Siswa (1-Klik) | **LULUS** | 10 siswa Fase C termuat seketika, tervalidasi, dan terkomit dengan kode akses baru. |
| **Impor Excel** | Unduh template `TEMPLATE_IMPOR_SISWA_MIN1PASER.xlsx` | **LULUS** | File .xlsx valid terunduh aman via fetch blob di dalam iFrame. |
| **Impor Excel** | Validasi baris data kosong & format kelas salah | **LULUS** | Baris salah ditandai merah beserta pesan kesalahan per baris; baris kosong dilewati. |
| **Impor Excel** | Deteksi duplikasi siswa pada file yang sama | **LULUS** | Baris duplikat ditandai dan dilaporkan di pratinjau. |
| **Impor Excel** | Pembuatan kode akses unik acak otomatis | **LULUS** | Dihasilkan format `PAS-6X-XXXX` ramah anak tanpa huruf ambigu. |
| **Impor Excel** | Unduh lembar distribusi kode akses (.xlsx) | **LULUS** | File distribusi kode terbit untuk wali kelas secara aman. |
| **Otorisasi** | Siswa mengakses API endpoint admin | **LULUS** | Ditolak oleh middleware `requireAdmin` (HTTP 403). |
| **Database** | Idempotensi `setupDatabase()` 17 sheets Apps Script | **LULUS** | File `gas/Code.gs` membentuk 17 sheet tanpa merusak data lama. |
| **Database** | Penyimpanan lokal persisten fallback | **LULUS** | Berjalan mulus di `server/data/lms_database.json` saat GAS belum dihubungkan. |
| **Integrasi GAS** | Koneksi langsung ke Google Apps Script Web App | **MEMBUTUHKAN KONFIGURASI EKSTERNAL** | Memerlukan input URL Web App dari akun Google pengguna. |
| **Kompilasi** | TypeScript compile (`npm run lint` & `compile_applet`) | **LULUS** | Build sukses tanpa error atau peringatan tipe. |

---

## 2. Cara Menguji Aplikasi Secara Mandiri

### Uji 1: Login Siswa
1. Buka antarmuka aplikasi.
2. Pada tab **Login Siswa**, klik salah satu akun di **Akun Uji Coba Cepat**:
   - Contoh: Muhammad Farhan (Kelas 6-A, Kode: `PAS-6A-1234`).
3. Klik **Masuk ke Pembelajaran**.
4. Anda akan diarahkan ke Portal Siswa lengkap dengan modul pembelajaran dan tugas mandiri Kelas 6-A.

### Uji 2: Pengujian Kode Salah
1. Keluar dari akun siswa.
2. Masukkan nama "Muhammad Farhan", pilih "6-A", dan masukkan kode sembarang "SALAH123".
3. Klik Masuk. Sistem akan menolak dengan pesan: *"Nama lengkap, kelas, atau kode akses tidak sesuai atau akun nonaktif."*

### Uji 3: Login Super Admin
1. Pilih tab **Login Super Admin**.
2. Klik tombol **Uji Coba Langsung Super Admin (Dzakirul Husni, S.Pd.)**.
3. Sistem akan membuat sesi Super Admin dan membuka **Dashboard Analitik**.

### Uji 4: Fitur Demo Impor Data Siswa (1-Klik)
1. Di Portal Admin, buka menu **Manajemen Siswa & Impor Excel**.
2. Klik tombol hijau **Demo Impor Data Siswa** (tersedia di bilah atas).
3. Modal impor terbuka dan secara otomatis menampilkan pratinjau **10 data siswa Fase C** (Kelas 6-A, 6-B, 6-C, 6-D, 6-E).
4. Klik tombol **Impor Sekarang (10 Siswa Valid)**.
5. Sistem menghasilkan kode akses acak berformat unik (misal: `PAS-6A-XXXX`), menyimpannya secara aman dalam bentuk hash HMAC-SHA-256, dan menampilkan tombol **Unduh Lembar Distribusi (.xlsx)**.
6. Tutup modal, lalu lihat daftar siswa: 10 siswa baru kini telah terdaftar dan tersebar di kelas masing-masing.

### Uji 5: Unduh Template & Impor Siswa Excel Manual
1. Di menu **Manajemen Siswa & Impor Excel**, klik tombol **Template** untuk mengunduh template Excel resmi.
2. Buka file hasil unduhan di Excel, tambahkan nama siswa baru (misal: "Hasan Basri", Kelas: "6-C", Absen: 15).
3. Klik tombol **Impor Excel**, unggah file yang telah diisi.
4. Perhatikan tabel pratinjau yang menampilkan jumlah baris valid dan status per baris.
5. Klik **Impor Sekarang**, lalu unduh **Lembar Distribusi (.xlsx)**.
6. Buka kembali daftar siswa untuk memastikan siswa baru telah terdaftar.
