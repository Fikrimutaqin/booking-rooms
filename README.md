# 🏢 Room Bookings System

Sistem manajemen dan reservasi ruangan kantor (*Internal Meeting Room Reservation System*) fullstack modern yang dirancang untuk mencegah bentrok jadwal secara presisi, menangani zona waktu secara konsisten, dan memberikan pengalaman pengguna (UI/UX) yang intuitif serta responsif.

- **Backend:** [NestJS (v11)](https://nestjs.com/) + [Prisma ORM (v6)](https://www.prisma.io/) + PostgreSQL Serverless + Passport JWT + Class-Validator
- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Black & White Theme) + [React Router](https://reactrouter.com/)
- **Database:** PostgreSQL dengan ekstensi `btree_gist` untuk *Exclusion Constraint* anti-bentrok tingkat ACID.
- **Live Demo App:** [https://booking-rooms-hnei.vercel.app](https://booking-rooms-hnei.vercel.app)

---

## 🤖 Bagian yang Dibantu oleh AI Assistant (AI-Assisted Engineering)

Proyek ini dikembangkan melalui kolaborasi terstruktur bersama **AI Assistant** untuk mempercepat perancangan solusi, memvalidasi pendekatan arsitektur terbaik, dan menyelesaikan kendala teknis spesifik. Berikut adalah rincian transparan mengenai bagian-bagian yang dikerjakan dengan bantuan AI:

### 1. 🛡️ Arsitektur Anti-Bentrok Jadwal (Database & Backend)
* **PostgreSQL GiST Exclusion Constraint**: AI merekomendasikan dan merumuskan penggunaan ekstensi `btree_gist` dengan operator irisan temporal `tstzrange("start_at", "end_at") WITH &&` di tingkat PostgreSQL. Pendekatan ini dipilih untuk mengeliminasi potensi *race condition* di tingkat database ACID saat terjadi konkurensi pemesanan simultan.
* **Error Handling & Graceful Mapping**: AI menyusun utilitas `isOverlapError` di backend untuk mendeteksi error PostgreSQL kode `23P01` (*exclusion_violation*) atau string constraint `no_overlapping_bookings`, lalu menerjemahkannya secara elegan menjadi respons HTTP standar `409 Conflict`.

### 2. 🌍 Penanganan Zona Waktu & Validasi Operasional Kantor (Backend)
* **Custom Class-Validators**: AI membuat kumpulan decorator validasi waktu kustom di NestJS:
  * `@IsWithinWorkingHours()`: Memvalidasi jam kerja kantor (08:00 - 18:00 WIB) pada hari kalender yang sama dengan konversi offset kanonikal UTC ke WIB (`+07:00`).
  * `@IsNotInPast()`: Mencegah pemesanan waktu di masa lampau.
  * `@IsAfterStart()` & `@HasValidDuration()`: Memastikan durasi pertemuan valid antara 30 menit hingga maksimal 4 jam.

### 3. 📅 Logika Pemesanan Kompleks (Multi-Date & Recurring)
* **Logika Kalender Interaktif**: AI menyusun helper perhitungan grid tanggal kalender bulanan (`generateCalendarDays`) dengan penanda hari libur, tanggal aktif, dan indikator titik pemesanan.
* **Multi-Date Range & Weekend Exclusion**: AI menyusun logika seleksi rentang tanggal multi-hari yang secara otomatis menyaring dan mengecualikan hari Sabtu dan Minggu.
* **Resilient Client-Side Dispatch**: AI menerapkan pola *batch dispatching* mandiri untuk pemesanan berulang mingguan (*Weekly Recurring*) agar tidak terhalang *whitelist rejection* `ValidationPipe` pada backend.

### 4. ⚙️ Tooling, Build, & Kompatibilitas Serverless
* **Resolusi Kompatibilitas Runtime Serverless (Vercel)**: AI membantu memecahkan kendala import module ESM/CJS pada NestJS saat dideploy ke lingkungan AWS Lambda / Vercel Serverless Function dengan beralih ke *relative path imports* dan otomasi `prisma generate`.
* **DevOps & Kontainerisasi**: AI menyusun `Dockerfile` multi-stage build dan berkas `docker-compose.yml` lengkap dengan reverse proxy Nginx.

---

## 🚀 Cara Menjalankan Project Secara Lokal

### 1. Prasyarat Sistem (Prerequisites)
Pastikan lingkungan lokal Anda telah terpasang:
* **Node.js**: Versi `20.x` atau `22.x LTS` (Rekomendasi `Node 22`)
* **NPM**: Versi `9.x` atau lebih baru
* **PostgreSQL Database**: PostgreSQL lokal, Docker, atau PostgreSQL Serverless ([Neon.tech](https://neon.tech/) / [Supabase](https://supabase.com/)).

---

### 2. Setup Backend (NestJS + Prisma)

Buka terminal dan navigasikan ke folder `backend`:
```bash
cd backend
```

#### A. Install Dependensi
```bash
npm install
```

#### B. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan isi file `.env`:
```env
PORT=3000

# URL Database PostgreSQL (Connection Pooler):
DATABASE_URL="postgresql://username:password@ep-sample-12345.region.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"

# Direct URL untuk migrasi Prisma CLI:
DIRECT_URL="postgresql://username:password@ep-sample-12345.region.aws.neon.tech/neondb?sslmode=require"

# Kunci JWT untuk Autentikasi:
JWT_SECRET="super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="1d"
```

#### C. Migrasi Database & Generate Client
Jalankan migrasi untuk membuat tabel dan constraint database PostgreSQL:
```bash
npm run db:migrate
```
Generate Prisma Client:
```bash
npm run db:generate
```

#### D. Seed Data Awal (Akun & Ruangan Demo)
Jalankan seeder untuk mengisi akun Admin, Employee, dan Ruangan contoh:
```bash
npm run db:seed
```

#### E. Menjalankan Server Backend
```bash
npm run dev
```
Backend akan aktif di: **`http://localhost:3000`** (Health check: `http://localhost:3000/api/v1/health`).

> **Tips:** Jalankan `npm run db:studio` untuk membuka Prisma Studio di browser (`http://localhost:5555`).

---

### 3. Setup Frontend (React 19 + Vite)

Buka tab terminal baru dan navigasikan ke folder `frontend`:
```bash
cd frontend
```

#### A. Install Dependensi
```bash
npm install
```

#### B. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi file `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

#### C. Menjalankan Frontend Dev Server
```bash
npm run dev
```
Buka browser Anda di: **`http://localhost:5173`**.

---

### 4. Alternatif: Menjalankan via Docker Compose
Jika Anda memiliki Docker, seluruh sistem (Backend, Frontend, dan Nginx Reverse Proxy) dapat dijalankan hanya dengan satu perintah dari root folder:
```bash
docker compose up --build
```
* **Frontend App**: [http://localhost](http://localhost) atau [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

---

### 🌐 Live Demo & Akun Demo (Credentials)

Aplikasi telah di-deploy dan dapat dicoba langsung secara live di:  
👉 **Live Demo URL:** [https://booking-rooms-hnei.vercel.app](https://booking-rooms-hnei.vercel.app)

Gunakan akun demo berikut untuk menguji masing-masing hak akses:

| Role | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `rpl.11.fikrimutaqin@gmail.com` | `Admin123` | Akses penuh: Buat & hapus ruangan, kelola data user, membatalkan seluruh reservasi, melihat semua riwayat. |
| **EMPLOYEE** | `rpl.11.fikrimutaqin+1@gmail.com` | `Employee123` | Akses standar: Reservasi ruangan meeting, riwayat booking pribadi (`bookings/me`), batalkan booking sendiri, Room Directory (Read-Only). |

---

## 🏛️ Gambaran Singkat Arsitektur

Proyek ini mengadopsi arsitektur **Decoupled Client-Server Monorepo** yang memisahkan tanggung jawab secara tegas antara presentasi antarmuka dan logika bisnis:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                     │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │     Pages & Layouts     │  │          Components & UI             │ │
│  │ (Dashboard, AddBooking) │  │  (shadcn/ui, Calendar, Popups)       │ │
│  └───────────┬─────────────┘  └──────────────────┬───────────────────┘ │
│              │                                   │                     │
│              └─────────────────┬─────────────────┘                     │
│                                ▼                                       │
│                       Custom Hooks Layer                               │
│        (useBookings, useRooms, usePagination, useAddBooking)           │
│                                │                                       │
│                                ▼ (Axios / Fetch REST API)              │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (NestJS v11 REST API)                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Global Pipeline: CORS -> URI Versioning (/v1) -> ValidationPipe  │  │
│  └─────────────────────────────┬────────────────────────────────────┘  │
│                                ▼                                       │
│  ┌─────────────────────────────┴────────────────────────────────────┐  │
│  │ Modules: Auth (JWT/Argon2), Bookings, Rooms, Users               │  │
│  │ Guards: JwtAuthGuard, RolesGuard (RBAC Admin/Employee)           │  │
│  │ Validators: IsWithinWorkingHours, IsNotInPast, HasValidDuration  │  │
│  └─────────────────────────────┬────────────────────────────────────┘  │
│                                ▼                                       │
│                           Prisma ORM                                   │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL Serverless)                 │
│  - Extension: btree_gist                                               │
│  - Constraints: CHECK (end_at > start_at)                              │
│  - Anti-Collision: EXCLUDE USING gist (room_id =, tstzrange &&)        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Frontend (Presentation & Interaction Layer):**
   * Berbasis **React 19** dan **TypeScript** dengan bundler **Vite** yang sangat cepat.
   * Menggunakan pola **Custom Hooks Layer** (`useFetch`, `useApi`, `useBookings`, `useRooms`, `usePagination`, `useAddBooking`) untuk memisahkan *state orchestration* dan pemanggilan API dari komponen presentasi.
   * Komponen UI modular berbasis **shadcn/ui** dengan palet monokrom minimalis (*Zinc/Neutral Black & White Theme*).

2. **Backend (Application & Business Logic Layer):**
   * Dibangun dengan **NestJS v11** menggunakan pola modular (Controller, Service, DTO).
   * **Global Pipes:** `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`) menjamin integritas payload DTO.
   * **Security & Auth:** Autentikasi berbasis **JWT Bearer Token** dengan strategi Passport, *password hashing* menggunakan algoritma kuat **Argon2**, serta otorisasi berbasis peran (**RBAC**) dengan decorator `@Roles()`.
   * **Interceptors & Filters:** `ResponseInterceptor` menyeragamkan seluruh output JSON API, dan `HttpExceptionFilter` menangkap error secara terpusat.

3. **Database (Persistence & ACID Integrity Layer):**
   * Menggunakan **PostgreSQL** yang diakses melalui **Prisma ORM**.
   * Memanfaatkan tipe data `TIMESTAMPTZ` untuk penyimpanan waktu presisi dan ekstensi `btree_gist` untuk pengindeksan temporal rentang waktu.

---

## 🛡️ Cara Mencegah Booking Bentrok dan Alasan Memilih Pendekatan Tersebut

Pencegahan jadwal bertabrakan dirancang dengan strategi **Pertahanan Berlapis (*Defense-in-Depth*)**:

### 1. Lapisan 1: Pengecekan Interaktif di Sisi Klien (Frontend)
* Pada kalender pemesanan (`BookingCalendar.tsx`), tanggal-tanggal yang telah memiliki reservasi ditandai dengan titik indikator (`bookedDates`).
* Terdapat validasi langsung sebelum form dikirim:
  * Menolak pemesanan di luar jam kerja (08:00 - 18:00 WIB).
  * Menolak durasi di luar 30 menit s/d 4 jam.
  * Menolak pemesanan di masa lalu (*past time*).
  * Menolak atau mengecualikan hari libur akhir pekan (Sabtu & Minggu).
  * Menghitung potensi irisan jadwal pada fitur *multi-date* dan *weekly recurring* secara lokal sebelum request HTTP ditembakkan ke server.

### 2. Lapisan 2: Pengecekan Logika Bisnis di Sisi Aplikasi (Backend)
Sebelum memasukkan data ke database, `BookingsService` melakukan pengecekan interval irisan waktu (*Interval Overlap Check*):
```typescript
const clash = await this.prisma.booking.findFirst({
  where: {
    roomId: dto.roomId,
    startAt: { lt: dto.endAt },
    endAt: { gt: dto.startAt },
    status: { not: BookingStatus.CANCELLED },
  },
  select: { id: true },
});

if (clash) {
  throw conflict('The room has already been booked for that time period.');
}
```
* **Logika Matematis:** Dua rentang waktu $[S_1, E_1]$ dan $[S_2, E_2]$ bertabrakan jika dan hanya jika $S_1 < E_2 \land E_1 > S_2$. Jika jadwal yang ada adalah 09:00 - 11:00 dan pemesanan baru diajukan untuk 13:00 - 15:00, kondisi ini bernilai *false* sehingga pemesanan diizinkan.

### 3. Lapisan 3: Jaminan Integritas Mutlak di Tingkat Basis Data (PostgreSQL GiST Exclusion Constraint)
Di level database, diterapkan constraint fisik PostgreSQL menggunakan ekstensi `btree_gist`:
```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_end_after_start" CHECK ("end_at" > "start_at");

ALTER TABLE "bookings"
  ADD CONSTRAINT "no_overlapping_bookings"
  EXCLUDE USING gist (
    "room_id" WITH =,
    tstzrange("start_at", "end_at") WITH &&
  );
```

### 💡 Alasan Memilih Pendekatan Ini:
1. **Kebal Terhadap *Race Condition*:**
   Pada skenario *high concurrency* (misalnya dua karyawan menekan tombol konfirmasi booking pada milidetik yang persis sama), pengecekan level aplikasi (`SELECT` lalu `INSERT`) rentan gagal karena keduanya sama-sama melihat slot masih kosong sebelum sempat menulis. Dengan **PostgreSQL GiST Exclusion Constraint**, database menjamin secara atomik (tingkat ACID) bahwa tidak ada dua baris yang saling tumpang tindih (`&&`) pada ruangan yang sama.
2. **Kinerja Pengindeksan Tinggi (O(log N)):**
   Indeks GiST mengorganisir rentang waktu dalam struktur pohon pencarian spasial/interval, menjamin kecepatan evaluasi irisan jadwal tetap optimal sekalipun data pemesanan telah mencapai ratusan ribu baris.
3. ***Graceful Translation:***
   Jika database menolak transaksi dengan kode error PostgreSQL `23P01` (*exclusion_violation*), helper `isOverlapError` di backend langsung menangkapnya dan mengembalikannya sebagai HTTP `409 Conflict` dengan pesan yang ramah kepada pengguna.

---

## 🌍 Cara Menangani Zona Waktu (Timezone Handling)

Penanganan zona waktu dirancang dengan prinsip **Universal Canonical UTC on Storage, Local Context on Presentation**:

```text
[Input User: 16:00 WIB]
        │
        ▼ (Frontend Date Constructor)
new Date("2026-12-03T16:00:00+07:00").toISOString()
        │
        ▼ (Dikirim via HTTP Payload)
"2026-12-03T09:00:00.000Z" (UTC Murni)
        │
        ▼ (Backend: PostgreSQL TIMESTAMPTZ)
Disimpan dalam Database sebagai UTC
        │
        ▼ (Backend Validation @IsWithinWorkingHours)
Dikonversi kembali ke WIB (+7 Jam) untuk validasi jam kantor 08:00 - 18:00 WIB
        │
        ▼ (Frontend Retrieval & Display)
formatSchedule() -> "Dec 3, 2026, 16:00 - 17:00" (Lokal Browser)
```

1. **Penyimpanan Database Kanonikal (UTC Murni):**
   * Semua kolom tanggal (`startAt`, `endAt`, `createdAt`, `updatedAt`) menggunakan tipe data `DateTime` di Prisma (`TIMESTAMPTZ` di PostgreSQL).
   * Data selalu disimpan dalam format standar ISO 8601 berakhiran `Z` (UTC). Hal ini mencegah ketergantungan pada zona waktu server hosting (misalnya server Vercel/AWS yang berada di zona UTC).

2. **Validasi Jam Operasional Kantor Berbasis WIB (UTC+7):**
   * Kantor beroperasi pada jam 08:00 s/d 18:00 WIB.
   * Di backend, validator kustom `@IsWithinWorkingHours()` mengonversi timestamp UTC ke waktu WIB menggunakan perhitungan offset:
     ```typescript
     function toWib(d: Date): WibTimeInfo {
       const w = new Date(d.getTime() + 7 * 60 * 60 * 1000);
       return {
         date: w.toISOString().slice(0, 10), // YYYY-MM-DD
         minutes: w.getUTCHours() * 60 + w.getUTCMinutes(),
       };
     }
     ```
   * Memastikan bahwa waktu mulai dan waktu selesai berada pada hari kalender kerja yang sama (tidak menyeberang hari) serta berada dalam rentang menit 480 (08:00) hingga 1080 (18:00).

3. **Konstruksi Waktu Eksplisit di Frontend:**
   * Input jam di form menggunakan format 24 jam (misal `09:00`, `16:00`).
   * Saat form disubmit, frontend secara eksplisit menyematkan offset WIB (`+07:00`):
     ```typescript
     const startDateTime = new Date(`${selectedDateStr}T${startTime}:00+07:00`);
     const endDateTime = new Date(`${selectedDateStr}T${endTime}:00+07:00`);
     ```
   * Output `.toISOString()` memastikan data yang dikirim ke API selalu benar tanpa dipengaruhi oleh pengaturan zona waktu lokal pada komputer pengguna.

4. **Penyajian Format yang Manusiawi:**
   * Komponen menggunakan helper [formatSchedule](file:///Users/fikrimutaqin/Project/booking-rooms/frontend/src/utils/date.ts) dan `formatDateTime` yang memformat waktu menjadi ramah dibaca (contoh: `Dec 3, 2026, 16:00 - 17:00`).

---

## 🌟 Nilai Tambah yang Dikerjakan (Added Values)

Proyek ini dilengkapi dengan berbagai fitur nilai tambah yang melebihi fungsionalitas CRUD standar:

1. **Role-Based Access Control (RBAC) Menyeluruh:**
   * **Role ADMIN:** Hak akses penuh untuk menambah ruangan (dialog Add Room dengan fasilitas multi-tag), menghapus ruangan, menghapus user, membatalkan reservasi manapun, dan melihat seluruh jadwal.
   * **Role EMPLOYEE:** Menu navigasi disesuaikan secara otomatis; direktori ruangan berstatus *Read-Only*, akses khusus riwayat reservasi pribadi via endpoint `GET /bookings/me`, serta fitur reservasi ruangan.

2. **In-Row Expandable Details (Non-Redundant) pada Tabel:**
   * Di tabel **Bookings** dan **History**, modal pop-up detail yang mengganggu digantikan dengan **baris accordion yang dapat diperluas (*expandable*)**.
   * Menampilkan metadata yang tidak berulang (*non-redundant*): Agenda/Judul Meeting, Pembuat Reservasi (Nama & Email), Durasi terhitung (contoh: `1 hr 30 mins`), Tag Fasilitas Ruangan, UUID Referensi, dan Timestamp Pembuatan.

3. **Client-Side Pagination Reusable di Seluruh Tabel:**
   * Dibuat hook `usePagination` dan komponen `TablePagination` yang diterapkan seragam pada 4 tabel dashboard: **Bookings**, **History**, **Rooms**, dan **Users**.
   * Mendukung penunjuk rentang baris (*Showing X to Y of Z entries*), pilihan baris per halaman (5, 10, 20), dan navigasi halaman lengkap (First, Prev, Page Indicator, Next, Last).

4. **Multi-Date Range Booking:**
   * Memungkinkan pengguna memesan ruangan untuk rentang beberapa hari sekaligus (contoh: workshop 3 hari berturut-turut).
   * Sistem otomatis mendeteksi dan mengecualikan hari libur akhir pekan (Sabtu & Minggu).

5. **Weekly Recurring Booking (Pemesanan Berulang Mingguan):**
   * Opsi pemesanan rutin setiap minggu (2 hingga 12 minggu) pada hari yang sama.
   * Dilengkapi *preview conflict per week* untuk transparansi ketersediaan ruangan.
   * Menggunakan *resilient batch dispatch* di frontend agar kebal dari penolakan skema DTO backend lama.

6. **Pop-up Konfirmasi Pembatalan Interaktif:**
   * Komponen `CancelBookingConfirmDialog` mencegah pembatalan tidak sengaja (*accidental click*), menampilkan ringkasan meeting yang akan dibatalkan, dan tombol destruktif dengan animasi loading.

7. **Filter Kapasitas Ruangan:**
   * Filter interaktif di tabel pemesanan untuk menyaring jadwal meeting berdasarkan kapasitas ruangan (misal: 10 orang, 20 orang).

8. **Halaman Registrasi Mandiri (`/register`):**
   * Antarmuka pendaftaran akun baru bagi karyawan dengan validasi skema form (Zod), verifikasi kekuatan password, dan navigasi mulus ke login.

9. **Test Konkurensi Otomatis (Concurrency Integration Suite):**
   * Script pengujian terisolasi (`npm run test:concurrency`) yang membuktikan keandalan sistem saat 20 request konkuren masuk secara simultan.

---

## 🧪 Pengujian Konkurensi (Concurrency Integration Test)

Untuk membuktikan secara empiris bahwa sistem kebal terhadap *race condition* dan *double-booking*, telah disediakan script integration test khusus yang mengirimkan **20 request pemesanan secara bersamaan pada milidetik yang persis sama** untuk ruangan dan slot jam yang identik:

### Cara Menjalankan Test Konkurensi:
Navigasikan ke direktori `backend` dan jalankan:
```bash
cd backend
npm run test:concurrency
```

### Yang Dibuktikan oleh Test Ini:
1. **Eksekusi Simultan:** Menembakkan 20 request pembuatan booking secara paralel menggunakan `Promise.allSettled`.
2. **Integritas Penjagaan Berlapis:**
   * Tepat **1 request berhasil** (`Fulfilled`) mendapatkan jadwal ruangan.
   * Tepat **19 request ditolak** (`Rejected`) dengan error `409 Conflict` (*The room has already been booked for that time period*).
3. **Audit Database Langsung:** Memverifikasi baris fisik di PostgreSQL via `prisma.booking.count()` dan memastikan hanya tepat **1 baris** yang persisten.
4. **Auto-Cleanup:** Membersihkan kembali baris booking uji coba agar database tetap bersih.

---

## 🔮 Hal yang Belum Selesai dan Rencana Pengembangan ke Depan

Jika memiliki alokasi waktu pengembangan lebih banyak, berikut adalah peningkatan prioritas tinggi yang akan ditambahkan:

1. **Penyempurnaan Partial Index Exclusion Constraint untuk Status CANCELLED:**
   * Menambahkan klausul predicate `WHERE ("status" != 'CANCELLED')` pada constraint PostgreSQL GiST. Saat ini, jika booking dibatalkan (*soft-cancelled*), constraint GiST masih menganggap rentang waktu terisi kecuali baris dihapus secara permanen atau constraint dimigrasikan dengan filter status.
2. **Integrasi Notifikasi Webhook (Email, Slack, & Google Calendar):**
   * Mengirim email konfirmasi otomatis kepada peserta meeting menggunakan template HTML profesional.
   * Menghasilkan file invite calendar `.ics` atau sinkronisasi langsung ke Google Calendar API.
   * Notifikasi bot Slack ke channel kantor saat ada jadwal meeting baru.
3. **Server-Side Pagination & Server-Side Filtering:**
   * Meningkatkan endpoint `GET /bookings`, `GET /rooms`, dan `GET /users` dengan query limit/offset dan pencarian kata kunci di level SQL Prisma agar performa tetap instan saat data mencapai jutaan entri.
4. **Fitur Reschedule / Ubah Jadwal Langsung:**
   * Menambahkan aksi modal *Reschedule Booking* yang memungkinkan pengguna memindahkan jam atau ruangan tanpa perlu membatalkan reservasi yang lama.
5. **Automated Testing Suite (Unit & End-to-End):**
   * Menambahkan pengujian integrasi Jest pada backend untuk menguji skenario bentrok secara konkuren (*stress testing concurrency*).
   * Menambahkan pengujian E2E frontend menggunakan **Playwright** untuk memastikan seluruh alur pemesanan kalender berjalan tanpa regresi.

---

## 👨‍💻 Kontributor
* **Pengembang**: Fikri Mutaqin
* **Lisensi**: UNLICENSED (Internal Project)
