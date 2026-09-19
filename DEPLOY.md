# OMBAR NEWS — Deployment Guide

Portal berita **OMBAR NEWS — "Raja Ampat & Beyond"** dibangun dengan HTML5, CSS3, dan
JavaScript vanilla (tanpa framework). Siap di-hosting di **GitHub Pages**,
**Cloudflare Pages**, atau bahkan **Cloudflare Workers** sebagai situs statis.

> ## ✅ SISTEM SHARE LINK — Sekarang Berfungsi di SEMUA Perangkat
>
> ### Cara Posting Artikel Baru (Agar Bisa Dibagikan):
> 1. Buka `https://situs-anda/admin.html` → login (`admin`/`ombar2026`)
> 2. Klik **Articles** → **Artikel Baru** → isi judul, konten, gambar → **Simpan**
> 3. Klik menu **Export / Import** → **Download ombar-data.json**
> 4. Upload file `ombar-data.json` ke root folder hosting Anda (satu folder dengan `index.html`)
> 5. **Selesai!** Semua pengunjung di semua perangkat (iPhone, Android, desktop) langsung lihat artikel baru
>
> ### Cara Share Link Artikel:
> - Buka artikel di situs → klik tombol share (Facebook / X / WhatsApp / Copy Link)
> - Link format: `https://situs-anda/index.html#article=ARTICLE_ID` (PENDEK ~60 karakter)
> - Link bisa dibuka di **WhatsApp, SMS, email, Twitter, Facebook** — semua platform
> - Link berfungsi di iPhone, Android, desktop — semua perangkat
>
> ### Kenapa Harus Upload ombar-data.json?
> Karena hosting statis (GitHub Pages / Cloudflare Pages) tidak punya database.
> File `ombar-data.json` berfungsi sebagai "database" artikel Anda. Setiap kali
> Anda posting artikel baru via admin, export JSON dan upload ke hosting. Maka
> semua pengunjung melihat artikel terbaru.

---

## 1. Struktur Proyek

```
ombar-news/
├── index.html              # Halaman utama (portal berita)
├── style.css               # Styling utama + dark mode + responsif
├── script.js               # Logika publik (render, routing, interaksi)
├── data-store.js           # Sumber data + persistensi localStorage (CMS-ready)
├── images-data.js          # ⭐ 9 gambar di-embed base64 (bulletproof, ~2.2MB)
├── download.html           # Halaman download ZIP source code (opsional)
├── diagnose.html           # Diagnostik cek gambar (opsional)
├── DEPLOY.md               # File ini
├── README.md               # Info proyek
├── images/                 # 9 gambar asli (opsional — base64 sudah cukup)
│   └── ... (9 file .jpg)
└── admin/                  # Dashboard admin (CMS mini)
    ├── login.html          # Halaman login
    ├── dashboard.html      # Panel kelola konten
    ├── admin.css           # Styling admin
    └── admin.js            # Logika admin (CRUD, export/import)
```

Semua path bersifat **relatif**, sehingga situs bekerja di subpath
(mis. `https://username.github.io/ombar-news/`).

---

## 2. Akses Admin

1. Buka `admin/login.html` (atau klik **Admin Login** di footer situs).
2. Login dengan kredensial default:
   - **Username:** `admin`
   - **Password:** `ombar2026`
3. Anda akan diarahkan ke `admin/dashboard.html`.
4. Ubah password di menu **Security**.

> ⚠️ **Penting soal keamanan:**
> Login ini berbasis **client-side** (sesuai batasan hosting statis tanpa backend).
> Kredensial disimpan di `localStorage` browser admin dan dashboard hanya
> melindungi dari akses langsung di browser yang berbeda. Ini cocok untuk
> konten demo / pribadi. Untuk keamanan produksi yang sebenarnya, hubungkan
> dengan auth backend (NextAuth, Firebase Auth, Supabase Auth, atau
> Cloudflare Access).

---

## 3. Alur Edit & Publikasi Konten

Karena hosting statis tidak punya database, admin bekerja seperti ini:

1. **Edit** artikel / pengaturan / breaking news di dashboard.
   - Perubahan langsung tampil di situs pada **browser yang sama** (karena
     disimpan di `localStorage`).
2. **Export** — buka menu **Export / Import** → klik
   *Download ombar-data.json*. File JSON berisi seluruh konten.
3. **Commit** file `ombar-data.json` ke repo GitHub Anda, **atau** timpa
   array default di dalam `data-store.js` dengan isi JSON tersebut.
4. **Deploy ulang** — perubahan akan tampil untuk **semua pengunjung**
   setelah hosting memublikasikan versi baru.

> Tip: Anda juga bisa meng-import kembali `ombar-data.json` di dashboard
> (menu **Export / Import** → *Pilih file JSON*) untuk melanjutkan edit
> di komputer/browser lain.

---

## 4. Deploy ke GitHub Pages

### Opsi A — GitHub Pages dari branch `main`

1. Buat repository baru di GitHub, mis. `ombar-news`.
2. Ekstrak isi ZIP ke dalam repo (struktur seperti di atas, dengan
   `index.html` di **root** repo).
3. Commit & push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: OMBAR NEWS"
   git branch -M main
   git remote add origin https://github.com/USERNAME/ombar-news.git
   git push -u origin main
   ```
4. Buka **Settings → Pages** di repo GitHub.
5. Pada **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` / folder: `/(root)` → **Save**.
6. Tunggu ±1 menit. Situs akan tersedia di:
   ```
   https://USERNAME.github.io/ombar-news/
   ```

### Opsi B — GitHub Pages dari folder `/docs`

Jika ingin file di subfolder `/docs`:
1. Pindahkan semua file ke folder `docs/`.
2. Pada **Settings → Pages** → Branch: `main` / folder: `/docs`.

> Situs tetap berfungsi karena semua path relatif.

---

## 5. Deploy ke Cloudflare Pages

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages**.
2. Pilih **Connect to Git** → hubungkan akun GitHub → pilih repo `ombar-news`.
3. Konfigurasi build:
   - **Framework preset:** `None`
   - **Build command:** *(kosongkan)*
   - **Build output directory:** `/` (root) — atau `.` (titik)
   - **Root directory:** `/` (default)
4. Klik **Save and Deploy**.
5. Cloudflare akan memublikasikan situs di URL:
   ```
   https://ombar-news.pages.dev/
   ```
6. (Opsional) Hubungkan custom domain di tab **Custom domains**.

> Karena tidak ada build step, deploy sangat cepat. Setiap `git push` ke
> branch produksi akan memicu deploy otomatis.

---

## 6. Deploy Manual (Drag & Drop)

Tanpa Git, Anda tetap bisa deploy cepat:

- **Cloudflare Pages:** tab **Direct Upload** → upload folder ZIP yang
  sudah diekstrak.
- **Netlify Drop:** kunjungi
  [https://app.netlify.com/drop](https://app.netlify.com/drop) → seret
  folder.

---

## 7. Mengganti Gambar

Letakkan gambar baru di folder `images/`. Format disarankan:
- Rasio 16:9 atau 4:3, lebar 1200–1600px.
- Format `.jpg` (foto) atau `.webp` (ukuran lebih kecil).

Untuk memakai gambar baru di artikel, di dashboard:
- Field **URL Gambar** → isi `images/nama-file.jpg`, atau
- pilih dari dropdown **pilih dari library**.

Gambar default di-generate AI dengan tema Raja Ampat (Wayag, terumbu karang,
manta ray, kampung apung, dsb.).

---

## 8. Menghubungkan Backend Asli (Opsional, untuk Produksi)

Struktur kode sudah dipisahkan agar mudah di-integrasikan:

- **Sumber data:** `data-store.js`. Ganti method `getArticles()`,
  `upsertArticle()`, dll. dengan panggilan `fetch()` ke REST API Anda
  (mis. `/api/articles`).
- **Auth:** ganti `D.login()` / `D.isLoggedIn()` di `admin.js` dengan
  panggilan ke endpoint login server + JWT/cookie.
- **Upload gambar:** tambahkan endpoint `/api/upload` yang menerima
  `multipart/form-data`, simpan ke S3/R2/Supabase Storage.
- **Database rekomendasi:** PostgreSQL/MySQL via Prisma, Supabase, atau
  Cloudflare D1.

Setelah backend siap, Anda bisa menghapus dependensi `localStorage` dan
dashboard akan berfungsi sebagai CMS multi-user penuh.

---

## 9. Fitur Situs Publik

- ✅ Header sticky + navigasi 11 kategori + search + dark mode
- ✅ Breaking news ticker berjalan
- ✅ Hero + Popular Now + Latest News grid
- ✅ Section Raja Ampat / Papua Barat Daya / National / World
- ✅ Trending Today + Most Read sidebar
- ✅ OMBAR Photo + OMBAR Video
- ✅ Newsletter + footer lengkap
- ✅ Halaman artikel (breadcrumb, share, related, latest sidebar)
- ✅ Halaman kategori + hasil pencarian
- ✅ Mobile hamburger menu + responsif penuh
- ✅ Back-to-top, scroll reveal, jam real-time
- ✅ SEO: meta tags, Open Graph, Twitter Card, Schema.org NewsArticle

## 10. Fitur Admin Dashboard

- ✅ Login client-side (default: `admin` / `ombar2026`)
- ✅ Overview statistik
- ✅ CRUD artikel dengan editor konten markdown-lite
- ✅ Pustaka gambar + pratinjau
- ✅ Pencarian & filter kategori
- ✅ Kelola breaking news ticker
- ✅ Pengaturan situs (nama, tagline, deskripsi, footer)
- ✅ Ubah kredensial admin
- ✅ Export / Import JSON
- ✅ Reset ke default

---

© 2026 OMBAR NEWS. Raja Ampat & Beyond.
