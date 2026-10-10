import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

export async function getDb(): Promise<D1Database> {
  return (await getEnv()).DB;
}

export async function getBucket(): Promise<R2Bucket> {
  return (await getEnv()).MEDIA;
}
