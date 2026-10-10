# FritzyForce

Website fanbase **Fritzy Force** (Fritzy JKT48): profil, jadwal, diskografi, timeline, rekap kegiatan, berita, galeri, fanwall, games, About Us & esport, plus dashboard admin.

Stack: **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4**, di-deploy ke **Cloudflare Workers** via **OpenNext** (`@opennextjs/cloudflare`), dengan **D1** (database), **R2** (gambar), dan **Cron Trigger** (sinkronisasi otomatis).

---

## Sumber requirement

Diimplementasikan dari spreadsheet **"FF website"**, tab *Fanbase Profile* dan *Fanbase Profile New*:

| Requirement | Implementasi |
| --- | --- |
| Homepage: Nama + Jiko + Foto, tanpa hashtag | Hero beranda dari profil Fritzy (dikelola admin) |
| Countdown → jadwal teater | Hitung mundur ke teater berikutnya (`events` kategori `theater`) |
| Hapus semua terkait ulang tahun & request hour | Tidak ada fitur ulang tahun/request hour |
| Games di navbar, tombol di bawah countdown dihapus; konten game: puzzle | Menu **Games** → puzzle geser 3×3/4×4 dengan foto Fritzy |
| Eksplorasi komunitas (Fritzy's World), copywriting menyusul | Seksi beranda; teks bisa diubah di *Pengaturan* |
| Fanwall, desain per pesan | 4 gaya kartu pesan, moderasi admin, rate limit, honeypot |
| News & articles: keep | Berita & artikel lengkap (draf/terbit/jadwal, Markdown, sampul, OG) |
| Profile: tanpa "Kesukaan & Keahlian" dan "Official Hashtags" | Field tidak ada; rincian bebas via CMS |
| Schedule: live hanya untuk admin, paginate | Kategori *Live* disembunyikan dari publik; tampil di dashboard admin; paginasi |
| CRUD Schedule (scraping & otomatis) | Sinkron otomatis teater yang ada Fritzy dari JKT48Connect (SDK resmi `@jkt48connect-id/api`) + CRUD manual |
| Setlist → Discography (single, coupling, special MV, MV, performance, offair, notable) | Diskografi CRUD + setlist dihitung otomatis dari *Show Recap* |
| Timeline: filter achievement | Timeline dikurasi admin; kegiatan rekap bisa dipromosikan ke timeline |
| Gallery: foto kegiatan ZyFriends & project FF (STS, 100show) | Album *Project FF* / *Kegiatan ZyFriends*, unggah ke R2 |
| About Us: ubah semua, halaman esport, list komunitas, part of One Alliance & Lovespire | `/tentang` (profil fanbase + komunitas + aliansi), `/esport` |
| Kegiatan Fritzy: dari sheets rekap, otomatis update ke DB | Sinkron sheet **"Fritzy Rosmerian − Recap"** (tab tahunan + Show Recap) → D1 |
| Auto tracking "zythisdate" di landing page | Seksi **Zy This Date**: kegiatan pada tanggal yang sama di tahun-tahun sebelumnya |
| Admin: CRUD fanwall, discography, schedule | Ada, beserta berita, galeri, timeline, profil, komunitas, pengaturan, admin |

Belum dicakup (direncanakan terpisah di tab *Timeline*/*Membership*/*Merchandise*): sistem keanggotaan, pembayaran kas, dan merchandise. Pertanyaan terbuka di sheet ("fangirl?") belum diputuskan sehingga tidak diimplementasikan.

## Rute

Publik: `/`, `/fritzy`, `/diskografi`, `/diskografi/[slug]`, `/diskografi/setlist/[show]`, `/timeline`, `/kegiatan`, `/jadwal`, `/berita`, `/berita/[slug]`, `/galeri`, `/galeri/[slug]`, `/fanwall`, `/games`, `/tentang`, `/esport`, `/sitemap.xml`, `/robots.txt`, `/media/*` (gambar R2).
Redirect lama: `/about`, `/about-us` → `/tentang`; `/profile` → `/fritzy`; `/schedule` → `/jadwal`; `/setlist`, `/discography` → `/diskografi`; `/gallery` → `/galeri`; `/news` → `/berita`; `/game` → `/games`.

Admin (`/admin`, tidak diindeks): ringkasan, jadwal, rekap kegiatan, timeline, diskografi, berita, galeri, fanwall, profil, komunitas, pengaturan. Login di `/admin/login`; admin pertama dibuat di `/admin/setup`.

## Keamanan

- Password di-hash PBKDF2-SHA256 (100.000 iterasi, salt acak) lewat Web Crypto.
- Sesi: token acak 256-bit di cookie `HttpOnly`, `Secure`, `SameSite=Lax`; database hanya menyimpan hash SHA-256 token. Kedaluwarsa 7 hari.
- Setiap halaman & server action admin memanggil `requireAdmin()` di server. Server Actions Next.js memeriksa Origin (proteksi CSRF).
- Rate limit: login 5 gagal/akun & 20/IP per 15 menit; fanwall 3 pesan/IP per 10 menit; setup admin 10/IP per jam.
- Admin pertama hanya bisa dibuat bila tabel admin kosong **dan** token `ADMIN_SETUP_TOKEN` cocok.
- Upload: maks. 8 MB, jenis file divalidasi dari byte aslinya (JPG/PNG/WebP/GIF/AVIF), disimpan di R2 dengan nama acak. `/media` hanya melayani prefix `u/` dengan `nosniff` + CSP ketat.
- Markdown dirender dengan `markdown-it` (`html: false`) dan link hanya http(s) → tidak bisa menyisipkan script.
- Query D1 selalu memakai parameter terikat. Header keamanan (HSTS, nosniff, frame DENY, referrer policy) di `next.config.ts`.

## Pengembangan lokal

```bash
npm install
cp .dev.vars.example .dev.vars      # isi nilai lokal
npm run db:migrate:local            # opsional: tabel juga dibuat otomatis saat request pertama
npm run dev                         # Next dev server (binding D1/R2 lokal via wrangler)
npm run preview                     # build OpenNext + jalankan di runtime Workers lokal
```

Cek kualitas: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Deploy ke Cloudflare Workers

### Lewat Workers Builds (repo GitHub terhubung)

Pengaturan build di dashboard Cloudflare (Workers → proyek → Settings → Build):

| Kolom | Nilai |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

- `npm run build` membangkitkan skema D1 lalu menjalankan `opennextjs-cloudflare build` (menghasilkan `.open-next/`).
- D1 `fritzyforce-db` dan R2 `fritzyforce-media` **dibuat otomatis** saat deploy pertama (auto-provisioning Wrangler), karena `database_id` sengaja dikosongkan.
- Tabel database **dibuat otomatis** oleh Worker saat request pertama (`src/lib/schema.ts`), tercatat di tabel `d1_migrations` sehingga tetap kompatibel dengan `wrangler d1 migrations apply`.
- Nama Worker di dashboard harus sama dengan `"name"` di `wrangler.jsonc` (`fritzyforce`).

Lalu tambahkan secret di Settings → Variables and Secrets (tipe *Secret*):

| Nama | Isi |
| --- | --- |
| `ADMIN_SETUP_TOKEN` | token bebas (panjang/isi apa saja) untuk membuat admin pertama di `/admin/setup`; boleh dihapus setelah admin dibuat |
| `CRON_SECRET` | string acak panjang, untuk endpoint sinkronisasi cron |
| `JKT48_API_KEY` | (opsional) API key JKT48Connect (`jk48c_…`) untuk sinkron jadwal teater dari `/api/v1/theater` |

Setelah deploy: buka `/admin/setup`, buat admin, lalu unggah foto Fritzy di Admin → Profil.

### Lewat CLI

```bash
npx wrangler login
npm run deploy                              # build + deploy (D1 & R2 dibuat otomatis)
npx wrangler secret put ADMIN_SETUP_TOKEN
npx wrangler secret put CRON_SECRET
npx wrangler secret put JKT48_API_KEY       # opsional
```

Domain `fritzyforce.my.id` dihubungkan di Workers → Settings → Domains & Routes. Variabel `SITE_URL`, `FRITZY_MEMBER_KEY`, dan `RECAP_SHEET_ID` ada di `vars` pada `wrangler.jsonc`.

### Sinkronisasi otomatis

`worker.ts` membungkus worker OpenNext dan menambahkan handler `scheduled` (cron `17 */3 * * *`) yang memanggil `POST /api/cron/sync` dengan `Authorization: Bearer CRON_SECRET`:

- **Teater** — `GET https://jkt48connect.com/api/v1/theater?page=N` dengan header `x-api-key: JKT48_API_KEY` (tier Free, cache 5 menit). Halaman dibaca berurutan sampai kosong (maks. 5). Show yang `lineup[].url_key`/`name`-nya cocok dengan `FRITZY_MEMBER_KEY` di-upsert ke `events` (`external_id = jkt48:<reference_code>`); `date` + `start_time`/`end_time` dibaca sebagai WIB. Base URL bisa diubah lewat var `JKT48_API_BASE`.
- **Rekap kegiatan** — tiap tab yang dikonfigurasi (default `2023, 2024, 2025, 2026, Show Recap`, bisa diubah di *Admin → Rekap kegiatan*) diunduh sebagai CSV dari Google Sheets dan menggantikan isi tab tersebut di D1. **Syarat:** sheet *Fritzy Rosmerian − Recap* harus dibagikan "Siapa saja yang memiliki link — Viewer". Bila tidak, gunakan *Impor manual dari CSV* di dashboard.

Kedua sinkronisasi juga bisa dijalankan manual dari dashboard; hasilnya dicatat di tabel `sync_runs`.

## Struktur

```
migrations/            skema D1
worker.ts              entry Worker (OpenNext + cron)
src/app/(site)/        halaman publik
src/app/admin/         login, setup, dan panel admin
src/app/media/         penyajian gambar R2
src/app/api/cron/      endpoint sinkronisasi
src/components/        komponen UI bersama (design system)
src/lib/               data, auth, keamanan, sinkronisasi, utilitas
tests/                 unit test (Vitest)
```
