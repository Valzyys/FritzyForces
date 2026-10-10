"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { failure, formObject, success, uploadFailure, zodFailure, type ActionState } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { all, first, newId, run, uniqueSlug } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { deleteObject, storeImage } from "@/lib/storage";

const albumSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(160),
  slug: z.string().trim().max(80).default(""),
  description: z.string().trim().max(2000).default(""),
  kind: z.enum(["project", "kegiatan"]),
  date: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Tanggal tidak valid.").default(""),
});

export async function saveAlbum(id: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = albumSchema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const d = parsed.data;
  const published = form.get("published") === "on" ? 1 : 0;
  const slug = await uniqueSlug("albums", slugify(d.slug || d.title), id);
  let newAlbumId = id;
  if (id) {
    await run("UPDATE albums SET title=?, slug=?, description=?, kind=?, date=?, published=? WHERE id=?", d.title, slug, d.description, d.kind, d.date || null, published, id);
  } else {
    newAlbumId = newId();
    await run("INSERT INTO albums (id, title, slug, description, kind, date, published) VALUES (?,?,?,?,?,?,?)", newAlbumId, d.title, slug, d.description, d.kind, d.date || null, published);
  }
  revalidatePath("/galeri", "layout");
  if (!id) redirect(`/admin/galeri/${newAlbumId}?baru=1`);
  return success("Album diperbarui.");
}

export async function deleteAlbum(id: string): Promise<ActionState> {
  await requireAdmin();
  const photos = await all<{ r2_key: string }>("SELECT r2_key FROM photos WHERE album_id = ?", id);
  await run("DELETE FROM albums WHERE id = ?", id);
  await Promise.all(photos.map((p) => deleteObject(p.r2_key)));
  revalidatePath("/galeri", "layout");
  redirect("/admin/galeri");
}

/** Satu foto per panggilan, agar klien bisa menampilkan progres dan batas body tetap kecil. */
export async function uploadPhoto(albumId: string, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const album = await first<{ id: string }>("SELECT id FROM albums WHERE id = ?", albumId);
  if (!album) return failure("Album tidak ditemukan.");
  try {
    const img = await storeImage(form.get("file"), "galeri");
    if (!img) return failure("File kosong.");
    const next = await first<{ n: number }>("SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM photos WHERE album_id = ?", albumId);
    await run(
      "INSERT INTO photos (id, album_id, r2_key, width, height, sort_order) VALUES (?,?,?,?,?,?)",
      newId(), albumId, img.key, img.width, img.height, next?.n ?? 0,
    );
  } catch (err) {
    return uploadFailure(err, "file") ?? failure("Gagal mengunggah foto.");
  }
  return success("Foto diunggah.");
}

export async function finishUpload(): Promise<void> {
  await requireAdmin();
  revalidatePath("/galeri", "layout");
  revalidatePath("/admin/galeri", "layout");
}

const photoSchema = z.object({
  alt: z.string().trim().max(200).default(""),
  caption: z.string().trim().max(300).default(""),
});

export async function savePhoto(id: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = photoSchema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  await run("UPDATE photos SET alt = ?, caption = ? WHERE id = ?", parsed.data.alt, parsed.data.caption, id);
  revalidatePath("/galeri", "layout");
  return success("Keterangan foto disimpan.");
}

export async function deletePhoto(id: string): Promise<ActionState> {
  await requireAdmin();
  const row = await first<{ r2_key: string }>("SELECT r2_key FROM photos WHERE id = ?", id);
  if (!row) return failure("Foto tidak ditemukan.");
  await run("DELETE FROM photos WHERE id = ?", id);
  await deleteObject(row.r2_key);
  revalidatePath("/galeri", "layout");
  revalidatePath("/admin/galeri", "layout");
  return success("Foto dihapus.");
}
