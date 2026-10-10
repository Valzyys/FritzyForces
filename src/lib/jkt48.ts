import { z } from "zod";

/**
 * Klien minimal JKT48Connect — hanya endpoint `GET /api/v1/theater` (tier Free).
 * Respons: { ok, data: TheaterShow[], cached_at, cache_ttl, stale, tier }. Paginasi via `?page=`.
 */

export const DEFAULT_API_BASE = "https://jkt48connect.com";

const lineupSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().default(""),
  url_key: z.string().default(""),
});

export const theaterShowSchema = z.object({
  reference_code: z.string().min(1),
  title: z.string().default(""),
  date: z.string(),
  start_time: z.string().nullish(),
  end_time: z.string().nullish(),
  type: z.string().nullish(),
  banner: z.string().nullish(),
  poster: z.string().nullish(),
  short_description: z.string().nullish(),
  lineup: z.array(lineupSchema).nullish().transform((v) => v ?? []),
});

export type TheaterShow = z.infer<typeof theaterShowSchema>;

const pageSchema = z.object({
  ok: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  data: z.array(z.unknown()).nullish(),
});

export class Jkt48ApiError extends Error {
  name = "Jkt48ApiError";
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

function describeStatus(status: number): string {
  if (status === 401) return "API key tidak valid atau belum diisi (HTTP 401).";
  if (status === 403) return "Akses ditolak JKT48Connect (HTTP 403).";
  if (status === 402) return "Kuota API key sudah habis (HTTP 402).";
  if (status === 429) return "Terlalu banyak request ke JKT48Connect, coba lagi nanti (HTTP 429).";
  if (status >= 500) return `Server JKT48Connect membalas error (HTTP ${status}).`;
  return `JKT48Connect membalas HTTP ${status}.`;
}

const USER_AGENT = "FritzyForce/1.0 (+https://fritzyforce.my.id)";

async function requestOnce(url: string, apiKey: string, fetchImpl: typeof fetch, timeoutMs: number): Promise<Response> {
  const started = Date.now();
  try {
    return await fetchImpl(url, {
      headers: { "x-api-key": apiKey, accept: "application/json", "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (err) {
    const ms = Date.now() - started;
    const name = err instanceof Error ? err.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      throw new Jkt48ApiError(`JKT48Connect tidak merespons dalam ${Math.round(ms / 1000)} detik (timeout).`);
    }
    const detail = err instanceof Error ? `${err.name}: ${err.message}`.slice(0, 160) : "";
    throw new Jkt48ApiError(`Gagal terhubung ke JKT48Connect setelah ${ms} ms${detail ? ` — ${detail}` : ""}.`);
  }
}

/**
 * Ambil satu halaman jadwal teater. Satu kali percobaan ulang untuk timeout/5xx.
 * Baris yang formatnya tidak sesuai dilewati, bukan menggagalkan semuanya.
 */
export async function fetchTheaterPage(
  opts: { apiKey: string; page: number; baseUrl?: string; fetchImpl?: typeof fetch; timeoutMs?: number; attempts?: number },
): Promise<{ shows: TheaterShow[]; skipped: number }> {
  const url = new URL("/api/v1/theater", opts.baseUrl || DEFAULT_API_BASE);
  // Halaman 1 dipanggil tanpa ?page agar identik dengan contoh dokumentasi.
  if (opts.page > 1) url.searchParams.set("page", String(opts.page));
  const fetchImpl = opts.fetchImpl ?? fetch;
  const attempts = opts.attempts ?? 2;

  let res: Response | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      res = await requestOnce(url.toString(), opts.apiKey, fetchImpl, opts.timeoutMs ?? 25_000);
      if (res.status >= 500 && attempt < attempts - 1) continue;
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (!res) throw lastError instanceof Error ? lastError : new Jkt48ApiError("Gagal terhubung ke JKT48Connect.");
  if (!res.ok) throw new Jkt48ApiError(describeStatus(res.status), res.status);

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Jkt48ApiError("Balasan JKT48Connect bukan JSON yang valid.");
  }
  const parsed = pageSchema.safeParse(body);
  if (!parsed.success) throw new Jkt48ApiError("Format balasan JKT48Connect tidak dikenali.");
  if (parsed.data.ok === false) throw new Jkt48ApiError(parsed.data.message || parsed.data.error || "JKT48Connect melaporkan kesalahan.");

  const shows: TheaterShow[] = [];
  let skipped = 0;
  for (const item of parsed.data.data ?? []) {
    const s = theaterShowSchema.safeParse(item);
    if (s.success) shows.push(s.data);
    else skipped++;
  }
  return { shows, skipped };
}

/** Apakah lineup show memuat member dengan kata kunci (url_key/nama) tertentu. */
export function lineupHas(show: TheaterShow, key: string): boolean {
  const k = key.trim().toLowerCase();
  if (!k) return false;
  return show.lineup.some((m) => m.url_key.toLowerCase() === k || m.name.toLowerCase() === k || m.url_key.toLowerCase().includes(k));
}
