import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { first } from "@/lib/db";
import { AuthShell } from "../auth-shell";
import { SetupForm } from "./setup-form";

export const metadata: Metadata = { title: "Setup Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const count = await first<{ n: number }>("SELECT COUNT(*) AS n FROM admins");
  if ((count?.n ?? 0) > 0) redirect("/admin/login");
  return (
    <AuthShell title="Setup admin pertama" description="Halaman ini hanya bisa dipakai sekali, selama belum ada akun admin.">
      <SetupForm />
    </AuthShell>
  );
}
