-- Skema awal FritzyForce (Cloudflare D1 / SQLite).
-- Semua waktu disimpan sebagai ISO-8601 UTC, kecuali kolom `date` (YYYY-MM-DD, kalender WIB).

PRAGMA foreign_keys = ON;

-- ───────────── Admin & sesi ─────────────
CREATE TABLE admins (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_login_at TEXT
);

CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,            -- SHA-256 dari token cookie, token asli tidak disimpan
  admin_id   TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_sessions_admin ON sessions(admin_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Pencatatan percobaan untuk rate limit (login, kirim fanwall).
CREATE TABLE rate_events (
  bucket     TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_rate_events ON rate_events(bucket, created_at);

-- ───────────── Pengaturan & profil ─────────────
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- slug: 'fritzy' (profil Fritzy), 'fanbase' (About Us), 'esport'
CREATE TABLE profiles (
  slug         TEXT PRIMARY KEY,
  name         TEXT NOT NULL DEFAULT '',
  tagline      TEXT NOT NULL DEFAULT '',
  jiko         TEXT NOT NULL DEFAULT '',
  summary      TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL DEFAULT '',
  image_key    TEXT,
  details_json TEXT NOT NULL DEFAULT '[]',
  links_json   TEXT NOT NULL DEFAULT '[]',
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ───────────── Jadwal ─────────────
CREATE TABLE events (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,              -- theater | video-call | offair | event | live | lainnya
  starts_at   TEXT NOT NULL,
  ends_at     TEXT,
  location    TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  url         TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'scheduled', -- scheduled | postponed | cancelled
  source      TEXT NOT NULL DEFAULT 'manual',    -- manual | jkt48connect
  external_id TEXT UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_events_starts ON events(starts_at);
CREATE INDEX idx_events_category ON events(category, starts_at);

-- ───────────── Berita ─────────────
CREATE TABLE posts (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT 'berita',
  cover_key    TEXT,
  status       TEXT NOT NULL DEFAULT 'draft', -- draft | published
  published_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_posts_published ON posts(status, published_at);

-- ───────────── Diskografi ─────────────
CREATE TABLE discography (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  type         TEXT NOT NULL,              -- setlist | single | coupling | mv | special-mv | performance | offair | notable
  release_date TEXT,
  description  TEXT NOT NULL DEFAULT '',
  cover_key    TEXT,
  video_url    TEXT NOT NULL DEFAULT '',
  links_json   TEXT NOT NULL DEFAULT '[]',
  featured     INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_discography_type ON discography(type, release_date);

-- ───────────── Rekap kegiatan (sinkron dari Google Sheets) ─────────────
CREATE TABLE activities (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL,              -- YYYY-MM-DD
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  total       TEXT NOT NULL DEFAULT '',
  location    TEXT NOT NULL DEFAULT '',
  notes       TEXT NOT NULL DEFAULT '',
  link_label  TEXT NOT NULL DEFAULT '',
  link_url    TEXT NOT NULL DEFAULT '',
  source_tab  TEXT NOT NULL
);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_activities_type ON activities(type, date);
CREATE INDEX idx_activities_md ON activities(substr(date, 6, 5));

CREATE TABLE show_recaps (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date       TEXT NOT NULL,
  show       TEXT NOT NULL,
  show_count INTEGER,
  total_show INTEGER,
  unit_songs TEXT NOT NULL DEFAULT '[]',
  lineup     TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_show_recaps_date ON show_recaps(date);
CREATE INDEX idx_show_recaps_show ON show_recaps(show);

CREATE TABLE sync_runs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  kind       TEXT NOT NULL,               -- recap | theater
  ok         INTEGER NOT NULL,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_sync_runs ON sync_runs(kind, created_at);

-- ───────────── Timeline pencapaian (kurasi admin) ─────────────
CREATE TABLE timeline (
  id          TEXT PRIMARY KEY,
  date        TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'pencapaian',
  link_url    TEXT NOT NULL DEFAULT '',
  image_key   TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_timeline_date ON timeline(date);

-- ───────────── Galeri ─────────────
CREATE TABLE albums (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind        TEXT NOT NULL DEFAULT 'project', -- project | kegiatan
  date        TEXT,
  published   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE photos (
  id         TEXT PRIMARY KEY,
  album_id   TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  r2_key     TEXT NOT NULL,
  alt        TEXT NOT NULL DEFAULT '',
  caption    TEXT NOT NULL DEFAULT '',
  width      INTEGER,
  height     INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_photos_album ON photos(album_id, sort_order, created_at);

-- ───────────── Fanwall ─────────────
CREATE TABLE fanwall (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  message    TEXT NOT NULL,
  theme      TEXT NOT NULL DEFAULT 'lilac',
  status     TEXT NOT NULL DEFAULT 'pending', -- pending | approved | hidden
  pinned     INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_fanwall_status ON fanwall(status, pinned, created_at);

-- ───────────── Komunitas & aliansi (About Us) ─────────────
CREATE TABLE communities (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  kind        TEXT NOT NULL DEFAULT 'komunitas', -- komunitas | aliansi
  description TEXT NOT NULL DEFAULT '',
  url         TEXT NOT NULL DEFAULT '',
  logo_key    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ───────────── Data awal yang terverifikasi ─────────────
-- Nama & generasi Fritzy berasal dari sheet "Fritzy Rosmerian − Recap" (debut Gen 12, Jak Japan Matsuri 2023).
INSERT INTO profiles (slug, name, tagline) VALUES ('fritzy', 'Fritzy Rosmerian', 'JKT48 Generasi 12');
INSERT INTO profiles (slug, name) VALUES ('fanbase', 'Fritzy Force');
INSERT INTO profiles (slug, name) VALUES ('esport', 'Fritzy Force Esport');

-- Afiliasi yang disebut di spesifikasi tim ("part of One Alliance dan Lovespire").
INSERT INTO communities (id, name, kind, sort_order) VALUES ('one-alliance', 'One Alliance', 'aliansi', 1);
INSERT INTO communities (id, name, kind, sort_order) VALUES ('lovespire', 'Lovespire', 'aliansi', 2);

INSERT INTO settings (key, value) VALUES ('fanwall_moderation', '"on"');
