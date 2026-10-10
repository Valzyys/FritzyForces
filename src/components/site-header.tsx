"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { MAIN_NAV } from "./site-nav";
import { Wordmark } from "./logo";
import { cx } from "./ui";

function isActive(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

export type Announcement = { label: string; text: string; href: string } | null;

export function SiteHeader({ siteName, announcement }: { siteName: string; announcement: Announcement }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Tutup menu saat pindah halaman.
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    {announcement && (
      <div id="top" className="relative z-50 bg-plum-950 text-white">
        <Link href={announcement.href} className="shell flex h-9 items-center justify-center gap-2 text-[0.8rem] sm:justify-between">
          <span className="flex min-w-0 items-center gap-2">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-plum-400 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-plum-300" />
            </span>
            <span className="shrink-0 font-bold uppercase tracking-[0.12em] text-plum-300">{announcement.label}</span>
            <span className="truncate font-medium">{announcement.text}</span>
          </span>
          <span className="hidden shrink-0 font-semibold text-plum-200 underline-offset-4 hover:underline sm:inline">Lihat detail →</span>
        </Link>
      </div>
    )}
    <header {...(announcement ? {} : { id: "top" })} className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-plum-600 focus:px-4 focus:py-2 focus:text-white">
        Lewati ke konten
      </a>
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="shrink-0 rounded-xl" aria-label={`${siteName} — beranda`}>
          <Wordmark name={siteName} />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-0.5 rounded-full bg-mist p-1 ring-1 ring-line">
            {MAIN_NAV.map((item) => {
              const active = isActive(pathname, item.match);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "relative inline-flex h-9 items-center rounded-full px-3.5 text-[0.9rem] font-semibold transition-colors",
                      active ? "bg-white text-plum-800 shadow-[var(--shadow-soft)] ring-1 ring-line" : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full text-ink ring-1 ring-line hover:bg-plum-50 lg:hidden"
          aria-expanded={open}
          aria-controls="menu-seluler"
          onClick={() => {
            setOpenedAt(pathname);
            setOpen((v) => !v);
          }}
        >
          <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <div
          id="menu-seluler"
          ref={panelRef}
          className="bg-dots fixed inset-x-0 bottom-0 top-16 z-40 animate-fade overflow-y-auto bg-white lg:hidden"
        >
          <nav aria-label="Navigasi seluler" className="shell py-6">
            <p className="mb-2 flex justify-between border-b border-dashed border-line-strong pb-3 font-display text-sm font-bold text-ink-faint">
              <span>Setlist situs</span>
              <span>{MAIN_NAV.length} lagu</span>
            </p>
            <ul className="divide-y divide-line">
              {MAIN_NAV.map((item, i) => {
                const active = isActive(pathname, item.match);
                return (
                  <li key={item.href} className="animate-rise" style={{ animationDelay: `${i * 30}ms` }}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "flex items-center gap-4 py-3.5 font-display text-2xl font-semibold",
                        active ? "text-plum-700" : "text-ink",
                      )}
                    >
                      <span className="w-9 text-sm font-bold text-plum-400 tabular-nums">M{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1">{item.label}</span>
                      {active && <span className="size-2 rounded-full bg-plum-600" aria-hidden />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
