import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { first, run } from "./db";
import { randomToken, sha256Hex } from "./crypto";

export const SESSION_COOKIE = "ff_admin";
const SESSION_DAYS = 7;

export type Admin = { id: string; email: string; name: string };

export async function createSession(adminId: string): Promise<void> {
  const token = randomToken(32);
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await run(
    "INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, ?)",
    await sha256Hex(token),
    adminId,
    expires.toISOString(),
  );
  await run("UPDATE admins SET last_login_at = ? WHERE id = ?", new Date().toISOString(), adminId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE id = ?", await sha256Hex(token));
  jar.delete(SESSION_COOKIE);
}

/** Admin yang sedang login, atau null. Di-cache per request. */
export const currentAdmin = cache(async (): Promise<Admin | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 200) return null;
  try {
    return await first<Admin>(
      `SELECT a.id, a.email, a.name FROM sessions s JOIN admins a ON a.id = s.admin_id
       WHERE s.id = ? AND s.expires_at > ?`,
      await sha256Hex(token),
      new Date().toISOString(),
    );
  } catch {
    return null;
  }
});

/** Dipakai di setiap halaman & server action admin — otorisasi selalu di server. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
