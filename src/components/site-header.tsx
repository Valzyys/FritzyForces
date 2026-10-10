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

export function SiteHeader({ siteName }: { siteName: string }) {
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
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-plum-600 focus:px-4 focus:py-2 focus:text-white">
        Lewati ke konten
      </a>
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="shrink-0 rounded-xl" aria-label={`${siteName} — beranda`}>
          <Wordmark name={siteName} />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {MAIN_NAV.map((item) => {
              const active = isActive(pathname, item.match);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "relative inline-flex h-10 items-center rounded-full px-3.5 text-[0.925rem] font-semibold transition-colors",
                      active ? "bg-plum-50 text-plum-800" : "text-ink-soft hover:text-ink",
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
          className="fixed inset-x-0 bottom-0 top-16 z-40 animate-fade overflow-y-auto bg-white lg:hidden"
        >
          <nav aria-label="Navigasi seluler" className="shell py-6">
            <ul className="divide-y divide-line">
              {MAIN_NAV.map((item, i) => {
                const active = isActive(pathname, item.match);
                return (
                  <li key={item.href} className="animate-rise" style={{ animationDelay: `${i * 30}ms` }}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "flex items-center justify-between py-4 font-display text-2xl font-semibold",
                        active ? "text-plum-700" : "text-ink",
                      )}
                    >
                      {item.label}
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
  );
}
