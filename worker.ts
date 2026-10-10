// Entry worker kustom: meneruskan request ke OpenNext dan menambahkan handler cron.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- file ini dibuat oleh `opennextjs-cloudflare build`
import { default as handler } from "./.open-next/worker.js";

interface Env {
  SITE_URL?: string;
  [key: string]: unknown;
}

type Ctx = { waitUntil(p: Promise<unknown>): void };

const worker = {
  fetch: handler.fetch,
  async scheduled(_event: unknown, env: Env, ctx: Ctx) {
    // Token acak sekali pakai yang hanya ada di env request internal ini —
    // request dari internet tidak pernah membawa INTERNAL_CRON_TOKEN di env-nya.
    const token = crypto.randomUUID() + crypto.randomUUID();
    const origin = env.SITE_URL ?? "https://fritzyforce.local";
    const request = new Request(`${origin}/api/cron/sync`, {
      method: "POST",
      headers: { "x-internal-cron": token },
    });
    ctx.waitUntil(
      handler.fetch(request, { ...env, INTERNAL_CRON_TOKEN: token }, ctx).then(async (res: Response) => {
        console.log("[cron] sync selesai:", res.status, await res.text());
      }),
    );
  },
};

export default worker;
