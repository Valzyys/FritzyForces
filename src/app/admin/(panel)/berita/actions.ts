"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { failure, formObject, success, uploadFailure, zodFailure, type ActionState } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { POST_CATEGORIES } from "@/lib/data";
import { first, newId, nowIso, run, uniqueSlug } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { deleteObject, resolveImageField } from "@/lib/storage";
import { wibLocalToIso } from "@/lib/time";

const schema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(200),
  slug: z.string().trim().max(80).default(""),
  category: z.enum(Object.keys(POST_CATEGORIES) as [string, ...string[]]),
  excerpt: z.string().trim().max(400, "Ringkasan maksimal 400 karakter.").default(""),
  body: z.string().max(60000).default(""),
  status: z.enum(["draft", "published"]),
  published_at: z.string().default(""),
});

export async function savePost(id: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const d = parsed.data;
  if (d.status === "published" && !d.body.trim()) return failure("Isi berita wajib diisi sebelum terbit.", { body: "Isi tidak boleh kosong." });
  const publishedAt = d.published_at ? wibLocalToIso(d.published_at) : d.status === "published" ? nowIso() : null;
  if (d.published_at && !publishedAt) return failure("Tanggal terbit tidak valid.", { published_at: "Format tidak valid." });
  try {
    const slug = await uniqueSlug("posts", slugify(d.slug || d.title), id);
    const current = id ? await first<{ cover_key: string | null }>("SELECT cover_key FROM posts WHERE id = ?", id) : null;
    const img = await resolveImageField(form, "cover", "berita", current?.cover_key ?? null);
    if (id) {
      await run(
        `UPDATE posts SET title=?, slug=?, category=?, excerpt=?, body=?, status=?, published_at=?, cover_key=?, updated_at=? WHERE id=?`,
        d.title, slug, d.category, d.excerpt, d.body, d.status, publishedAt, img.key, nowIso(), id,
      );
    } else {
      await run(
        `INSERT INTO posts (id, title, slug, category, excerpt, body, status, published_at, cover_key) VALUES (?,?,?,?,?,?,?,?,?)`,
        newId(), d.title, slug, d.category, d.excerpt, d.body, d.status, publishedAt, img.key,
      );
    }
    await deleteObject(img.obsolete);
  } catch (err) {
    return uploadFailure(err, "cover") ?? failure("Gagal menyimpan berita.");
  }
  revalidatePath("/", "layout");
  if (!id) redirect("/admin/berita?saved=1");
  return success(d.status === "published" ? "Berita disimpan & terbit." : "Draf disimpan.");
}

export async function setPostStatus(id: string, status: "draft" | "published"): Promise<ActionState> {
  await requireAdmin();
  const post = await first<{ body: string; published_at: string | null }>("SELECT body, published_at FROM posts WHERE id = ?", id);
  if (!post) return failure("Berita tidak ditemukan.");
  if (status === "published" && !post.body.trim()) return failure("Isi berita masih kosong.");
  await run("UPDATE posts SET status = ?, published_at = COALESCE(?, published_at), updated_at = ? WHERE id = ?", status, status === "published" && !post.published_at ? nowIso() : null, nowIso(), id);
  revalidatePath("/", "layout");
  return success(status === "published" ? "Berita diterbitkan." : "Berita ditarik menjadi draf.");
}

export async function deletePost(id: string): Promise<ActionState> {
  await requireAdmin();
  const row = await first<{ cover_key: string | null }>("SELECT cover_key FROM posts WHERE id = ?", id);
  await run("DELETE FROM posts WHERE id = ?", id);
  await deleteObject(row?.cover_key);
  revalidatePath("/", "layout");
  return success("Berita dihapus.");
}
