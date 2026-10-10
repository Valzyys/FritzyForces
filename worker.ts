// Entry worker kustom: meneruskan request ke OpenNext dan menambahkan handler cron.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- file ini dibuat oleh `opennextjs-cloudflare build`
import { default as handler } from "./.open-next/worker.js";

interface Env {
  CRON_SECRET?: string;
  SITE_URL?: string;
}

const worker = {
  fetch: handler.fetch,
  async scheduled(_event: unknown, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    if (!env.CRON_SECRET) {
      console.warn("[cron] CRON_SECRET belum diset, sinkronisasi dilewati.");
      return;
    }
    const origin = env.SITE_URL ?? "https://fritzyforce.local";
    const request = new Request(`${origin}/api/cron/sync`, {
      method: "POST",
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });
    ctx.waitUntil(
      handler.fetch(request, env, ctx).then(async (res: Response) => {
        console.log("[cron] sync selesai:", res.status, await res.text());
      }),
    );
  },
};

export default worker;
