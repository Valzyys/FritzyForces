"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { failure, formObject, success, zodFailure, type ActionState } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { EVENT_CATEGORIES, EVENT_STATUS } from "@/lib/data";
import { newId, nowIso, run } from "@/lib/db";
import { wibLocalToIso } from "@/lib/time";
import { safeUrl } from "@/lib/url";

const schema = z
  .object({
    title: z.string().trim().min(1, "Judul wajib diisi.").max(160),
    category: z.enum(Object.keys(EVENT_CATEGORIES) as [string, ...string[]], { message: "Pilih kategori." }),
    status: z.enum(Object.keys(EVENT_STATUS) as [string, ...string[]]),
    starts_at: z.string().transform((v, ctx) => {
      const iso = wibLocalToIso(v);
      if (!iso) ctx.addIssue({ code: "custom", message: "Tanggal & jam mulai wajib diisi." });
      return iso ?? "";
    }),
    ends_at: z.string().optional().transform((v, ctx) => {
      if (!v) return null;
      const iso = wibLocalToIso(v);
      if (!iso) ctx.addIssue({ code: "custom", message: "Format waktu selesai tidak valid." });
      return iso;
    }),
    location: z.string().trim().max(120).default(""),
    description: z.string().trim().max(2000).default(""),
    url: z.string().trim().max(500).default("").refine((v) => !v || safeUrl(v), "URL harus diawali http:// atau https://"),
  })
  .refine((v) => !v.ends_at || v.ends_at > v.starts_at, { path: ["ends_at"], message: "Waktu selesai harus setelah waktu mulai." });

export async function saveEvent(id: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const d = parsed.data;
  try {
    if (id) {
      await run(
        `UPDATE events SET title=?, category=?, status=?, starts_at=?, ends_at=?, location=?, description=?, url=?, updated_at=? WHERE id=?`,
        d.title, d.category, d.status, d.starts_at, d.ends_at, d.location, d.description, d.url, nowIso(), id,
      );
    } else {
      await run(
        `INSERT INTO events (id, title, category, status, starts_at, ends_at, location, description, url) VALUES (?,?,?,?,?,?,?,?,?)`,
        newId(), d.title, d.category, d.status, d.starts_at, d.ends_at, d.location, d.description, d.url,
      );
    }
  } catch (err) {
    console.error("[admin/jadwal]", err);
    return failure("Gagal menyimpan jadwal.");
  }
  revalidatePath("/", "layout");
  if (!id) redirect("/admin/jadwal?saved=1");
  return success("Jadwal diperbarui.");
}

export async function deleteEvent(id: string): Promise<ActionState> {
  await requireAdmin();
  await run("DELETE FROM events WHERE id = ?", id);
  revalidatePath("/", "layout");
  return success("Jadwal dihapus.");
}
