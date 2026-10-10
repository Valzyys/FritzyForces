"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { failure, formObject, success, uploadFailure, zodFailure, type ActionState } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { first, newId, run } from "@/lib/db";
import { deleteObject, resolveImageField } from "@/lib/storage";
import { safeUrl } from "@/lib/url";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal wajib diisi."),
  title: z.string().trim().min(1, "Judul wajib diisi.").max(160),
  description: z.string().trim().max(3000).default(""),
  category: z.string().trim().max(40).default("pencapaian"),
  link_url: z.string().trim().max(500).default("").refine((v) => !v || safeUrl(v), "URL tidak valid."),
});

export async function saveTimeline(id: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const d = parsed.data;
  try {
    const current = id ? await first<{ image_key: string | null }>("SELECT image_key FROM timeline WHERE id = ?", id) : null;
    const img = await resolveImageField(form, "image", "timeline", current?.image_key ?? null);
    if (id) {
      await run("UPDATE timeline SET date=?, title=?, description=?, category=?, link_url=?, image_key=? WHERE id=?", d.date, d.title, d.description, d.category || "pencapaian", d.link_url, img.key, id);
    } else {
      await run("INSERT INTO timeline (id, date, title, description, category, link_url, image_key) VALUES (?,?,?,?,?,?,?)", newId(), d.date, d.title, d.description, d.category || "pencapaian", d.link_url, img.key);
    }
    await deleteObject(img.obsolete);
  } catch (err) {
    return uploadFailure(err, "image") ?? failure("Gagal menyimpan timeline.");
  }
  revalidatePath("/timeline");
  if (!id) redirect("/admin/timeline?saved=1");
  return success("Timeline diperbarui.");
}

export async function deleteTimeline(id: string): Promise<ActionState> {
  await requireAdmin();
  const row = await first<{ image_key: string | null }>("SELECT image_key FROM timeline WHERE id = ?", id);
  await run("DELETE FROM timeline WHERE id = ?", id);
  await deleteObject(row?.image_key);
  revalidatePath("/timeline");
  return success("Entri timeline dihapus.");
}

/** Jadikan satu baris rekap kegiatan sebagai entri timeline (kurasi pencapaian). */
export async function promoteActivity(activityId: number): Promise<ActionState> {
  await requireAdmin();
  const a = await first<{ date: string; title: string; notes: string; link_url: string; type: string }>(
    "SELECT date, title, notes, link_url, type FROM activities WHERE id = ?",
    activityId,
  );
  if (!a) return failure("Kegiatan tidak ditemukan.");
  const dup = await first<{ id: string }>("SELECT id FROM timeline WHERE date = ? AND title = ?", a.date, a.title);
  if (dup) return failure("Kegiatan ini sudah ada di timeline.");
  await run(
    "INSERT INTO timeline (id, date, title, description, category, link_url) VALUES (?,?,?,?,?,?)",
    newId(), a.date, a.title, a.notes, a.type.toLowerCase(), safeUrl(a.link_url) ?? "",
  );
  revalidatePath("/timeline");
  return success("Ditambahkan ke timeline. Rapikan teksnya di menu Timeline.");
}
