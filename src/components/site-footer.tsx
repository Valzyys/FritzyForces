import Link from "next/link";
import { ArrowUp, ArrowUpRight, MessageCircleHeart, Ticket } from "lucide-react";
import { MAIN_NAV } from "./site-nav";
import { LogoMark } from "./logo";
import { Marquee } from "./marquee";
import type { LinkItem } from "@/lib/json";
import type { EventRow } from "@/lib/data";
import { formatDate, formatTime, formatWeekday } from "@/lib/time";
import { safeUrl } from "@/lib/url";

type Props = { siteName: string; tagline: string; socials: LinkItem[]; nextShow: EventRow | null; setlists: string[] };

/**
 * Footer bertema panggung: tepi sobekan tiket, navigasi berbentuk lembar setlist (M01, M02…),
 * stub tiket teater berikutnya, dan pita nama setlist yang pernah dibawakan Fritzy.
 */
export function SiteFooter({ siteName, tagline, socials, nextShow, setlists }: Props) {
  const links = socials.map((s) => ({ ...s, url: safeUrl(s.url) })).filter((s): s is LinkItem => Boolean(s.url));
  const nav = [{ href: "/", label: "Beranda" }, ...MAIN_NAV];
  const ribbon = setlists.length > 0 ? setlists : [siteName, "ZyFriends", "Fritzy"];
  const [first, ...restName] = siteName.split(" ");

  return (
    <footer className="relative mt-24 text-white">
      {/* Tepi sobekan tiket */}
      <div aria-hidden className="edge-perforated h-6 bg-plum-950" />
      <div className="relative overflow-hidden bg-plum-950">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 [--dot-color:rgb(255_255_255/0.07)]" />

        {/* Pita setlist */}
        <div className="relative border-y border-white/10 bg-plum-600 py-3">
          <Marquee
            items={ribbon.map((s) => (
              <span key={s} className="font-display text-xl font-bold uppercase tracking-tight sm:text-2xl">
                {s}
              </span>
            ))}
            separator={<span className="text-plum-200">✦</span>}
          />
        </div>

        <div className="shell relative grid gap-10 pt-14 pb-10 lg:grid-cols-[1.05fr_1fr_0.9fr] lg:gap-8">
          {/* Stub tiket */}
          <div className="relative">
            <div className="flex overflow-hidden rounded-[1.25rem] bg-white text-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]">
              <div className="min-w-0 flex-1 p-5 sm:p-6">
                <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-plum-700">
                  <Ticket className="size-3.5" aria-hidden /> Teater berikutnya
                </p>
                {nextShow ? (
                  <>
                    <p className="mt-3 font-display text-2xl font-bold leading-tight">{nextShow.title}</p>
                    <p className="mt-2 text-sm text-ink-soft">
                      {formatWeekday(nextShow.starts_at)}, {formatDate(nextShow.starts_at)}
                    </p>
                    <p className="font-display text-3xl font-bold text-plum-700 tabular-nums">{formatTime(nextShow.starts_at)}</p>
                  </>
                ) : (
                  <>
                    <p className="mt-3 font-display text-2xl font-bold leading-tight">Menunggu jadwal berikutnya</p>
                    <p className="mt-2 text-sm text-ink-soft">Begitu diumumkan, tiketnya muncul di sini.</p>
                  </>
                )}
                <Link href="/jadwal" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-plum-700 hover:text-plum-900">
                  Semua jadwal <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <div className="ticket-divider relative flex w-20 shrink-0 flex-col items-center justify-between bg-plum-50 py-5 [--ticket-bg:var(--color-plum-950)] sm:w-24">
                <LogoMark className="size-8" />
                <span aria-hidden className="h-24 w-8 bg-[repeating-linear-gradient(0deg,var(--color-ink)_0_2px,transparent_2px_4px,var(--color-ink)_4px_5px,transparent_5px_8px)] opacity-80" />
                <span className="text-[0.6rem] font-bold tracking-[0.2em] text-plum-800 [writing-mode:vertical-rl]">ZYFRIENDS</span>
              </div>
            </div>
          </div>

          {/* Lembar setlist navigasi */}
          <nav aria-label="Navigasi footer">
            <p className="mb-4 flex items-baseline justify-between border-b border-dashed border-white/25 pb-3 font-display text-lg font-bold">
              Setlist situs <span className="text-xs font-semibold tracking-[0.16em] text-plum-300">{nav.length} LAGU</span>
            </p>
            <ol className="grid grid-cols-2 gap-x-6">
              {nav.map((item, i) => (
                <li key={item.href}>
                  <Link href={item.href} className="group flex items-baseline gap-3 py-1.5 text-plum-100 hover:text-white">
                    <span className="w-8 shrink-0 font-display text-xs font-bold text-plum-400 tabular-nums">M{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-semibold decoration-plum-400 decoration-2 underline-offset-4 group-hover:underline">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          {/* Encore */}
          <div className="flex flex-col gap-4">
            <p className="font-display text-lg font-bold">
              Encore <span className="text-plum-300">✦</span>
            </p>
            <Link href="/fanwall#tulis" className="group flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 transition-colors hover:bg-white/10">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-plum-500 text-white">
                <MessageCircleHeart className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">Tulis pesan untuk Fritzy</span>
                <span className="text-sm text-plum-200">Tempel di fanwall bersama ZyFriends lain</span>
              </span>
            </Link>
            {links.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {links.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1 rounded-full bg-white px-4 text-sm font-bold text-plum-900 hover:bg-plum-100">
                      {s.label} <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/20 p-4 text-sm text-plum-200">Akun media sosial resmi Fritzy Force akan tampil di sini.</p>
            )}
            <p className="text-xs leading-relaxed text-plum-300">
              {tagline ? `${tagline}. ` : ""}Website komunitas penggemar — tidak berafiliasi resmi dengan JKT48 maupun manajemennya.
            </p>
          </div>
        </div>

        {/* Wordmark raksasa */}
        <div aria-hidden className="relative select-none overflow-hidden px-2">
          <p className="whitespace-nowrap text-center font-display text-[18.5vw] leading-[0.78] font-extrabold tracking-[-0.06em] lg:text-[15.5rem]">
            <span className="text-outline [--outline-color:rgb(255_255_255/0.35)]">{first}</span>
            <span className="text-plum-500">{restName.join(" ") || ""}</span>
          </p>
        </div>

        <div className="relative border-t border-white/10">
          <div className="shell flex flex-wrap items-center justify-between gap-3 py-5 text-sm text-plum-300">
            <p>
              © {new Date().getFullYear()} {siteName} · Dibuat oleh dan untuk ZyFriends
            </p>
            <a href="#top" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-plum-100 ring-1 ring-white/15 hover:bg-white/10">
              Kembali ke atas <ArrowUp className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
