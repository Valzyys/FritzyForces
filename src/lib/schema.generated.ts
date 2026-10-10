// FILE INI DIBANGKITKAN OTOMATIS oleh scripts/gen-schema.mjs — jangan diedit manual.

export const MIGRATIONS: { name: string; statements: string[] }[] = [
  {
    "name": "0001_init.sql",
    "statements": [
      "CREATE TABLE admins (\n  id            TEXT PRIMARY KEY,\n  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,\n  name          TEXT NOT NULL,\n  password_hash TEXT NOT NULL,\n  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),\n  last_login_at TEXT\n)",
      "CREATE TABLE sessions (\n  id         TEXT PRIMARY KEY,\n  admin_id   TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,\n  expires_at TEXT NOT NULL,\n  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE INDEX idx_sessions_admin ON sessions(admin_id)",
      "CREATE INDEX idx_sessions_expires ON sessions(expires_at)",
      "CREATE TABLE rate_events (\n  bucket     TEXT NOT NULL,\n  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE INDEX idx_rate_events ON rate_events(bucket, created_at)",
      "CREATE TABLE settings (\n  key        TEXT PRIMARY KEY,\n  value      TEXT NOT NULL,\n  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE TABLE profiles (\n  slug         TEXT PRIMARY KEY,\n  name         TEXT NOT NULL DEFAULT '',\n  tagline      TEXT NOT NULL DEFAULT '',\n  jiko         TEXT NOT NULL DEFAULT '',\n  summary      TEXT NOT NULL DEFAULT '',\n  body         TEXT NOT NULL DEFAULT '',\n  image_key    TEXT,\n  details_json TEXT NOT NULL DEFAULT '[]',\n  links_json   TEXT NOT NULL DEFAULT '[]',\n  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE TABLE events (\n  id          TEXT PRIMARY KEY,\n  title       TEXT NOT NULL,\n  category    TEXT NOT NULL,\n  starts_at   TEXT NOT NULL,\n  ends_at     TEXT,\n  location    TEXT NOT NULL DEFAULT '',\n  description TEXT NOT NULL DEFAULT '',\n  url         TEXT NOT NULL DEFAULT '',\n  image_url   TEXT NOT NULL DEFAULT '',\n  status      TEXT NOT NULL DEFAULT 'scheduled',\n  source      TEXT NOT NULL DEFAULT 'manual',\n  external_id TEXT UNIQUE,\n  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),\n  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE INDEX idx_events_starts ON events(starts_at)",
      "CREATE INDEX idx_events_category ON events(category, starts_at)",
      "CREATE TABLE posts (\n  id           TEXT PRIMARY KEY,\n  slug         TEXT NOT NULL UNIQUE,\n  title        TEXT NOT NULL,\n  excerpt      TEXT NOT NULL DEFAULT '',\n  body         TEXT NOT NULL DEFAULT '',\n  category     TEXT NOT NULL DEFAULT 'berita',\n  cover_key    TEXT,\n  status       TEXT NOT NULL DEFAULT 'draft',\n  published_at TEXT,\n  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),\n  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE INDEX idx_posts_published ON posts(status, published_at)",
      "CREATE TABLE discography (\n  id           TEXT PRIMARY KEY,\n  slug         TEXT NOT NULL UNIQUE,\n  title        TEXT NOT NULL,\n  type         TEXT NOT NULL,\n  release_date TEXT,\n  description  TEXT NOT NULL DEFAULT '',\n  cover_key    TEXT,\n  video_url    TEXT NOT NULL DEFAULT '',\n  links_json   TEXT NOT NULL DEFAULT '[]',\n  featured     INTEGER NOT NULL DEFAULT 0,\n  sort_order   INTEGER NOT NULL DEFAULT 0,\n  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),\n  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE INDEX idx_discography_type ON discography(type, release_date)",
      "CREATE TABLE activities (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  date        TEXT NOT NULL,\n  type        TEXT NOT NULL,\n  title       TEXT NOT NULL,\n  total       TEXT NOT NULL DEFAULT '',\n  location    TEXT NOT NULL DEFAULT '',\n  notes       TEXT NOT NULL DEFAULT '',\n  link_label  TEXT NOT NULL DEFAULT '',\n  link_url    TEXT NOT NULL DEFAULT '',\n  source_tab  TEXT NOT NULL\n)",
      "CREATE INDEX idx_activities_date ON activities(date)",
      "CREATE INDEX idx_activities_type ON activities(type, date)",
      "CREATE INDEX idx_activities_md ON activities(substr(date, 6, 5))",
      "CREATE TABLE show_recaps (\n  id         INTEGER PRIMARY KEY AUTOINCREMENT,\n  date       TEXT NOT NULL,\n  show       TEXT NOT NULL,\n  show_count INTEGER,\n  total_show INTEGER,\n  unit_songs TEXT NOT NULL DEFAULT '[]',\n  lineup     TEXT NOT NULL DEFAULT ''\n)",
      "CREATE INDEX idx_show_recaps_date ON show_recaps(date)",
      "CREATE INDEX idx_show_recaps_show ON show_recaps(show)",
      "CREATE TABLE sync_runs (\n  id         INTEGER PRIMARY KEY AUTOINCREMENT,\n  kind       TEXT NOT NULL,\n  ok         INTEGER NOT NULL,\n  message    TEXT NOT NULL,\n  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE INDEX idx_sync_runs ON sync_runs(kind, created_at)",
      "CREATE TABLE timeline (\n  id          TEXT PRIMARY KEY,\n  date        TEXT NOT NULL,\n  title       TEXT NOT NULL,\n  description TEXT NOT NULL DEFAULT '',\n  category    TEXT NOT NULL DEFAULT 'pencapaian',\n  link_url    TEXT NOT NULL DEFAULT '',\n  image_key   TEXT,\n  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE INDEX idx_timeline_date ON timeline(date)",
      "CREATE TABLE albums (\n  id          TEXT PRIMARY KEY,\n  slug        TEXT NOT NULL UNIQUE,\n  title       TEXT NOT NULL,\n  description TEXT NOT NULL DEFAULT '',\n  kind        TEXT NOT NULL DEFAULT 'project',\n  date        TEXT,\n  published   INTEGER NOT NULL DEFAULT 1,\n  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE TABLE photos (\n  id         TEXT PRIMARY KEY,\n  album_id   TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,\n  r2_key     TEXT NOT NULL,\n  alt        TEXT NOT NULL DEFAULT '',\n  caption    TEXT NOT NULL DEFAULT '',\n  width      INTEGER,\n  height     INTEGER,\n  sort_order INTEGER NOT NULL DEFAULT 0,\n  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE INDEX idx_photos_album ON photos(album_id, sort_order, created_at)",
      "CREATE TABLE fanwall (\n  id         TEXT PRIMARY KEY,\n  name       TEXT NOT NULL,\n  message    TEXT NOT NULL,\n  theme      TEXT NOT NULL DEFAULT 'lilac',\n  status     TEXT NOT NULL DEFAULT 'pending',\n  pinned     INTEGER NOT NULL DEFAULT 0,\n  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "CREATE INDEX idx_fanwall_status ON fanwall(status, pinned, created_at)",
      "CREATE TABLE communities (\n  id          TEXT PRIMARY KEY,\n  name        TEXT NOT NULL,\n  kind        TEXT NOT NULL DEFAULT 'komunitas',\n  description TEXT NOT NULL DEFAULT '',\n  url         TEXT NOT NULL DEFAULT '',\n  logo_key    TEXT,\n  sort_order  INTEGER NOT NULL DEFAULT 0,\n  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))\n)",
      "INSERT INTO profiles (slug, name, tagline) VALUES ('fritzy', 'Fritzy Rosmerian', 'JKT48 Generasi 12')",
      "INSERT INTO profiles (slug, name) VALUES ('fanbase', 'Fritzy Force')",
      "INSERT INTO profiles (slug, name) VALUES ('esport', 'Fritzy Force Esport')",
      "INSERT INTO communities (id, name, kind, sort_order) VALUES ('one-alliance', 'One Alliance', 'aliansi', 1)",
      "INSERT INTO communities (id, name, kind, sort_order) VALUES ('lovespire', 'Lovespire', 'aliansi', 2)",
      "INSERT INTO settings (key, value) VALUES ('fanwall_moderation', '\"on\"')"
    ]
  }
];
