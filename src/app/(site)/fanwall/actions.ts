"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { failure, formObject, success, zodFailure, type ActionState } from "@/lib/action";
import { FANWALL_THEMES } from "@/lib/data";
import { newId, run } from "@/lib/db";
import { bucketKey, clientIp, hit, isLimited } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";

const schema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(40, "Nama maksimal 40 karakter."),
  message: z.string().trim().min(3, "Pesan terlalu pendek.").max(500, "Pesan maksimal 500 karakter."),
  theme: z.enum(FANWALL_THEMES).catch("lilac"),
  website: z.string().max(0).optional(), // honeypot: harus kosong
});

export async function submitFanMessage(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = schema.safeParse(formObject(form));
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return success("Terima kasih!");
    return zodFailure(parsed.error);
  }
  try {
    const bucket = await bucketKey("fanwall", await clientIp());
    if (await isLimited(bucket, 3, 10)) {
      return failure("Kamu sudah mengirim beberapa pesan. Coba lagi dalam beberapa menit, ya.");
    }
    const settings = await getSettings();
    const status = settings.fanwallModeration ? "pending" : "approved";
    await run(
      "INSERT INTO fanwall (id, name, message, theme, status) VALUES (?, ?, ?, ?, ?)",
      newId(),
      parsed.data.name,
      parsed.data.message,
      parsed.data.theme,
      status,
    );
    await hit(bucket);
    revalidatePath("/fanwall");
    return success(
      status === "pending"
        ? "Pesanmu terkirim dan akan tampil setelah ditinjau admin."
        : "Pesanmu sudah tampil di fanwall. Terima kasih!",
    );
  } catch (err) {
    console.error("[fanwall] gagal menyimpan:", err instanceof Error ? err.message : err);
    return failure("Pesan belum bisa dikirim. Coba lagi sebentar lagi.");
  }
}
