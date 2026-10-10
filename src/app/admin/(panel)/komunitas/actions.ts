"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { failure, formObject, success, uploadFailure, zodFailure, type ActionState } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { first, newId, run } from "@/lib/db";
import { deleteObject, resolveImageField } from "@/lib/storage";
import { safeUrl } from "@/lib/url";

const schema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(120),
  kind: z.enum(["komunitas", "aliansi"]),
  description: z.string().trim().max(600).default(""),
  url: z.string().trim().max(500).default("").refine((v) => !v || safeUrl(v), "URL tidak valid."),
  sort_order: z.coerce.number().int().min(-999).max(999).catch(0),
});

export async function saveCommunity(id: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const d = parsed.data;
  try {
    const current = id ? await first<{ logo_key: string | null }>("SELECT logo_key FROM communities WHERE id = ?", id) : null;
    const img = await resolveImageField(form, "logo", "komunitas", current?.logo_key ?? null);
    if (id) {
      await run("UPDATE communities SET name=?, kind=?, description=?, url=?, sort_order=?, logo_key=? WHERE id=?", d.name, d.kind, d.description, d.url, d.sort_order, img.key, id);
    } else {
      await run("INSERT INTO communities (id, name, kind, description, url, sort_order, logo_key) VALUES (?,?,?,?,?,?,?)", newId(), d.name, d.kind, d.description, d.url, d.sort_order, img.key);
    }
    await deleteObject(img.obsolete);
  } catch (err) {
    return uploadFailure(err, "logo") ?? failure("Gagal menyimpan.");
  }
  revalidatePath("/tentang");
  revalidatePath("/admin/komunitas");
  return success(id ? "Komunitas diperbarui." : "Komunitas ditambahkan.");
}

export async function deleteCommunity(id: string): Promise<ActionState> {
  await requireAdmin();
  const row = await first<{ logo_key: string | null }>("SELECT logo_key FROM communities WHERE id = ?", id);
  await run("DELETE FROM communities WHERE id = ?", id);
  await deleteObject(row?.logo_key);
  revalidatePath("/tentang");
  revalidatePath("/admin/komunitas");
  return success("Dihapus.");
}
