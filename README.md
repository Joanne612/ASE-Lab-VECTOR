# Finby

Aplikasi pengelola keuangan pribadi untuk membantu mencatat pemasukan dan pengeluaran, mengatur alokasi uang jajan, merencanakan tabungan, dan belajar berinvestasi lewat simulasi saham dan reksa dana.

Repositori ini berisi **frontend** (Next.js). Data disimpan dan diproses oleh backend terpisah yang diakses lewat lapisan BFF (Backend for Frontend) di dalam aplikasi ini.

## Fitur

| Fitur | Deskripsi |
| --- | --- |
| **Autentikasi** | Daftar dan masuk dengan akun Gmail. Sesi disimpan di cookie `httpOnly` dan token diperbarui otomatis. |
| **Beranda** | Ringkasan keuangan per periode (total pemasukan dan pengeluaran). |
| **Transaksi** | Catat pengeluaran, pemasukan, dan transfer antar akun (Tunai, Kartu Bank, Tabungan). Biaya admin transfer dicatat sebagai pengeluaran dari akun asal. |
| **Statistik** | Diagram donat pengeluaran dan pemasukan per kategori pada periode yang dipilih. |
| **Target** | Isi total uang jajan per hari, minggu, atau bulan, lalu dapatkan alokasi ke tiga pos: Kebutuhan, Tabungan, dan Hiburan (default 60% / 30% / 10%) beserta tips. |
| **Ide** | Rencana tabungan: masukkan target tabungan, durasi, jumlah dan frekuensi penerimaan, lalu lihat berapa yang perlu disisihkan. Jika masih kurang, aplikasi menampilkan ide tambahan penghasilan. |
| **Simulasi investasi** | Simulasi saham dan reksa dana dengan pilihan instrumen, pratinjau, dan sesi simulasi bertahap sampai ke hasil untung atau rugi. Daftar instrumen (`/saham`, `/reksadana`) dapat dilihat tanpa login. |

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router, Server Actions, Route Handlers)
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 4
- [SWR](https://swr.vercel.app) untuk pengambilan dan cache data
- [Poppins](https://fonts.google.com/specimen/Poppins) lewat `next/font`
- ESLint 9 dengan `eslint-config-next`

## Arsitektur

```
Browser  ──►  Next.js (BFF)  ──►  Backend API
          /api/<resource>     ASE_BACKEND_URL
```

- Browser tidak pernah memanggil backend langsung. Semua request lewat `/api/<resource>` (`src/app/api/[...path]/route.js`), lalu diteruskan ke backend dengan token dari cookie `httpOnly`.
- Login, registrasi, dan logout memakai Server Action (`src/app/actions/auth.js`).
- Hanya resource tertentu yang diteruskan (`users`, `accounts`, `transactions`, `transfers`, `categories`, `savings`, `goals`, `income-ideas`, `simulation`). Endpoint admin sengaja tidak dibuka.
- `src/proxy.js` mengarahkan pengguna yang belum login dari halaman terproteksi ke `/`, dan pengguna yang sudah login dari `/` atau `/register` ke `/homepage`.
- Respons berisi data keuangan pribadi dikirim dengan `Cache-Control: private, no-store`.
- Header keamanan (CSP `frame-ancestors`, `X-Frame-Options`, `X-Content-Type-Options`, dan lainnya) diatur di `next.config.mjs`.

## Struktur Proyek

```
.
├── public/                  # Aset statis (ikon, ilustrasi, background)
└── src/
    ├── app/
    │   ├── (main)/          # Halaman utama: homepage, statistik, target, ide, simulasi
    │   ├── actions/         # Server Action (login, register, logout)
    │   ├── api/             # BFF: proxy ke backend dan endpoint /health
    │   ├── register/        # Halaman daftar
    │   ├── saham/           # Daftar, detail, dan alur investasi saham
    │   ├── reksadana/       # Daftar, detail, dan alur investasi reksa dana
    │   └── transaksi/       # Tambah transaksi
    ├── components/          # Komponen UI (auth, home, shell, simulasi, target, transaksi, dll.)
    ├── lib/                 # Query SWR, helper API, format, simulasi, rencana tabungan, hook form
    │   └── server/          # Kode server-only (akses backend dan sesi)
    └── proxy.js             # Proteksi route berbasis cookie sesi
```

## Prasyarat

- Node.js 20.9 atau lebih baru
- npm
- Backend Finby yang sudah berjalan (lihat bagian Konfigurasi)

## Instalasi dan Menjalankan

1. Clone repositori:

   ```bash
   git clone https://github.com/Joanne612/ASE-Lab-VECTOR.git
   cd ASE-Lab-VECTOR
   ```

2. Pasang dependensi:

   ```bash
   npm install
   ```

3. Salin file environment lalu sesuaikan nilainya:

   ```bash
   cp .env.example .env.local
   ```

4. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000).

## Scripts

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Membuat build produksi |
| `npm run start` | Menjalankan hasil build produksi |
| `npm run lint` | Menjalankan ESLint |

## Deployment

Aplikasi ini siap di-deploy ke [Vercel](https://vercel.com). 

URL aplikasi: [lurahonline-banjarsarigarut.com](https://lurahonline-banjarsarigarut.com/)

## Tim

| Nama Anggota | Peran |
| --- | --- |
|Riska Dea Bakri|System Analyst|
|Preciosa Leluna Andelfin |UI/UX|
|Joanne Agnesia Nempung|Frontend|
|Adison Simanullang|Backend|
|Yudha Prawira Sugiharto|Quality Assurance|
