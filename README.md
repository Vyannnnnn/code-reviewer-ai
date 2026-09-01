# Code Reviewer AI

Code Reviewer AI adalah aplikasi full-stack untuk melakukan audit kode secara otomatis menggunakan AI.  
Repository ini terdiri dari backend NestJS (API + worker queue) dan frontend Angular (editor + dashboard hasil audit).

## Deskripsi Profesional

Platform ini membantu developer mengidentifikasi kerentanan keamanan, bug, isu performa, dan style issue dari potongan kode secara cepat.  
Proses audit berjalan asinkron melalui queue, lalu hasil analisis disimpan ke database dan ditampilkan dalam antarmuka yang mudah dibaca.

## Arsitektur

- **Frontend (`/frontend`)**: Angular 22, UI audit editor, polling status audit, tampilan skor & temuan.
- **Backend (`/backend`)**: NestJS 11, REST API, worker BullMQ, integrasi AI (Groq SDK).
- **Database**: PostgreSQL via Prisma.
- **Queue**: Redis untuk pemrosesan audit asinkron.

## Fitur Utama

- Submit source code dari UI untuk dianalisis.
- Pemrosesan audit asinkron (status: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).
- Ringkasan audit dan skor kualitas (0–100).
- Daftar issue lengkap dengan severity, lokasi baris, deskripsi, dan rekomendasi perbaikan.

## Menjalankan Proyek Lokal

### 1) Backend

```bash
cd backend
npm install
```

Buat file `.env`:

```env
DATABASE_URL=YOUR_POSTGRES_CONNECTION_URL
REDIS_HOST=localhost
REDIS_PORT=6379
GROQ_API_KEY=your_groq_api_key
PORT=3000
```

Setup database:

```bash
npx prisma generate
npx prisma db push
```

Jalankan backend:

```bash
npm run start:dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm start
```

Frontend default: `http://localhost:4200`  
Backend default: `http://localhost:3000/api`

## API Ringkas

- `POST /api/audits` — submit audit baru.
- `GET /api/audits` — daftar audit.
- `GET /api/audits/:id` — detail hasil audit.

## Struktur Direktori

```text
code-reviewer-ai/
├── backend/
│   ├── src/
│   └── prisma/
└── frontend/
    └── src/
```
