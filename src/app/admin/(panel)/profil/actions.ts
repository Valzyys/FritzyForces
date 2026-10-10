"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { failure, formObject, success, uploadFailure, zodFailure, type ActionState } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { first, nowIso, run } from "@/lib/db";
import { parsePairs } from "@/lib/json";
import { deleteObject, resolveImageField } from "@/lib/storage";
import { safeUrl } from "@/lib/url";

const PROFILE_SLUGS = ["fritzy", "fanbase", "esport"] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(120),
  tagline: z.string().trim().max(160).default(""),
  jiko: z.string().trim().max(600).default(""),
  summary: z.string().trim().max(800).default(""),
  body: z.string().max(30000).default(""),
  details: z.string().max(6000).default(""),
  links: z.string().max(4000).default(""),
});

export async function saveProfile(slug: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  if (!(PROFILE_SLUGS as readonly string[]).includes(slug)) return failure("Profil tidak dikenal.");
  const parsed = schema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const d = parsed.data;
  const details = parsePairs(d.details);
  const rawLinks = parsePairs(d.links);
  const links = rawLinks.map((p) => ({ label: p.label, url: safeUrl(p.value) })).filter((l) => l.url);
  if (links.length !== rawLinks.length) return failure("Ada tautan yang tidak valid.", { links: "Setiap tautan harus diawali https://" });
  try {
    const current = await first<{ image_key: string | null }>("SELECT image_key FROM profiles WHERE slug = ?", slug);
    const img = await resolveImageField(form, "image", "profil", current?.image_key ?? null);
    await run(
      `INSERT INTO profiles (slug, name, tagline, jiko, summary, body, image_key, details_json, links_json, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(slug) DO UPDATE SET name=excluded.name, tagline=excluded.tagline, jiko=excluded.jiko, summary=excluded.summary,
         body=excluded.body, image_key=excluded.image_key, details_json=excluded.details_json, links_json=excluded.links_json, updated_at=excluded.updated_at`,
      slug, d.name, d.tagline, d.jiko, d.summary, d.body, img.key, JSON.stringify(details), JSON.stringify(links), nowIso(),
    );
    await deleteObject(img.obsolete);
  } catch (err) {
    return uploadFailure(err, "image") ?? failure("Gagal menyimpan profil.");
  }
  revalidatePath("/", "layout");
  return success("Profil disimpan.");
}
