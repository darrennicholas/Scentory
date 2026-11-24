# Scentory

Scentory adalah aplikasi personal fragrance journal single-user dengan frontend Next.js dan backend Express TypeScript, Prisma, dan PostgreSQL. Enam modul tersedia: Perfumes, Fragrance Notes, Collections, Reviews, Wishlist, dan Insights.

Backend mengikuti alur `routes → validators/middleware → controllers → services → Prisma`. Routes memasang endpoint dan validasi request, controllers membentuk response, dan services menangani business logic, relasi, transaksi, serta agregasi.

## Persyaratan

- Node.js dan npm
- PostgreSQL berjalan dan database `scentory` tersedia

## Menjalankan secara lokal

1. Salin `backend/.env.example` ke `backend/.env` dan sesuaikan `DATABASE_URL`, `PORT`, serta `FRONTEND_URL`. Jika PostgreSQL menggunakan password, masukkan ke URL; URL-encode karakter khusus.
2. Salin `frontend/.env.example` ke `frontend/.env.local` dan sesuaikan `NEXT_PUBLIC_API_URL` jika diperlukan.
3. Dari root proyek, jalankan `npm install` lalu `npm run db:generate -w @scentory/backend`.
4. Untuk database baru yang kosong, jalankan `npm run db:migrate -w @scentory/backend`. Database lokal `scentory` yang telah disiapkan sudah memiliki migrasi awal dan sudah tercatat di Prisma.
5. Opsional: `npm run db:seed -w @scentory/backend` menambahkan data contoh secara idempotent untuk Notes, Perfumes, Collections, Reviews, dan Wishlist. Insights dihitung otomatis dari data tersebut. Setiap perfume, cover collection, dan wishlist item memakai gambar WebP lokal yang berbeda di `storage/public/images`, disajikan melalui `/storage/images`; seeder tidak menghapus data pengguna.
6. Jalankan `npm run dev`. Frontend tersedia di `http://localhost:3000`, backend di `http://localhost:5000`, dan endpoint pemeriksaan dasar di `http://localhost:5000/api/health`.
7. Jalankan `npm run build` untuk build frontend dan backend.

## Pengujian

Dengan server berjalan, jalankan `node backend/tests/library-smoke.cjs`, `node backend/tests/journal-smoke.cjs`, `node backend/tests/collections-smoke.cjs`, `node backend/tests/acceptance-smoke.cjs`, `node backend/tests/insights-smoke.cjs`, dan `node backend/tests/relationships-smoke.cjs`. Pengujian membuat data sementara dan membersihkannya setelah selesai.

Referensi visual dan peta halaman berada di `references/`. Aplikasi tanpa autentikasi ini hanya untuk penggunaan development pribadi; akses tulis harus dibatasi sebelum dipublikasikan.
