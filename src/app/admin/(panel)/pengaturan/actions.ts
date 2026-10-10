"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { failure, formObject, success, uploadFailure, zodFailure, type ActionState } from "@/lib/action";
import { cookies } from "next/headers";
import { SESSION_COOKIE, requireAdmin } from "@/lib/auth";
import { hashPassword, sha256Hex, verifyPassword } from "@/lib/crypto";
import { first, newId, run } from "@/lib/db";
import { parsePairs } from "@/lib/json";
import { getSettings, setSetting } from "@/lib/settings";
import { deleteObject, resolveImageField } from "@/lib/storage";
import { safeUrl } from "@/lib/url";

const siteSchema = z.object({
  site_name: z.string().trim().min(1, "Nama situs wajib diisi.").max(60),
  tagline: z.string().trim().max(160).default(""),
  explore_intro: z.string().trim().max(400).default(""),
  socials: z.string().max(3000).default(""),
});

export async function saveSiteSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = siteSchema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const raw = parsePairs(parsed.data.socials);
  const socials = raw.map((p) => ({ label: p.label, url: safeUrl(p.value) })).filter((s) => s.url);
  if (socials.length !== raw.length) return failure("Ada tautan media sosial yang tidak valid.", { socials: "Setiap tautan harus diawali https://" });
  try {
    const current = await getSettings();
    const img = await resolveImageField(form, "game_image", "game", current.gameImageKey);
    await setSetting("site_name", parsed.data.site_name);
    await setSetting("tagline", parsed.data.tagline);
    await setSetting("explore_intro", parsed.data.explore_intro);
    await setSetting("socials", socials);
    await setSetting("fanwall_moderation", form.get("fanwall_moderation") === "on" ? "on" : "off");
    await setSetting("game_image_key", img.key);
    await deleteObject(img.obsolete);
  } catch (err) {
    return uploadFailure(err, "game_image") ?? failure("Gagal menyimpan pengaturan.");
  }
  revalidatePath("/", "layout");
  return success("Pengaturan disimpan.");
}

const adminSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(60),
  email: z.string().trim().email("Email tidak valid.").max(200),
  password: z.string().min(12, "Password minimal 12 karakter.").max(200),
});

export async function addAdmin(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = adminSchema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const exists = await first<{ id: string }>("SELECT id FROM admins WHERE email = ?", parsed.data.email);
  if (exists) return failure("Email sudah terdaftar.", { email: "Email sudah dipakai admin lain." });
  await run("INSERT INTO admins (id, email, name, password_hash) VALUES (?,?,?,?)", newId(), parsed.data.email, parsed.data.name, await hashPassword(parsed.data.password));
  revalidatePath("/admin/pengaturan");
  return success("Admin baru ditambahkan.");
}

export async function removeAdmin(id: string): Promise<ActionState> {
  const me = await requireAdmin();
  if (me.id === id) return failure("Kamu tidak bisa menghapus akunmu sendiri.");
  const count = await first<{ n: number }>("SELECT COUNT(*) AS n FROM admins");
  if ((count?.n ?? 0) <= 1) return failure("Minimal harus ada satu admin.");
  await run("DELETE FROM admins WHERE id = ?", id);
  revalidatePath("/admin/pengaturan");
  return success("Admin dihapus.");
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Isi password saat ini."),
    next: z.string().min(12, "Password baru minimal 12 karakter.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Konfirmasi tidak sama." });

export async function changePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const parsed = passwordSchema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const row = await first<{ password_hash: string }>("SELECT password_hash FROM admins WHERE id = ?", me.id);
  if (!row || !(await verifyPassword(parsed.data.current, row.password_hash))) {
    return failure("Password saat ini salah.", { current: "Password salah." });
  }
  await run("UPDATE admins SET password_hash = ? WHERE id = ?", await hashPassword(parsed.data.next), me.id);
  // Keluarkan sesi lain milik akun ini.
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  await run("DELETE FROM sessions WHERE admin_id = ? AND id != ?", me.id, await sha256Hex(token));
  return success("Password diganti. Sesi di perangkat lain telah dikeluarkan.");
}
