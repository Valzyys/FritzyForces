import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MAIN_NAV } from "./site-nav";
import { LogoMark } from "./logo";
import type { LinkItem } from "@/lib/json";
import { safeUrl } from "@/lib/url";

export function SiteFooter({ siteName, tagline, socials }: { siteName: string; tagline: string; socials: LinkItem[] }) {
  const links = socials.map((s) => ({ ...s, url: safeUrl(s.url) })).filter((s): s is LinkItem => Boolean(s.url));
  return (
    <footer className="mt-24 bg-plum-950 text-plum-100">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="size-10" />
            <span className="font-display text-2xl font-bold text-white">{siteName}</span>
          </div>
          {tagline && <p className="mt-4 max-w-sm leading-relaxed text-plum-200">{tagline}</p>}
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-plum-300">
            Website komunitas penggemar. Tidak berafiliasi resmi dengan JKT48 maupun pihak manajemennya.
          </p>
        </div>
        <nav aria-label="Navigasi footer">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-plum-300">Jelajahi</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-1">
            {[{ href: "/", label: "Beranda" }, ...MAIN_NAV].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-plum-100 hover:text-white hover:underline hover:underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-plum-300">Ikuti kami</p>
          {links.length > 0 ? (
            <ul className="mt-4 space-y-2.5">
              {links.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-plum-100 hover:text-white">
                    {s.label} <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-plum-300">Tautan media sosial akan tampil di sini.</p>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-plum-300">
          <p>© {new Date().getFullYear()} {siteName}</p>
          <p>Dibuat oleh dan untuk ZyFriends.</p>
        </div>
      </div>
    </footer>
  );
}
