import { getEnv } from "@/lib/cf";
import { safeEqualString } from "@/lib/crypto";
import { syncRecap, syncTheater } from "@/lib/sync/run";

export const dynamic = "force-dynamic";

/** Dipanggil oleh Cron Trigger (lihat worker.ts) dengan header Authorization: Bearer CRON_SECRET. */
export async function POST(request: Request) {
  const env = await getEnv();
  const secret = env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || !safeEqualString(auth, `Bearer ${secret}`)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const [theater, recap] = await Promise.all([syncTheater(), syncRecap()]);
  return Response.json({ theater, recap });
}
