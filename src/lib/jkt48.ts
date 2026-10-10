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
  if (status === 401) return "API key tidak valid atau belum diisi.";
  if (status === 403) return "API key tidak punya akses ke endpoint ini.";
  if (status === 402) return "Kuota API key sudah habis.";
  if (status === 429) return "Terlalu banyak request ke JKT48Connect, coba lagi nanti.";
  if (status >= 500) return "Server JKT48Connect sedang bermasalah.";
  return `JKT48Connect membalas HTTP ${status}.`;
}

/** Ambil satu halaman jadwal teater. Baris yang formatnya tidak sesuai dilewati, bukan menggagalkan semuanya. */
export async function fetchTheaterPage(
  opts: { apiKey: string; page: number; baseUrl?: string; fetchImpl?: typeof fetch },
): Promise<{ shows: TheaterShow[]; skipped: number }> {
  const url = new URL("/api/v1/theater", opts.baseUrl || DEFAULT_API_BASE);
  url.searchParams.set("page", String(opts.page));
  let res: Response;
  try {
    res = await (opts.fetchImpl ?? fetch)(url.toString(), {
      headers: { "x-api-key": opts.apiKey, accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
  } catch (err) {
    const timeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    throw new Jkt48ApiError(timeout ? "JKT48Connect tidak merespons (timeout)." : "Gagal terhubung ke JKT48Connect.");
  }
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
