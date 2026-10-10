import "server-only";
import { cache } from "react";
import { all, first } from "./db";
import { parseJsonArray, type LabelValue, type LinkItem } from "./json";
import { todayWib } from "./time";

// ───────────── Tipe baris ─────────────

export type Profile = {
  slug: string;
  name: string;
  tagline: string;
  jiko: string;
  summary: string;
  body: string;
  image_key: string | null;
  details: LabelValue[];
  links: LinkItem[];
  updated_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  category: string;
  starts_at: string;
  ends_at: string | null;
  location: string;
  description: string;
  url: string;
  image_url: string;
  status: string;
  source: string;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  cover_key: string | null;
  status: string;
  published_at: string | null;
  updated_at: string;
};

export type Disco = {
  id: string;
  slug: string;
  title: string;
  type: string;
  release_date: string | null;
  description: string;
  cover_key: string | null;
  video_url: string;
  links: LinkItem[];
  featured: number;
  sort_order: number;
};

export type Activity = {
  id: number;
  date: string;
  type: string;
  title: string;
  total: string;
  location: string;
  notes: string;
  link_label: string;
  link_url: string;
};

export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  link_url: string;
  image_key: string | null;
};

export type Album = {
  id: string;
  slug: string;
  title: string;
  description: string;
  kind: string;
  date: string | null;
  published: number;
  photo_count: number;
  cover_key: string | null;
};

export type Photo = {
  id: string;
  album_id: string;
  r2_key: string;
  alt: string;
  caption: string;
  width: number | null;
  height: number | null;
  sort_order: number;
};

export type FanMessage = {
  id: string;
  name: string;
  message: string;
  theme: string;
  status: string;
  pinned: number;
  created_at: string;
};

export type Community = {
  id: string;
  name: string;
  kind: string;
  description: string;
  url: string;
  logo_key: string | null;
  sort_order: number;
};

export * from "./constants";
import { PRIVATE_EVENT_CATEGORIES } from "./constants";

// ───────────── Profil ─────────────

type ProfileRow = Omit<Profile, "details" | "links"> & { details_json: string; links_json: string };

export async function getProfile(slug: string): Promise<Profile | null> {
  const row = await first<ProfileRow>("SELECT * FROM profiles WHERE slug = ?", slug);
  if (!row) return null;
  const { details_json, links_json, ...rest } = row;
  return { ...rest, details: parseJsonArray(details_json), links: parseJsonArray(links_json) };
}

// ───────────── Jadwal ─────────────

const publicCategoryFilter = `category NOT IN (${PRIVATE_EVENT_CATEGORIES.map(() => "?").join(",")})`;

export async function getNextTheaterShow(): Promise<EventRow | null> {
  return first<EventRow>(
    `SELECT * FROM events WHERE category = 'theater' AND status != 'cancelled' AND starts_at > ?
     ORDER BY starts_at ASC LIMIT 1`,
    new Date().toISOString(),
  );
}

export async function getUpcomingEvents(limit: number): Promise<EventRow[]> {
  return all<EventRow>(
    `SELECT * FROM events WHERE ${publicCategoryFilter} AND COALESCE(ends_at, starts_at) >= ?
     ORDER BY starts_at ASC LIMIT ?`,
    ...PRIVATE_EVENT_CATEGORIES,
    new Date(Date.now() - 3 * 3600_000).toISOString(),
    limit,
  );
}

export async function listPublicEvents(opts: {
  when: "upcoming" | "past";
  category?: string;
  page: number;
  perPage: number;
}): Promise<{ items: EventRow[]; total: number }> {
  const cutoff = new Date(Date.now() - 3 * 3600_000).toISOString();
  const where = [publicCategoryFilter, opts.when === "upcoming" ? "COALESCE(ends_at, starts_at) >= ?" : "COALESCE(ends_at, starts_at) < ?"];
  const params: (string | number)[] = [...PRIVATE_EVENT_CATEGORIES, cutoff];
  if (opts.category && !PRIVATE_EVENT_CATEGORIES.includes(opts.category)) {
    where.push("category = ?");
    params.push(opts.category);
  }
  const order = opts.when === "upcoming" ? "ASC" : "DESC";
  const [items, count] = await Promise.all([
    all<EventRow>(
      `SELECT * FROM events WHERE ${where.join(" AND ")} ORDER BY starts_at ${order} LIMIT ? OFFSET ?`,
      ...params,
      opts.perPage,
      (opts.page - 1) * opts.perPage,
    ),
    first<{ n: number }>(`SELECT COUNT(*) AS n FROM events WHERE ${where.join(" AND ")}`, ...params),
  ]);
  return { items, total: count?.n ?? 0 };
}

// ───────────── Berita ─────────────

export async function listPublishedPosts(opts: { page: number; perPage: number; category?: string }) {
  const where = ["status = 'published'", "published_at <= ?"];
  const params: (string | number)[] = [new Date().toISOString()];
  if (opts.category) {
    where.push("category = ?");
    params.push(opts.category);
  }
  const [items, count] = await Promise.all([
    all<Post>(
      `SELECT id, slug, title, excerpt, '' AS body, category, cover_key, status, published_at, updated_at
       FROM posts WHERE ${where.join(" AND ")} ORDER BY published_at DESC LIMIT ? OFFSET ?`,
      ...params,
      opts.perPage,
      (opts.page - 1) * opts.perPage,
    ),
    first<{ n: number }>(`SELECT COUNT(*) AS n FROM posts WHERE ${where.join(" AND ")}`, ...params),
  ]);
  return { items, total: count?.n ?? 0 };
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  return first<Post>(
    "SELECT * FROM posts WHERE slug = ? AND status = 'published' AND published_at <= ?",
    slug,
    new Date().toISOString(),
  );
}

// ───────────── Diskografi ─────────────

type DiscoRow = Omit<Disco, "links"> & { links_json: string };
const toDisco = ({ links_json, ...rest }: DiscoRow): Disco => ({ ...rest, links: parseJsonArray(links_json) });

export async function listDiscography(type?: string): Promise<Disco[]> {
  const rows = type
    ? await all<DiscoRow>(
        "SELECT * FROM discography WHERE type = ? ORDER BY featured DESC, sort_order ASC, release_date DESC",
        type,
      )
    : await all<DiscoRow>("SELECT * FROM discography ORDER BY featured DESC, sort_order ASC, release_date DESC");
  return rows.map(toDisco);
}

export async function getDisco(slug: string): Promise<Disco | null> {
  const row = await first<DiscoRow>("SELECT * FROM discography WHERE slug = ?", slug);
  return row ? toDisco(row) : null;
}

/** Setlist yang pernah dibawakan Fritzy, diturunkan otomatis dari tab "Show Recap". */
export type SetlistStat = { show: string; count: number; first_date: string; last_date: string };

export async function listSetlistStats(): Promise<SetlistStat[]> {
  return all<SetlistStat>(
    `SELECT show, COUNT(*) AS count, MIN(date) AS first_date, MAX(date) AS last_date
     FROM show_recaps GROUP BY show ORDER BY first_date ASC`,
  );
}

export async function getShowsForSetlist(show: string): Promise<
  { date: string; show_count: number | null; total_show: number | null; unit_songs: string; lineup: string }[]
> {
  return all(
    "SELECT date, show_count, total_show, unit_songs, lineup FROM show_recaps WHERE show = ? ORDER BY date DESC",
    show,
  );
}

export async function getShowTotals(): Promise<{ shows: number; setlists: number; first: string | null; last: string | null }> {
  const row = await first<{ shows: number; setlists: number; first: string | null; last: string | null }>(
    "SELECT COUNT(*) AS shows, COUNT(DISTINCT show) AS setlists, MIN(date) AS first, MAX(date) AS last FROM show_recaps",
  );
  return row ?? { shows: 0, setlists: 0, first: null, last: null };
}

// ───────────── Rekap kegiatan & timeline ─────────────

/** Kegiatan yang tidak ditonjolkan di halaman publik (live harian dianggap kurang informatif). */
const QUIET_ACTIVITY_TYPES = ["IDN Live", "Showroom Live", "Live"];
const quietFilter = `type NOT IN (${QUIET_ACTIVITY_TYPES.map(() => "?").join(",")})`;

export async function listActivities(opts: { year?: string; type?: string; page: number; perPage: number; includeLive?: boolean }) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (!opts.includeLive) {
    where.push(quietFilter);
    params.push(...QUIET_ACTIVITY_TYPES);
  }
  if (opts.year) {
    where.push("substr(date, 1, 4) = ?");
    params.push(opts.year);
  }
  if (opts.type) {
    where.push("type = ?");
    params.push(opts.type);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [items, count] = await Promise.all([
    all<Activity>(
      `SELECT * FROM activities ${clause} ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`,
      ...params,
      opts.perPage,
      (opts.page - 1) * opts.perPage,
    ),
    first<{ n: number }>(`SELECT COUNT(*) AS n FROM activities ${clause}`, ...params),
  ]);
  return { items, total: count?.n ?? 0 };
}

export async function activityFacets(): Promise<{ years: string[]; types: string[] }> {
  const [years, types] = await Promise.all([
    all<{ y: string }>("SELECT DISTINCT substr(date, 1, 4) AS y FROM activities ORDER BY y DESC"),
    all<{ type: string }>(
      `SELECT type FROM activities WHERE ${quietFilter} GROUP BY type ORDER BY COUNT(*) DESC`,
      ...QUIET_ACTIVITY_TYPES,
    ),
  ]);
  return { years: years.map((r) => r.y), types: types.map((r) => r.type) };
}

/** "Zy This Date": kegiatan pada tanggal & bulan yang sama di tahun-tahun sebelumnya. */
export async function onThisDate(today = todayWib()): Promise<Activity[]> {
  return all<Activity>(
    `SELECT * FROM activities WHERE substr(date, 6, 5) = ? AND date < ? AND ${quietFilter}
     ORDER BY date DESC LIMIT 6`,
    today.slice(5),
    today,
    ...QUIET_ACTIVITY_TYPES,
  );
}

export async function recentActivities(limit: number): Promise<Activity[]> {
  return all<Activity>(
    `SELECT * FROM activities WHERE ${quietFilter} AND date <= ? ORDER BY date DESC, id DESC LIMIT ?`,
    ...QUIET_ACTIVITY_TYPES,
    todayWib(),
    limit,
  );
}

export async function listTimeline(): Promise<TimelineItem[]> {
  return all<TimelineItem>("SELECT * FROM timeline ORDER BY date ASC, created_at ASC");
}

// ───────────── Galeri ─────────────

const ALBUM_SELECT = `SELECT a.*, COUNT(p.id) AS photo_count,
  (SELECT r2_key FROM photos WHERE album_id = a.id ORDER BY sort_order ASC, created_at ASC LIMIT 1) AS cover_key
  FROM albums a LEFT JOIN photos p ON p.album_id = a.id`;

export async function listAlbums(opts: { publishedOnly: boolean }): Promise<Album[]> {
  return all<Album>(
    `${ALBUM_SELECT} ${opts.publishedOnly ? "WHERE a.published = 1" : ""}
     GROUP BY a.id ORDER BY COALESCE(a.date, a.created_at) DESC`,
  );
}

export async function getAlbum(slug: string, publishedOnly: boolean): Promise<Album | null> {
  return first<Album>(
    `${ALBUM_SELECT} WHERE a.slug = ? ${publishedOnly ? "AND a.published = 1" : ""} GROUP BY a.id`,
    slug,
  );
}

export async function listPhotos(albumId: string): Promise<Photo[]> {
  return all<Photo>("SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order ASC, created_at ASC", albumId);
}

export async function latestPhotos(limit: number): Promise<(Photo & { album_slug: string; album_title: string })[]> {
  return all(
    `SELECT p.*, a.slug AS album_slug, a.title AS album_title FROM photos p
     JOIN albums a ON a.id = p.album_id WHERE a.published = 1
     ORDER BY p.created_at DESC LIMIT ?`,
    limit,
  );
}

// ───────────── Fanwall ─────────────

export async function listApprovedMessages(page: number, perPage: number) {
  const [items, count] = await Promise.all([
    all<FanMessage>(
      `SELECT * FROM fanwall WHERE status = 'approved' ORDER BY pinned DESC, created_at DESC LIMIT ? OFFSET ?`,
      perPage,
      (page - 1) * perPage,
    ),
    first<{ n: number }>("SELECT COUNT(*) AS n FROM fanwall WHERE status = 'approved'"),
  ]);
  return { items, total: count?.n ?? 0 };
}

// ───────────── Komunitas ─────────────

export async function listCommunities(): Promise<Community[]> {
  return all<Community>("SELECT * FROM communities ORDER BY kind ASC, sort_order ASC, name ASC");
}

// ───────────── Data bersama untuk header/footer & beranda ─────────────

export type SiteChrome = {
  nextShow: EventRow | null;
  setlists: string[];
  tickerItems: { label: string; meta: string }[];
  counts: { activities: number; timeline: number; discography: number; photos: number; messages: number; posts: number };
};

export const getSiteChrome = cache(async (): Promise<SiteChrome> => {
  const [nextShow, setlists, recent, counts] = await Promise.all([
    getNextTheaterShow(),
    all<{ show: string }>("SELECT show FROM show_recaps GROUP BY show ORDER BY MIN(date) ASC"),
    recentActivities(8),
    first<SiteChrome["counts"]>(
      `SELECT
        (SELECT COUNT(*) FROM activities) AS activities,
        (SELECT COUNT(*) FROM timeline) AS timeline,
        (SELECT COUNT(*) FROM discography) AS discography,
        (SELECT COUNT(*) FROM photos p JOIN albums a ON a.id = p.album_id WHERE a.published = 1) AS photos,
        (SELECT COUNT(*) FROM fanwall WHERE status = 'approved') AS messages,
        (SELECT COUNT(*) FROM posts WHERE status = 'published' AND published_at <= ?) AS posts`,
      new Date().toISOString(),
    ),
  ]);
  return {
    nextShow,
    setlists: setlists.map((s) => s.show),
    tickerItems: recent.map((a) => ({ label: a.title, meta: a.type })),
    counts: counts ?? { activities: 0, timeline: 0, discography: 0, photos: 0, messages: 0, posts: 0 },
  };
});

export const EMPTY_CHROME: SiteChrome = {
  nextShow: null,
  setlists: [],
  tickerItems: [],
  counts: { activities: 0, timeline: 0, discography: 0, photos: 0, messages: 0, posts: 0 },
};

/** Jumlah kegiatan per tahun & jenis, untuk grafik ringkas di halaman Kegiatan. */
export async function activityBreakdown(): Promise<{ year: string; type: string; n: number }[]> {
  return all(
    `SELECT substr(date,1,4) AS year, type, COUNT(*) AS n FROM activities
     WHERE ${quietFilter} GROUP BY year, type ORDER BY year ASC`,
    ...QUIET_ACTIVITY_TYPES,
  );
}

/** Tanggal (YYYY-MM-DD, WIB) yang memiliki jadwal publik dalam satu bulan. */
export async function eventDaysInMonth(year: number, month: number): Promise<{ day: string; categories: string }[]> {
  const start = new Date(Date.UTC(year, month - 1, 1, -7)).toISOString();
  const end = new Date(Date.UTC(year, month, 1, -7)).toISOString();
  return all(
    `SELECT substr(datetime(starts_at, '+7 hours'), 1, 10) AS day, GROUP_CONCAT(DISTINCT category) AS categories
     FROM events WHERE ${publicCategoryFilter} AND starts_at >= ? AND starts_at < ? AND status != 'cancelled'
     GROUP BY day`,
    ...PRIVATE_EVENT_CATEGORIES,
    start,
    end,
  );
}
