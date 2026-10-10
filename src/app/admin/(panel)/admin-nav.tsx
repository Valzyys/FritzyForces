"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Disc3,
  Images,
  LayoutDashboard,
  Menu,
  MessageSquareHeart,
  Newspaper,
  Settings,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { cx } from "@/components/ui";
import { LogoMark } from "@/components/logo";

const NAV = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/jadwal", label: "Jadwal", icon: CalendarDays },
  { href: "/admin/kegiatan", label: "Rekap kegiatan", icon: ClipboardList },
  { href: "/admin/timeline", label: "Timeline", icon: Trophy },
  { href: "/admin/diskografi", label: "Diskografi", icon: Disc3 },
  { href: "/admin/berita", label: "Berita", icon: Newspaper },
  { href: "/admin/galeri", label: "Galeri", icon: Images },
  { href: "/admin/fanwall", label: "Fanwall", icon: MessageSquareHeart },
  { href: "/admin/profil", label: "Profil", icon: UserRound },
  { href: "/admin/komunitas", label: "Komunitas", icon: Users },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

function NavList({ pathname, pendingFanwall }: { pathname: string; pendingFanwall: number }) {
  return (
    <ul className="space-y-0.5">
      {NAV.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                active ? "bg-white/10 text-white" : "text-plum-200 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {item.href === "/admin/fanwall" && pendingFanwall > 0 && (
                <span className="rounded-full bg-plum-400 px-2 py-0.5 text-xs font-bold text-plum-950 tabular-nums" aria-label={`${pendingFanwall} menunggu`}>
                  {pendingFanwall}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminNav({ footer, pendingFanwall }: { footer: React.ReactNode; pendingFanwall: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(pathname);
  if (open && at !== pathname) setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Bilah atas seluler */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-plum-950 px-4 text-white lg:hidden">
        <span className="flex items-center gap-2 font-display font-bold"><LogoMark className="size-8" /> Admin</span>
        <button
          type="button"
          onClick={() => {
            setAt(pathname);
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className="grid size-10 place-items-center rounded-full hover:bg-white/10"
        >
          <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      <aside
        id="admin-sidebar"
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-plum-950 p-4 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link href="/admin" className="mb-6 hidden items-center gap-2 px-3 pt-2 lg:flex">
          <LogoMark className="size-9" />
          <span className="font-display font-bold">Admin</span>
        </Link>
        <nav aria-label="Navigasi admin" className="flex-1 overflow-y-auto">
          <NavList pathname={pathname} pendingFanwall={pendingFanwall} />
        </nav>
        <div className="mt-4 border-t border-white/10 pt-4">{footer}</div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-plum-950/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
    </>
  );
}
