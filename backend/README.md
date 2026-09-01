# Backend — Code Reviewer AI

Backend ini menyediakan API audit kode, worker queue untuk pemrosesan asinkron, dan integrasi model AI untuk menghasilkan hasil review kode yang terstruktur.

## Deskripsi Profesional

Service backend dibangun dengan NestJS dan dirancang untuk memproses permintaan audit secara scalable.  
Setiap request disimpan ke PostgreSQL, diproses lewat BullMQ (Redis), lalu dikembalikan sebagai laporan audit berisi skor, ringkasan, dan issue terklasifikasi.

## Teknologi

- NestJS 11
- Prisma ORM
- PostgreSQL
- BullMQ + Redis
- Groq SDK

## Environment Variables

Buat file `.env` di folder `backend`:

```env
DATABASE_URL=YOUR_POSTGRES_CONNECTION_URL
REDIS_HOST=localhost
REDIS_PORT=6379
GROQ_API_KEY=your_groq_api_key
PORT=3000
```

## Setup

```bash
npm install
npx prisma generate
npx prisma db push
```

## Menjalankan Backend

```bash
# development
npm run start:dev

# production build
npm run build
npm run start:prod
```

## Testing & Linting

```bash
npm run lint
npm run test
npm run test:e2e
npm run test:cov
```

## Endpoint Utama

- `POST /api/audits` — kirim source code untuk diaudit.
- `GET /api/audits` — ambil daftar riwayat audit.
- `GET /api/audits/:id` — ambil detail hasil audit beserta issues.
