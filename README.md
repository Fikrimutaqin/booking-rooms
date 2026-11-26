# 🏢 Room Bookings System

Sistem manajemen pemesanan ruangan kantor (*Internal Room Reservation System*) yang dibangun dengan arsitektur modern:
- **Backend:** [NestJS (v11)](https://nestjs.com/) + [Prisma ORM (v6)](https://www.prisma.io/) + PostgreSQL Serverless + Passport JWT
- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Black & White Minimalist Theme) + [React Router](https://reactrouter.com/)
- **DevOps / Deployment:** Docker Compose, Multi-stage Builds, Nginx Reverse Proxy, Vercel Serverless Ready

---

## 🤖 Peran & Bantuan AI dalam Proyek Ini (AI-Assisted Engineering)

Proyek ini dikembangkan dengan kolaborasi bersama **AI Assistant** untuk mempercepat proses *engineering*, memvalidasi keputusan arsitektur, dan menyelesaikan tantangan teknis kompleks baik di sisi Backend maupun Frontend.

Berikut adalah 3 area utama di mana AI memberikan kontribusi krusial dalam proyek ini:

### 1. ⚙️ Setup & Pemecahan Masalah Lingkungan (Backend & Frontend)
* **Arsitektur Modular & Monorepo**: AI membantu menginisialisasi dan menata struktur folder terpisah yang rapi dan terstandarisasi antara Backend (NestJS v11 + Prisma ORM) dan Frontend (React 19 + Vite + TypeScript), lengkap dengan konfigurasi ESLint 9 Flat Config dan Docker orchestration.
* **Resolusi Kompatibilitas Serverless & Modul CommonJS (Vercel)**:
  * Mengatasi kendala kritis `[ERR_REQUIRE_ESM]` pada environment AWS Lambda / Vercel Serverless Function yang disebabkan oleh rilis package NestJS v12 yang berpindah ke *pure ESM* (`@nestjs/mapped-types`, `@nestjs/jwt`, `@nestjs/passport`).
  * Memperbaiki import modul dengan beralih ke *relative paths* murni (`../` & `./`) dan menghapus seluruh *path aliases* TypeScript (`@common/*`, `@prisma/*`, dsb) agar tidak terjadi kegagalan modul di Vercel Serverless Function, serta memastikan eksekusi `prisma generate` berjalan otomatis pada tahapan build cloud.
* **DevOps & Kontainerisasi**: Menyusun `Dockerfile` *multi-stage build* yang optimal serta konfigurasi `docker-compose.yml` lengkap dengan Nginx *reverse proxy*.
---

#### 2: Integritas Mutlak di Tingkat Database (PostgreSQL Exclusion Constraint)
Untuk menjamin integritas data secara mutlak dan tahan terhadap lonjakan *traffic* tinggi, AI merekomendasikan dan menerapkan **PostgreSQL Exclusion Constraint** menggunakan ekstensi `btree_gist`:
```sql
-- Mengaktifkan ekstensi btree_gist untuk mendukung pengindeksan gabungan tipe data dasar & rentang waktu
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Memastikan waktu selesai selalu lebih besar dari waktu mulai
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_end_after_start" CHECK ("end_at" > "start_at");

-- Constraint inti pencegah jadwal bentrok (Exclusion Constraint)
ALTER TABLE "bookings"
  ADD CONSTRAINT "no_overlapping_bookings"
  EXCLUDE USING gist (
    "room_id" WITH =,
    tstzrange("start_at", "end_at") WITH &&
  );
```
* **Cara Kerja Constraint:** 
  Operator `tstzrange("start_at", "end_at") WITH &&` mengevaluasi irisan waktu (*time overlap*). Jika ada transaksi baru dengan `room_id` yang sama dan memiliki rentang waktu yang bertabrakan dengan data yang sudah ada, PostgreSQL akan langsung membatalkan transaksi secara atomik di tingkat ACID dan memunculkan error kode `23P01` (*exclusion_violation*).
* **Graceful Error Translation:**
  Pada backend NestJS, AI menambahkan helper `isOverlapError(error)` yang menangkap kode error PostgreSQL `23P01` atau pesan constraint `no_overlapping_bookings`, kemudian menerjemahkannya secara elegan menjadi respons HTTP standar `409 Conflict`.

---

### 3. 🎨 Perancangan UI/UX & Komponen Modular shadcn/ui (Frontend)
* **Tema Minimalis Hitam-Putih (*Monochrome Black & White*)**:
  * Mengonfigurasi seluruh token Tailwind CSS dan variabel warna shadcn/ui (`Zinc`/`Neutral`) agar tampil elegan, clean, dan profesional tanpa saturasi warna yang mencolok.
* **Template Halaman Login**:
  * Merancang antarmuka login yang *accessible* dengan validasi form, atribut autocomplete semantik, serta fitur interaktif toggle **Show / Hide Password** dengan keyboard accessibility.
* **Template Dashboard & Collapsible Sidebar**:
  * Membangun layout dashboard modern dengan **Collapsible Sidebar** yang dapat diciutkan (*collapse*) menjadi mode ramping (*mini icon-bar* `w-16`) atau diperluas (*expand* `w-64`) secara mulus.
  * Menyediakan 4 menu navigasi utama: **Bookings**, **Rooms**, **Users**, dan **Logout**.
* **Arsitektur Komponen yang Rapi & Reusable**:
  * AI merefaktor kode monolitik menjadi komponen-komponen kecil yang terisolasi dan mudah digunakan kembali:
    * `AuthLayout` & `DashboardLayout` sebagai shell kerangka halaman.
    * `Sidebar`, `Header`, dan `StatCard` sebagai komponen dashboard serbaguna.
    * `BookingsView`, `RoomsView`, dan `UsersView` yang dilengkapi tabel data semantik dan status badge.

## 📁 Struktur Direktori Proyek

```text
booking-rooms/
├── backend/                       # Aplikasi Backend (NestJS v11 + Prisma ORM)
│   ├── api/
│   │   └── index.ts               # Serverless function entrypoint untuk Vercel
│   ├── prisma/
│   │   ├── schema.prisma          # Skema database: User, Room, Booking (PostgreSQL)
│   │   └── seed.prisma.ts         # Seeder data awal (Admin, Employee, Rooms)
│   ├── src/
│   │   ├── auth/                  # Modul Autentikasi (JWT, Passport, Hash Argon2, Guards)
│   │   │   ├── dto/               # LoginDto, RegisterDto, RefreshTokenDto
│   │   │   ├── interfaces/        # Auth interfaces
│   │   │   ├── strategies/        # JwtStrategy
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── bookings/              # Modul Manajemen Booking Ruangan
│   │   │   ├── dto/               # CreateBookingDto, UpdateBookingDto, QueryBookingDto
│   │   │   ├── interfaces/        # Booking interfaces
│   │   │   ├── utils/             # Overlap & conflict booking validation helpers
│   │   │   ├── validators/        # Custom time validators
│   │   │   ├── bookings.controller.ts
│   │   │   ├── bookings.service.ts
│   │   │   └── bookings.module.ts
│   │   ├── rooms/                 # Modul Manajemen Ruangan
│   │   │   ├── dto/               # CreateRoomDto, UpdateRoomDto, QueryRoomDto
│   │   │   ├── interfaces/        # Room interfaces
│   │   │   ├── rooms.controller.ts
│   │   │   ├── rooms.service.ts
│   │   │   └── rooms.module.ts
│   │   ├── users/                 # Modul Manajemen Pengguna
│   │   │   ├── dto/               # CreateUserDto, UpdateUserDto, QueryUserDto
│   │   │   ├── interfaces/        # User interfaces
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── common/                # Shared Utilities, Decorators, Filters, & Guards
│   │   │   ├── decorators/        # @CurrentUser(), @Public(), @Roles(), @ResponseMessage()
│   │   │   ├── filters/           # Global HttpExceptionFilter
│   │   │   ├── guards/            # JwtAuthGuard, RolesGuard
│   │   │   ├── interceptors/      # ResponseInterceptor (Standard API JSON output)
│   │   │   ├── interfaces/        # ApiResponse, JwtPayload, PaginatedResult
│   │   │   └── utils/             # Hash util (Argon2), Token util, Date helpers
│   │   ├── prisma/                # Prisma Module & PrismaService
│   │   ├── app.controller.ts      # Health check endpoint (/api/v1/health)
│   │   ├── app.service.ts
│   │   ├── app.module.ts          # Root Module
│   │   ├── setup-app.ts           # Konfigurasi CORS, Global Pipes, Versioning
│   │   └── main.ts                # Local bootstrap entrypoint
│   ├── .env.example               # Contoh environment variable backend
│   ├── eslint.config.mjs          # ESLint 9 Flat Config
│   ├── nest-cli.json              # Konfigurasi Nest CLI
│   ├── package.json
│   ├── tsconfig.json              # TypeScript configuration
│   ├── tsconfig.build.json        # Build configuration untuk tsc
│   └── vercel.json                # Konfigurasi deployment serverless Vercel
│
├── frontend/                      # Aplikasi Frontend (React 19 + Vite + shadcn/ui)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # Komponen Primitif shadcn/ui (Black & White Theme)
│   │   │   │   ├── badge.tsx      # Status Badge (CONFIRMED, BOOKED, Available)
│   │   │   │   ├── button.tsx     # Variant Button (default, outline, ghost, destructive)
│   │   │   │   ├── card.tsx       # Card, CardHeader, CardTitle, CardContent
│   │   │   │   ├── input.tsx      # Accessible Input field
│   │   │   │   ├── label.tsx      # CVA Form Label
│   │   │   │   └── table.tsx      # Accessible Table (Header, Body, Row, Cell)
│   │   │   ├── auth/              # Komponen Khusus Autentikasi
│   │   │   │   └── LoginForm.tsx  # Form login resmi shadcn dengan Show/Hide password
│   │   │   ├── dashboard/         # Komponen Modular Dashboard
│   │   │   │   ├── Sidebar.tsx    # Collapsible Sidebar (Bookings, Rooms, Users, Logout)
│   │   │   │   ├── Header.tsx     # Header bar (Judul, Action Button, Search, Filter)
│   │   │   │   ├── StatCard.tsx   # Metric card serbaguna (Title, Value, Description, Icon)
│   │   │   │   ├── BookingsView.tsx # Tampilan & tabel data Bookings
│   │   │   │   ├── RoomsView.tsx  # Tampilan & tabel data Rooms
│   │   │   │   └── UsersView.tsx  # Tampilan & tabel data Users
│   │   │   └── layouts/           # Reusable Layout Shells
│   │   │       ├── AuthLayout.tsx # Layout container untuk halaman Login
│   │   │       └── DashboardLayout.tsx # Layout container untuk Dashboard + Sidebar
│   │   ├── pages/                 # Halaman Utama (Deklaratif & Ringkas)
│   │   │   ├── LoginPage.tsx      # Halaman Login
│   │   │   └── DashboardPage.tsx  # Halaman Dashboard
│   │   ├── types/
│   │   │   └── dashboard.ts       # Type definitions (TabType, BookingItem, RoomItem, dll)
│   │   ├── lib/
│   │   │   └── utils.ts           # Helper cn (clsx + tailwind-merge)
│   │   ├── App.tsx                # Konfigurasi Routing (react-router-dom)
│   │   ├── index.css              # Tailwind Base & Token Warna Monokrom (Zinc/Neutral)
│   │   └── main.tsx               # Client entrypoint React DOM
│   ├── .env.example               # Contoh environment variable frontend
│   ├── components.json            # Konfigurasi shadcn/ui CLI
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js         # Konfigurasi Tailwind & Animasi
│   ├── tsconfig.json
│   └── vite.config.ts             # Vite configuration & path alias @/
│
├── docker/                        # Aset Kontainerisasi Docker
│   ├── Dockerfile.backend         # Multi-stage build NestJS & Prisma
│   ├── Dockerfile.frontend        # Multi-stage build Vite React & Nginx
│   └── nginx.conf                 # Konfigurasi Nginx reverse proxy
│
├── docker-compose.yml             # Orkestrasi Docker untuk menjalankan BE & FE
├── .gitignore
└── README.md
```

---

## 🛠️ Prasyarat Sistem (Prerequisites)

Pastikan lingkungan lokal kamu sudah terpasang:
* **Node.js**: Versi `20.x` atau `22.x LTS` (Rekomendasi `Node 22`)
* **NPM**: Versi `9.x` atau lebih baru
* **PostgreSQL Database**: PostgreSQL Serverless ([Neon.tech](https://neon.tech/), [Supabase](https://supabase.com/), atau PostgreSQL lokal/Docker).

---

## 🚀 Panduan Setup & Instalasi Lokal

### 1. Clone Repositori

```bash
git clone https://github.com/fikrimutaqin/booking-rooms.git
cd booking-rooms
```

---

### 2. Setup Backend (NestJS + Prisma)

Buka terminal dan masuk ke folder `backend`:

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
Buka file `.env` dan sesuaikan nilainya:
```env
PORT=3000

# URL Database PostgreSQL (Gunakan Connection Pooler):
DATABASE_URL="postgresql://username:password@ep-sample-12345.region.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"

# Direct URL khusus untuk migrasi Prisma CLI:
DIRECT_URL="postgresql://username:password@ep-sample-12345.region.aws.neon.tech/neondb?sslmode=require"

# JWT Secret untuk Autentikasi:
JWT_SECRET="super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="1d"
```

#### C. Migrasi Database & Generate Client
Jalankan perintah migrasi untuk membuat tabel database PostgreSQL:
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

#### E. Menjalankan Backend Dev Server
```bash
npm run dev
```
Backend akan aktif di: **`http://localhost:3000`** (dengan prefix API: `http://localhost:3000/api/v1/health`).

> **Tips GUI Database:** Jalankan `npm run db:studio` untuk membuka Prisma Studio di browser (`http://localhost:5555`).

---

### 3. Setup Frontend (React 19 + shadcn/ui)

Buka tab terminal baru dan masuk ke folder `frontend`:

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
API_URL=https://booking-rooms-rust.vercel.app/api/v1
VITE_API_URL=https://booking-rooms-rust.vercel.app/api/v1
```

#### C. Menjalankan Frontend Dev Server
```bash
npm run dev
```
Buka browser di: **`http://localhost:5173`**.

---

## 🧭 Halaman & Fitur Frontend

1. **Halaman Login (`/login`)**:
   - Template resmi **shadcn/ui** dengan palet monokrom hitam putih (Zinc/Neutral).
   - Form input Email (`autoComplete="username"`) dan Password (`autoComplete="current-password"`).
   - Fitur toggle **Show / Hide Password** dengan keyboard accessibility.
   - Klik tombol **Login** untuk langsung masuk ke Dashboard.

2. **Halaman Dashboard (`/dashboard`)**:
   - **Collapsible Sidebar**: Sidebar di sebelah kiri yang dapat diciutkan (*collapse*) ke mode mini icon-bar (`w-16`) atau diperluas (*expand*) ke ukuran penuh (`w-64`).
   - **Tab Navigasi Sidebar**:
     - 📅 **Bookings**: Metrik reservasi dan tabel jadwal pemesanan ruangan dengan status badge (`CONFIRMED`, `BOOKED`, `CANCELLED`).
     - 🚪 **Rooms**: Metrik ruangan dan tabel daftar ruangan (kapasitas, fasilitas, lokasi, status ketersediaan).
     - 👥 **Users**: Metrik tim dan tabel direktori pengguna (nama, email, role `ADMIN` / `EMPLOYEE`).
     - 🚪 **Logout**: Tombol di bagian bawah sidebar untuk kembali ke halaman Login.
   - **Zero Backend Integration**: Berjalan murni di sisi frontend dengan mock data sehingga aman untuk pengujian UI tanpa server aktif.

---

## 🪝 Pola Pemanggilan API via Custom Hooks (Frontend)

Frontend telah dilengkapi dengan arsitektur pemanggilan API yang membaca variabel `API_URL` dari `.env`, otomatis menyematkan header *Bearer Token*, dan dapat dipanggil langsung dari komponen React melalui **Custom Hooks**:

### 1. Hook Deklaratif `useFetch` (Otomatis ambil data GET saat mount)
```tsx
import { useFetch } from '@/hooks';

export function RoomsList() {
  const { data: rooms, loading, error, refetch } = useFetch<RoomItem[]>('/rooms');

  if (loading) return <div>Memuat data ruangan...</div>;
  if (error) return <div>Gagal memuat: {error}</div>;

  return (
    <div>
      {rooms?.map((room) => (
        <div key={room.id}>{room.name}</div>
      ))}
      <button onClick={() => refetch()}>Refresh Data</button>
    </div>
  );
}
```

### 2. Hook Imperatif `useApi` (Untuk mutasi form: POST, PATCH, DELETE)
```tsx
import { useApi, apiClient } from '@/hooks';

export function AddRoomForm() {
  const { execute, loading, error } = useApi();

  const handleCreate = async () => {
    await execute(() =>
      apiClient.post('/rooms', {
        name: 'Meeting Room Alpha',
        capacity: 10,
        facilities: ['TV', 'Whiteboard'],
        location: 'Lt. 2',
      })
    );
    alert('Ruangan berhasil ditambahkan!');
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? 'Menyimpan...' : 'Tambah Ruangan'}
    </button>
  );
}
```

### 3. Domain Hook Siap Pakai (`useRooms`, `useBookings`, `useAuth`)
```tsx
import { useRooms } from '@/hooks';

export function RoomsView() {
  const { rooms, loading, error, createRoom, deleteRoom } = useRooms();

  return (
    <div>
      {rooms.map((room) => (
        <div key={room.id}>
          {room.name} - Kapasitas: {room.capacity}
          <button onClick={() => deleteRoom(room.id)}>Hapus</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔑 Akun Default Seeder

Data akun berikut dibuat secara otomatis saat menjalankan perintah `npm run db:seed`:

| Role | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `rpl.11.fikrimutaqin@gmail.com` | `Admin123` | Akses penuh: manajemen user, kelola ruangan, approve booking |
| **EMPLOYEE** | `rpl.11.fikrimutaqin+1@gmail.com` | `Employee123` | Akses reservasi ruangan dan melihat jadwal |

---

## 📡 Daftar Endpoint API Utama (Backend)

Semua endpoint API menggunakan URI prefix dan versioning `/api/v1/`:

### 1. Autentikasi (`/api/v1/auth`)
* `POST /api/v1/auth/register` - Pendaftaran akun baru
* `POST /api/v1/auth/login` - Login dan mendapatkan Access & Refresh Token
* `POST /api/v1/auth/refresh` - Memperbarui Access Token menggunakan Refresh Token
* `GET /api/v1/auth/profile` - Mengambil data user yang sedang login (Memerlukan JWT Bearer Token)

### 2. Ruangan (`/api/v1/rooms`)
* `GET /api/v1/rooms` - Mengambil daftar seluruh ruangan (Mendukung pagination & pencarian)
* `GET /api/v1/rooms/:id` - Mengambil detail satu ruangan
* `POST /api/v1/rooms` - Menambah ruangan baru (*Khusus ADMIN*)
* `PATCH /api/v1/rooms/:id` - Memperbarui data ruangan (*Khusus ADMIN*)
* `DELETE /api/v1/rooms/:id` - Menghapus ruangan (*Khusus ADMIN*)

### 3. Pemesanan Ruangan (`/api/v1/bookings`)
* `GET /api/v1/bookings` - Mengambil daftar pemesanan ruangan
* `GET /api/v1/bookings/:id` - Mengambil detail pemesanan
* `POST /api/v1/bookings` - Membuat reservasi ruangan baru (Validasi anti-bentrok jadwal & jam operasional)
* `PATCH /api/v1/bookings/:id` - Mengubah jadwal reservasi
* `DELETE /api/v1/bookings/:id` - Membatalkan reservasi

### 4. Manajemen Pengguna (`/api/v1/users`)
* `GET /api/v1/users` - Mengambil daftar pengguna (*Khusus ADMIN*)
* `GET /api/v1/users/:id` - Mengambil detail pengguna
* `PATCH /api/v1/users/:id` - Mengupdate data pengguna
* `DELETE /api/v1/users/:id` - Menghapus akun pengguna (*Khusus ADMIN*)

### 5. Health Check
* `GET /api/v1/health` - Cek status koneksi server dan database PostgreSQL

---

## 🐳 Menjalankan via Docker Compose

Jika kamu memiliki Docker terpasang, seluruh sistem (Backend, Frontend, dan Nginx Reverse Proxy) dapat dijalankan hanya dengan satu perintah dari root folder:

```bash
docker compose up --build
```

### Akses Port Docker:
* **Frontend (Aplikasi Web)**: [http://localhost](http://localhost) atau [http://localhost:5173](http://localhost:5173)
* **Backend API Langsung**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

---

## ☁️ Catatan Deployment ke Vercel (Backend Serverless)

Saat men-deploy folder `backend` ke **Vercel**:
1. Di Dashboard Vercel, masuk ke **Project Settings** -> **General** -> Atur **Root Directory** ke folder **`backend`**.
2. Masukkan Environment Variables di Vercel: `DATABASE_URL`, `DIRECT_URL`, dan `JWT_SECRET`.
3. Script build di `backend/package.json` sudah diatur otomatis menjalankan `prisma generate && nest build` dan seluruh modul menggunakan *relative import paths* untuk menjamin eksekusi serverless tanpa masalah resolusi alias.

---

## 🧹 Linting & Formatting Kode

* **Backend:**
  ```bash
  cd backend
  npm run lint       # Menjalankan ESLint 9 Flat Config autofix
  npm run format     # Format kode dengan Prettier
  ```
* **Frontend:**
  ```bash
  cd frontend
  npm run lint       # Cek standar kode React 19 & TypeScript
  npm run build      # Verifikasi type checking & Vite production bundle
  ```
