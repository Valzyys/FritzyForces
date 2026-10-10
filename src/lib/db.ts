import "server-only";
import { getDb } from "./cf";

type Bindable = string | number | null;

export async function all<T>(sql: string, ...params: Bindable[]): Promise<T[]> {
  const db = await getDb();
  const res = await db.prepare(sql).bind(...params).all<T>();
  return res.results ?? [];
}

export async function first<T>(sql: string, ...params: Bindable[]): Promise<T | null> {
  const db = await getDb();
  return (await db.prepare(sql).bind(...params).first<T>()) ?? null;
}

export async function run(sql: string, ...params: Bindable[]): Promise<D1Result> {
  const db = await getDb();
  return db.prepare(sql).bind(...params).run();
}

export async function batch(statements: { sql: string; params?: Bindable[] }[]): Promise<void> {
  if (statements.length === 0) return;
  const db = await getDb();
  await db.batch(statements.map((s) => db.prepare(s.sql).bind(...(s.params ?? []))));
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Menjalankan query baca untuk halaman publik. Kalau database belum siap atau error,
 * halaman tetap tampil dengan state kosong/eror alih-alih crash.
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<{ data: T; failed: boolean }> {
  try {
    return { data: await fn(), failed: false };
  } catch (err) {
    console.error("[db] query gagal:", err instanceof Error ? err.message : err);
    return { data: fallback, failed: true };
  }
}

/** Slug unik untuk tabel (posts/discography/albums); tambahkan akhiran -2, -3, … bila bentrok. */
export async function uniqueSlug(table: "posts" | "discography" | "albums", base: string, excludeId: string | null): Promise<string> {
  const root = base || "item";
  for (let i = 1; i < 50; i++) {
    const candidate = i === 1 ? root : `${root}-${i}`;
    const hit = await first<{ id: string }>(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`, candidate, excludeId ?? "");
    if (!hit) return candidate;
  }
  return `${root}-${crypto.randomUUID().slice(0, 6)}`;
}
