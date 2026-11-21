# Room Bookings Project: NestJS (v11) + Prisma PostgreSQL (Serverless) + React (Vite) + Docker

Proyek sistem booking ruangan (Room Bookings) ini telah dikonfigurasi lengkap dengan arsitektur modular yang memisahkan Backend, Frontend, dan Docker orchestration.

---

## 📁 Struktur Direktori

```
room-bookings/
├── backend/                  # NestJS v11 + Prisma ORM + ESLint 9 Flat Config
│   ├── prisma/
│   │   └── schema.prisma     # Model: User, Room, Booking (PostgreSQL Serverless)
│   ├── src/
│   │   ├── prisma/           # PrismaService & PrismaModule
│   │   ├── app.controller.ts # REST API (/api/health, /api/users, /api/rooms, /api/bookings)
│   │   ├── app.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts           # Entry point dengan CORS diaktifkan
│   ├── .env                  # Environment database (DATABASE_URL & DIRECT_URL)
│   ├── eslint.config.mjs     # ESLint 9 Flat Config + Prettier
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # React 19 + Vite + TypeScript + ESLint
│   ├── src/
│   │   ├── App.tsx           # Dashboard Room Bookings & API status
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts        # Vite config dengan proxy API ke NestJS
│   ├── eslint.config.js      # ESLint 9 React hooks & refresh
│   └── package.json
│
├── docker/                   # Folder aset Docker
│   ├── Dockerfile.backend    # Multi-stage Dockerfile untuk NestJS & Prisma
│   ├── Dockerfile.frontend   # Multi-stage Dockerfile untuk Vite React + Nginx
│   └── nginx.conf            # Nginx config dengan reverse proxy /api/ -> backend
│
├── docker-compose.yml        # File Docker Compose untuk menjalankan BE & FE
├── .gitignore
└── README.md
```

---

## ⚙️ 1. Konfigurasi Database PostgreSQL Serverless

Karena menggunakan PostgreSQL Serverless (**Prisma Postgres**, **Neon**, **Supabase**, atau **Aiven**):

1. Buka file `backend/.env`:
   ```bash
   cd backend
   ```
2. Isi nilai `DATABASE_URL` (pooled) dan `DIRECT_URL` (direct) di dalam `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@ep-sample-123.region.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"
   DIRECT_URL="postgresql://username:password@ep-sample-123.region.aws.neon.tech/neondb?sslmode=require"
   ```

3. Jalankan migrasi Prisma untuk membuat tabel `users`, `rooms`, dan `bookings`:
   ```bash
   npx prisma migrate dev --name init_room_bookings
   ```

4. Jalankan Prisma Studio (GUI database):
   ```bash
   npx prisma studio
   ```

---

## 🐳 2. Menjalankan Menggunakan Docker

Cukup satu perintah langsung dari root project:

```bash
cd /Users/fikrimutaqin/Project/room-bookings
docker compose up --build
```

Docker Compose secara otomatis membaca environment variable dari file `backend/.env`.

### URL Akses:
- **Frontend (Web UI)**: [http://localhost](http://localhost) atau [http://localhost:5173](http://localhost:5173)
- **Backend (Health Check)**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **API Users**: [http://localhost:3000/api/users](http://localhost:3000/api/users)
- **API Rooms**: [http://localhost:3000/api/rooms](http://localhost:3000/api/rooms)
- **API Bookings**: [http://localhost:3000/api/bookings](http://localhost:3000/api/bookings)

---

## 💻 3. Menjalankan Secara Lokal (Development Tanpa Docker)

### Backend (NestJS):
```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

### Frontend (React Vite):
```bash
cd frontend
npm install
npm run dev
```

---

## 🔍 4. Standardisasi Code dengan ESLint

- **Backend Linting**:
  ```bash
  cd backend
  npm run lint       # Cek & autofix standardisasi kode
  npm run format     # Format kode dengan Prettier
  ```
- **Frontend Linting**:
  ```bash
  cd frontend
  npm run lint       # Cek standar kode React & TypeScript
  ```
