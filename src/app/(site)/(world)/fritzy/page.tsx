import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getProfile, getShowTotals, recentActivities } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/time";
import { mediaUrl, safeUrl } from "@/lib/url";
import { ActivityItem } from "@/components/content";
import { ButtonLink, EmptyState, ErrorNotice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Profil Fritzy",
  description: "Profil Fritzy JKT48: perkenalan, perjalanan, dan rekap kegiatan terbaru.",
  alternates: { canonical: "/fritzy" },
};

export default async function FritzyPage() {
  const [profile, totals, recent] = await Promise.all([
    safeQuery(() => getProfile("fritzy"), null),
    safeQuery(() => getShowTotals(), { shows: 0, setlists: 0, first: null, last: null }),
    safeQuery(() => recentActivities(6), []),
  ]);
  const p = profile.data;
  if (profile.failed) {
    return (
      <div className="shell py-16">
        <ErrorNotice />
      </div>
    );
  }
  const photo = mediaUrl(p?.image_key);
  const links = (p?.links ?? []).map((l) => ({ ...l, url: safeUrl(l.url) })).filter((l) => l.url);
  const stats = [
    totals.data.shows > 0 && { value: String(totals.data.shows), label: "Show teater" },
    totals.data.setlists > 0 && { value: String(totals.data.setlists), label: "Setlist dibawakan" },
    totals.data.first && { value: formatDate(totals.data.first), label: "Show pertama tercatat" },
  ].filter((s): s is { value: string; label: string } => Boolean(s));

  return (
    <>
      <section className="bg-mist">
        <div className="shell grid gap-10 py-12 sm:py-16 md:grid-cols-[minmax(0,22rem)_1fr] md:items-end lg:gap-16">
          <div className="relative mx-auto w-full max-w-[22rem] animate-rise">
            <div className="aspect-[3/4] overflow-hidden rounded-[2rem] bg-plum-100 ring-1 ring-plum-200">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={`Foto ${p?.name ?? "Fritzy"}`} className="size-full object-cover" fetchPriority="high" />
              ) : (
                <div className="grid size-full place-items-center bg-[linear-gradient(160deg,var(--color-plum-100),var(--color-plum-200))]">
                  <span className="font-display text-8xl font-extrabold text-white/80">Zy</span>
                </div>
              )}
            </div>
          </div>
          <div className="animate-rise [animation-delay:80ms]">
            <p className="kicker">Profil</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] text-ink sm:text-7xl">{p?.name || "Fritzy"}</h1>
            {p?.tagline && <p className="mt-3 text-lg font-semibold text-plum-700">{p.tagline}</p>}
            {p?.jiko && (
              <blockquote className="mt-6 max-w-2xl border-l-[3px] border-plum-400 pl-5 font-display text-xl leading-snug text-ink sm:text-2xl">
                “{p.jiko}”
              </blockquote>
            )}
            {p?.summary && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{p.summary}</p>}
            {links.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-2">
                {links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url!} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-plum-800 ring-1 ring-line hover:ring-plum-300">
                      {l.label} <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section aria-label="Angka perjalanan" className="border-y border-line bg-white">
          <dl className="shell grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((s) => (
              <div key={s.label} className="px-1 py-6 sm:px-8 first:sm:pl-0">
                <dt className="text-sm font-semibold text-ink-faint">{s.label}</dt>
                <dd className="mt-1 font-display text-3xl font-bold text-ink tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="shell grid gap-14 py-16 lg:grid-cols-[1fr_22rem]">
        <div>
          {p?.details && p.details.length > 0 && (
            <section aria-labelledby="data-diri">
              <h2 id="data-diri" className="text-2xl font-bold">Data diri</h2>
              <dl className="mt-5 divide-y divide-line rounded-[var(--radius-card)] border border-line">
                {p.details.map((d) => (
                  <div key={d.label} className="grid grid-cols-[minmax(7rem,40%)_1fr] gap-4 px-5 py-3.5">
                    <dt className="text-sm font-semibold text-ink-soft">{d.label}</dt>
                    <dd className="text-ink">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {p?.body ? (
            <section aria-label="Tentang Fritzy" className="prose-ff mt-12 max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} />
          ) : (
            !p?.details?.length && (
              <EmptyState title="Profil lengkap sedang disiapkan">Admin dapat melengkapi profil melalui dashboard.</EmptyState>
            )
          )}
        </div>

        <aside aria-labelledby="kegiatan-terbaru">
          <div className="flex items-center justify-between">
            <h2 id="kegiatan-terbaru" className="text-xl font-bold">Kegiatan terbaru</h2>
            <Link href="/kegiatan" className="inline-flex items-center gap-1 text-sm font-semibold text-plum-700 hover:text-plum-900">
              Semua <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          {recent.data.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Rekap kegiatan belum tersedia.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {recent.data.map((a) => (
                <ActivityItem key={a.id} item={a} showYear />
              ))}
            </ul>
          )}
          <ButtonLink href="/timeline" variant="secondary" className="mt-6 w-full">
            Lihat timeline perjalanan
          </ButtonLink>
        </aside>
      </div>
    </>
  );
}
