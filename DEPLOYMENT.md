# PANDUAN DEPLOYMENT (DEPLOYMENT.md)
## LMS MIN 1 PASER • VERCEL & GOOGLE APPS SCRIPT

Panduan praktis untuk melakukan deployment LMS MIN 1 Paser ke hosting Vercel dan menghubungkannya dengan Google Apps Script Web App.

---

## 1. Prasyarat

1. Akun GitHub untuk repositori kode.
2. Akun Vercel (dapat menggunakan akun gratis).
3. Akun Google aktif (guru/pengelola MIN 1 Paser) untuk Google Sheets & Google Apps Script.

---

## 2. Langkah 1 — Setup Google Sheets & Google Apps Script

1. Buka [Google Sheets](https://sheets.new) dan buat spreadsheet baru dengan nama:
   `DATABASE LMS MIN 1 PASER KELAS VI`.
2. Salin **ID Spreadsheet** dari URL browser:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID_DISINI>/edit`
3. Buka menu **Ekstensi > Apps Script**.
4. Hapus kode default pada `Code.gs`, lalu salin seluruh isi dari file repositori `gas/Code.gs`.
5. Buka **Project Settings (Ikon Gerigi) > General Settings > Show "appsscript.json" manifest file in editor**.
6. Pada file `appsscript.json`, ganti isinya dengan file `gas/appsscript.json` (memastikan zona waktu `Asia/Makassar`).
7. Di bagian bawah menu Project Settings, klik **Add script property**:
   - Property: `SPREADSHEET_ID` -> Value: (ID Spreadsheet Anda)
   - Property: `LMS_API_SECRET` -> Value: (Buat kunci rahasia acak, misalnya `min1paser-lms-super-secret-key-change-me`)
8. Kembali ke editor kode (`Code.gs`), pada dropdown fungsi pilih `setupDatabase`, lalu klik tombol **Run** (Jalankan).
   - Berikan izin otorisasi saat diminta oleh Google.
   - Periksa spreadsheet Anda: 17 Sheet akan otomatis terbentuk lengkap dengan header warna hijau resmi.
9. Klik tombol biru **Deploy > New deployment**:
   - Pilih jenis: **Web app**
   - Description: `LMS MIN 1 Paser Production API`
   - Execute as: **Me (email Anda)**
   - Who has access: **Anyone**
   - Klik **Deploy**.
10. Salin **Web App URL** yang berakhiran `/exec`.

---

## 3. Langkah 2 — Setup Repositori GitHub & Vercel

1. Push kode proyek ke repositori GitHub pribadi Anda.
2. Buka dashboard [Vercel](https://vercel.com) dan klik **Add New > Project**.
3. Import repositori GitHub Anda.
4. Pada bagian **Environment Variables**, tambahkan variabel berikut:

| Nama Variabel | Nilai Contoh | Keterangan |
| :--- | :--- | :--- |
| `GAS_WEB_APP_URL` | `https://script.google.com/macros/s/AKfycb.../exec` | URL Web App dari langkah 1 |
| `GAS_SHARED_SECRET` | `min1paser-lms-super-secret-key-change-me` | Harus sama persis dengan `LMS_API_SECRET` di Apps Script |
| `SESSION_SECRET` | `session-secret-min1paser-fase-c-kelas-6` | Kunci enkripsi token sesi HttpOnly |
| `STUDENT_CODE_PEPPER` | `pepper-min1paser-student-access-code` | Pepper rahasia untuk hash HMAC-SHA-256 kode siswa |
| `ADMIN_EMAILS` | `dzakirul2025@gmail.com` | Daftar email Google Super Admin yang diizinkan |
| `APP_BASE_URL` | `https://lms-min1paser.vercel.app` | URL domain Vercel Anda |

5. Klik **Deploy**. Vercel akan otomatis membangun aplikasi Next.js/React full-stack.

---

## 4. Langkah 3 — Verifikasi Pasca Deployment

1. Buka URL aplikasi Vercel yang telah aktif.
2. Masuk menggunakan akun Super Admin (`dzakirul2025@gmail.com`).
3. Pada halaman **Dashboard**, periksa kartu status database:
   - Jika berhasil tersambung, badge akan bertuliskan: **Google Sheets Aktif (Sinkron Cloud)**.
   - Buka menu **Integrasi Google Sheets** dan klik tombol **Uji Koneksi Server** untuk memverifikasi respon 2-arah.
4. Lakukan uji coba impor siswa menggunakan template Excel untuk memastikan penulisan ke Google Sheets berjalan mulus.
