"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { failure, formObject, success, uploadFailure, zodFailure, type ActionState } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { DISCO_TYPES } from "@/lib/data";
import { first, newId, nowIso, run, uniqueSlug } from "@/lib/db";
import { parsePairs } from "@/lib/json";
import { slugify } from "@/lib/slug";
import { deleteObject, resolveImageField } from "@/lib/storage";
import { safeUrl } from "@/lib/url";

const schema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(160),
  slug: z.string().trim().max(80).default(""),
  type: z.enum(Object.keys(DISCO_TYPES) as [string, ...string[]]),
  release_date: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Tanggal tidak valid.").default(""),
  description: z.string().trim().max(10000).default(""),
  video_url: z.string().trim().max(500).default("").refine((v) => !v || safeUrl(v), "URL video tidak valid."),
  links: z.string().max(4000).default(""),
  sort_order: z.coerce.number().int().min(-9999).max(9999).catch(0),
});

export async function saveDisco(id: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const d = parsed.data;
  const links = parsePairs(d.links).map((p) => ({ label: p.label, url: safeUrl(p.value) })).filter((l) => l.url);
  const featured = form.get("featured") === "on" ? 1 : 0;
  try {
    const slug = await uniqueSlug("discography", slugify(d.slug || d.title), id);
    const current = id ? await first<{ cover_key: string | null }>("SELECT cover_key FROM discography WHERE id = ?", id) : null;
    const img = await resolveImageField(form, "cover", "diskografi", current?.cover_key ?? null);
    if (id) {
      await run(
        `UPDATE discography SET title=?, slug=?, type=?, release_date=?, description=?, cover_key=?, video_url=?, links_json=?, featured=?, sort_order=?, updated_at=? WHERE id=?`,
        d.title, slug, d.type, d.release_date || null, d.description, img.key, d.video_url, JSON.stringify(links), featured, d.sort_order, nowIso(), id,
      );
    } else {
      await run(
        `INSERT INTO discography (id, title, slug, type, release_date, description, cover_key, video_url, links_json, featured, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        newId(), d.title, slug, d.type, d.release_date || null, d.description, img.key, d.video_url, JSON.stringify(links), featured, d.sort_order,
      );
    }
    await deleteObject(img.obsolete);
  } catch (err) {
    return uploadFailure(err, "cover") ?? failure("Gagal menyimpan entri diskografi.");
  }
  revalidatePath("/diskografi", "layout");
  if (!id) redirect("/admin/diskografi?saved=1");
  return success("Diskografi diperbarui.");
}

export async function deleteDisco(id: string): Promise<ActionState> {
  await requireAdmin();
  const row = await first<{ cover_key: string | null }>("SELECT cover_key FROM discography WHERE id = ?", id);
  await run("DELETE FROM discography WHERE id = ?", id);
  await deleteObject(row?.cover_key);
  revalidatePath("/diskografi", "layout");
  return success("Entri dihapus.");
}
