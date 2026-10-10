import { MIGRATIONS } from "./schema.generated";

/**
 * Menerapkan migrasi D1 yang belum tercatat. Memakai tabel `d1_migrations` dengan format
 * yang sama seperti `wrangler d1 migrations`, sehingga keduanya bisa dipakai bergantian.
 * Dijalankan sekali per isolate Worker; setelah itu hanya satu query ringan.
 */
let ready: Promise<void> | null = null;

export function ensureSchema(db: D1Database): Promise<void> {
  ready ??= apply(db).catch((err) => {
    ready = null; // coba lagi di request berikutnya
    throw err;
  });
  return ready;
}

async function apply(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS d1_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,
    )
    .run();
  const done = await db.prepare("SELECT name FROM d1_migrations").all<{ name: string }>();
  const applied = new Set((done.results ?? []).map((r) => r.name));
  for (const m of MIGRATIONS) {
    if (applied.has(m.name)) continue;
    await db.batch([
      ...m.statements.map((s) => db.prepare(s)),
      db.prepare("INSERT INTO d1_migrations (name) VALUES (?)").bind(m.name),
    ]);
    console.log(`[schema] migrasi ${m.name} diterapkan`);
  }
}
