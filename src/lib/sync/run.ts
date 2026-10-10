import "server-only";
import { JKT48Connect, JKT48Error, type TheaterShow } from "@jkt48connect-id/api";
import { batch, first, run } from "../db";
import { getEnv } from "../cf";
import { combineWib } from "../time";
import {
  DEFAULT_RECAP_TABS,
  isShowRecapTab,
  parseShowRecapTab,
  parseTabConfig,
  parseYearTab,
  type RecapTab,
} from "./recap";

export type SyncResult = { ok: boolean; message: string };

async function logRun(kind: "recap" | "theater", result: SyncResult): Promise<SyncResult> {
  await run("INSERT INTO sync_runs (kind, ok, message) VALUES (?, ?, ?)", kind, result.ok ? 1 : 0, result.message.slice(0, 500));
  return result;
}

/** Ganti seluruh baris satu tab dengan isi CSV terbaru (sheet adalah sumber kebenaran). */
export async function importRecapCsv(tabName: string, csv: string): Promise<number> {
  if (isShowRecapTab(tabName)) {
    const rows = parseShowRecapTab(csv);
    await batch([
      { sql: "DELETE FROM show_recaps" },
      ...rows.map((r) => ({
        sql: "INSERT INTO show_recaps (date, show, show_count, total_show, unit_songs, lineup) VALUES (?, ?, ?, ?, ?, ?)",
        params: [r.date, r.show, r.showCount, r.totalShow, JSON.stringify(r.unitSongs), r.lineup],
      })),
    ]);
    return rows.length;
  }
  const year = Number.parseInt(tabName, 10);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(`Nama tab "${tabName}" harus berupa tahun (mis. 2026) atau "Show Recap".`);
  }
  const rows = parseYearTab(csv, year);
  await batch([
    { sql: "DELETE FROM activities WHERE source_tab = ?", params: [String(year)] },
    ...rows.map((r) => ({
      sql: `INSERT INTO activities (date, type, title, total, location, notes, link_label, link_url, source_tab)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [r.date, r.type, r.title, r.total, r.location, r.notes, r.linkLabel, r.linkUrl, String(year)],
    })),
  ]);
  return rows.length;
}

async function fetchTabCsv(sheetId: string, tab: RecapTab): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&gid=${tab.gid}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000), redirect: "follow" });
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || type.includes("text/html")) {
    throw new Error(
      `Tab "${tab.name}" tidak bisa diunduh (HTTP ${res.status}). Pastikan sheet dibagikan "Siapa saja yang memiliki link".`,
    );
  }
  return res.text();
}

export async function syncRecap(): Promise<SyncResult> {
  try {
    const env = await getEnv();
    const sheetId = env.RECAP_SHEET_ID;
    if (!sheetId) return logRun("recap", { ok: false, message: "RECAP_SHEET_ID belum diset." });
    const setting = await first<{ value: string }>("SELECT value FROM settings WHERE key = 'recap_tabs'");
    const tabs = parseTabConfig(setting ? (JSON.parse(setting.value) as string) : DEFAULT_RECAP_TABS);
    const parts: string[] = [];
    const errors: string[] = [];
    for (const tab of tabs) {
      try {
        const n = await importRecapCsv(tab.name, await fetchTabCsv(sheetId, tab));
        parts.push(`${tab.name}: ${n}`);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : `Tab ${tab.name} gagal.`);
      }
    }
    const ok = errors.length === 0;
    const message = [parts.length ? `Baris diimpor — ${parts.join(", ")}` : "", ...errors].filter(Boolean).join(" · ");
    return logRun("recap", { ok, message: message || "Tidak ada tab yang dikonfigurasi." });
  } catch (err) {
    return logRun("recap", { ok: false, message: err instanceof Error ? err.message : "Sinkronisasi rekap gagal." });
  }
}

function hasFritzy(show: TheaterShow, key: string): boolean {
  const k = key.toLowerCase();
  return (show.lineup ?? []).some(
    (m) => (m.url_key ?? "").toLowerCase().includes(k) || (m.name ?? "").toLowerCase().includes(k),
  );
}

export async function getJkt48Client(): Promise<JKT48Connect | null> {
  const env = await getEnv();
  if (!env.JKT48_API_KEY) return null;
  return new JKT48Connect({ apiKey: env.JKT48_API_KEY, timeoutMs: 12_000, retries: 1, cache: false });
}

export function describeApiError(err: unknown): string {
  if (err instanceof JKT48Error) return `JKT48Connect: ${err.message} (${err.code})`;
  return err instanceof Error ? err.message : "Gagal menghubungi JKT48Connect.";
}

export async function syncTheater(): Promise<SyncResult> {
  try {
    const env = await getEnv();
    const client = await getJkt48Client();
    if (!client) return logRun("theater", { ok: false, message: "JKT48_API_KEY belum diset; sinkronisasi teater dilewati." });
    const key = env.FRITZY_MEMBER_KEY || "fritzy";

    const shows: TheaterShow[] = [];
    for (let page = 1; page <= 3; page++) {
      const list = await client.getTheater({ page });
      if (!Array.isArray(list) || list.length === 0) break;
      shows.push(...list);
    }
    const mine = shows.filter((s) => s.reference_code && hasFritzy(s, key));
    const now = new Date().toISOString();
    const statements = mine
      .map((s) => {
        const starts = combineWib(s.date, s.start_time);
        if (!starts) return null;
        const ends = s.end_time ? combineWib(s.date, s.end_time) : null;
        return {
          sql: `INSERT INTO events (id, title, category, starts_at, ends_at, location, description, image_url, source, external_id, updated_at)
                VALUES (?, ?, 'theater', ?, ?, 'JKT48 Theater', ?, ?, 'jkt48connect', ?, ?)
                ON CONFLICT(external_id) DO UPDATE SET
                  title = excluded.title, starts_at = excluded.starts_at, ends_at = excluded.ends_at,
                  image_url = excluded.image_url, updated_at = excluded.updated_at`,
          params: [
            crypto.randomUUID(),
            s.title || "Pertunjukan Teater",
            starts,
            ends,
            s.short_description ?? "",
            s.banner || s.poster || "",
            `jkt48:${s.reference_code}`,
            now,
          ],
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    await batch(statements);
    return logRun("theater", {
      ok: true,
      message: `${shows.length} show dibaca, ${statements.length} show dengan Fritzy disimpan.`,
    });
  } catch (err) {
    return logRun("theater", { ok: false, message: describeApiError(err) });
  }
}
