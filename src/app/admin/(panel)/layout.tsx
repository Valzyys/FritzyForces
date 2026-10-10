import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { first } from "@/lib/db";
import { logout } from "../auth-actions";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin Fritzy Force" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const pending = await first<{ n: number }>("SELECT COUNT(*) AS n FROM fanwall WHERE status = 'pending'").catch(() => null);

  return (
    <div className="min-h-dvh bg-mist lg:grid lg:grid-cols-[16rem_1fr]">
      <AdminNav
        pendingFanwall={pending?.n ?? 0}
        footer={
          <div className="space-y-1 px-1">
            <p className="truncate px-2 text-sm font-semibold">{admin.name}</p>
            <p className="truncate px-2 pb-2 text-xs text-plum-300">{admin.email}</p>
            <Link href="/" target="_blank" className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-plum-200 hover:bg-white/5 hover:text-white">
              <ExternalLink className="size-4" aria-hidden /> Lihat situs
            </Link>
            <form action={logout}>
              <button type="submit" className="flex h-9 w-full items-center gap-2 rounded-lg px-2 text-sm text-plum-200 hover:bg-white/5 hover:text-white">
                <LogOut className="size-4" aria-hidden /> Keluar
              </button>
            </form>
          </div>
        }
      />
      <main id="konten" className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
