// Membangkitkan src/lib/schema.generated.ts dari folder migrations/ agar Worker bisa
// menyiapkan tabel D1 sendiri saat pertama dijalankan (tanpa langkah migrasi manual).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "..", "migrations");
const migrations = readdirSync(dir)
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort()
  .map((name) => {
    const sql = readFileSync(join(dir, name), "utf8")
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      // Komentar di akhir baris (migrasi ini tidak memakai "--" di dalam string literal).
      .map((line) => line.replace(/\s+--.*$/, ""))
      .join("\n");
    const statements = sql
      .split(/;\s*(?:\n|$)/)
      .map((s) => s.trim())
      .filter((s) => s && !/^PRAGMA/i.test(s));
    return { name, statements };
  });

const out = `// FILE INI DIBANGKITKAN OTOMATIS oleh scripts/gen-schema.mjs — jangan diedit manual.\n\nexport const MIGRATIONS: { name: string; statements: string[] }[] = ${JSON.stringify(migrations, null, 2)};\n`;
writeFileSync(join(import.meta.dirname, "..", "src", "lib", "schema.generated.ts"), out);
console.log(`schema.generated.ts: ${migrations.length} migrasi`);
