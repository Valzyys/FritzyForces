import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureSchema } from "./schema";

export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

export async function getDb(): Promise<D1Database> {
  const db = (await getEnv()).DB;
  await ensureSchema(db);
  return db;
}

export async function getBucket(): Promise<R2Bucket> {
  return (await getEnv()).MEDIA;
}
