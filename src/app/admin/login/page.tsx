import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { first } from "@/lib/db";
import { AuthShell } from "../auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentAdmin()) redirect("/admin");
  const count = await first<{ n: number }>("SELECT COUNT(*) AS n FROM admins").catch(() => null);
  return (
    <AuthShell title="Masuk" description="Gunakan akun admin yang sudah terdaftar.">
      <LoginForm />
      {count && count.n === 0 && (
        <p className="mt-6 text-sm text-ink-soft">
          Belum ada admin?{" "}
          <Link href="/admin/setup" className="font-semibold text-plum-700 underline underline-offset-4">
            Buat akun admin pertama
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
