import "server-only";
import { first, run } from "./db";
import { sha256Hex } from "./crypto";
import { headers } from "next/headers";

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Bucket di-hash supaya IP/email tidak tersimpan mentah. */
export async function bucketKey(scope: string, ...parts: string[]): Promise<string> {
  return `${scope}:${(await sha256Hex(parts.join("|").toLowerCase())).slice(0, 32)}`;
}

export async function isLimited(bucket: string, max: number, windowMinutes: number): Promise<boolean> {
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const row = await first<{ n: number }>(
    "SELECT COUNT(*) AS n FROM rate_events WHERE bucket = ? AND created_at > ?",
    bucket,
    since,
  );
  return (row?.n ?? 0) >= max;
}

export async function hit(bucket: string): Promise<void> {
  await run("INSERT INTO rate_events (bucket) VALUES (?)", bucket);
  // Bersihkan catatan lama secara oportunistik.
  if (Math.random() < 0.05) {
    await run("DELETE FROM rate_events WHERE created_at < ?", new Date(Date.now() - 86_400_000).toISOString());
  }
}

export async function clearBucket(bucket: string): Promise<void> {
  await run("DELETE FROM rate_events WHERE bucket = ?", bucket);
}
