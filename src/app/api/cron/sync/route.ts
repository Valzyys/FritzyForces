import { getEnv } from "@/lib/cf";
import { safeEqualString } from "@/lib/crypto";
import { syncRecap, syncTheater } from "@/lib/sync/run";

export const dynamic = "force-dynamic";

/**
 * Dipanggil oleh Cron Trigger (worker.ts) memakai token internal sekali pakai,
 * atau dari luar dengan `Authorization: Bearer CRON_SECRET` bila secret itu diset.
 */
export async function POST(request: Request) {
  const env = (await getEnv()) as CloudflareEnv & { INTERNAL_CRON_TOKEN?: string };
  const internal = env.INTERNAL_CRON_TOKEN;
  const internalOk = Boolean(internal) && safeEqualString(request.headers.get("x-internal-cron") ?? "", internal!);
  const secret = env.CRON_SECRET;
  const bearerOk = Boolean(secret) && safeEqualString(request.headers.get("authorization") ?? "", `Bearer ${secret}`);
  if (!internalOk && !bearerOk) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const [theater, recap] = await Promise.all([syncTheater(), syncRecap()]);
  return Response.json({ theater, recap });
}
