"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { failure, formObject, zodFailure, type ActionState } from "@/lib/action";
import { createSession, destroySession } from "@/lib/auth";
import { hashPassword, safeEqualString, verifyPassword } from "@/lib/crypto";
import { getEnv } from "@/lib/cf";
import { first, newId, run } from "@/lib/db";
import { bucketKey, clearBucket, clientIp, hit, isLimited } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid.").max(200),
  password: z.string().min(1, "Password wajib diisi.").max(200),
});

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const { email, password } = parsed.data;

  const ip = await clientIp();
  const ipBucket = await bucketKey("login-ip", ip);
  const accountBucket = await bucketKey("login-acct", email);
  // Maksimal 5 percobaan gagal per akun / 15 menit, dan 20 per IP / 15 menit.
  if ((await isLimited(accountBucket, 5, 15)) || (await isLimited(ipBucket, 20, 15))) {
    return failure("Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.");
  }

  const admin = await first<{ id: string; password_hash: string }>("SELECT id, password_hash FROM admins WHERE email = ?", email);
  // Tetap jalankan verifikasi walau akun tidak ada agar waktu respons serupa.
  const ok = await verifyPassword(password, admin?.password_hash ?? "pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
  if (!admin || !ok) {
    await Promise.all([hit(accountBucket), hit(ipBucket)]);
    return failure("Email atau password salah.");
  }
  await clearBucket(accountBucket);
  await createSession(admin.id);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

const setupSchema = z
  .object({
    token: z.string().min(1, "Token setup wajib diisi."),
    name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(60),
    email: z.string().trim().email("Email tidak valid.").max(200),
    password: z.string().min(12, "Password minimal 12 karakter.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Konfirmasi password tidak sama." });

export async function setupFirstAdmin(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = setupSchema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const env = await getEnv();
  const ipBucket = await bucketKey("setup", await clientIp());
  if (await isLimited(ipBucket, 10, 60)) return failure("Terlalu banyak percobaan. Coba lagi nanti.");

  const setupToken = (env.ADMIN_SETUP_TOKEN ?? "").trim();
  if (!setupToken) {
    return failure("ADMIN_SETUP_TOKEN belum dikonfigurasi di Cloudflare (Settings → Variables and Secrets).");
  }
  if (!safeEqualString(parsed.data.token.trim(), setupToken)) {
    await hit(ipBucket);
    return failure("Token setup salah.", { token: "Token tidak cocok." });
  }
  const existing = await first<{ n: number }>("SELECT COUNT(*) AS n FROM admins");
  if ((existing?.n ?? 0) > 0) return failure("Admin sudah dibuat. Silakan masuk.");

  const id = newId();
  await run(
    "INSERT INTO admins (id, email, name, password_hash) VALUES (?, ?, ?, ?)",
    id,
    parsed.data.email,
    parsed.data.name,
    await hashPassword(parsed.data.password),
  );
  await createSession(id);
  redirect("/admin");
}
