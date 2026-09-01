# Frontend — Code Reviewer AI

Frontend ini menyediakan antarmuka untuk menulis/menempel source code, menjalankan audit AI, dan menampilkan hasil analisis secara real-time.

## Deskripsi Profesional

Aplikasi dibangun dengan Angular modern dan berfokus pada pengalaman audit yang cepat serta mudah dipahami.  
Hasil audit menampilkan skor keamanan, ringkasan eksekutif, dan daftar issue lengkap dengan severity serta rekomendasi perbaikan.

## Teknologi

- Angular 22
- Tailwind CSS
- Chart.js
- RxJS

## Setup

```bash
npm install
```

## Menjalankan Frontend

```bash
npm start
```

Default URL: `http://localhost:4200`

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Koneksi API

Secara default frontend memanggil backend di:

`http://localhost:3000/api/audits`
