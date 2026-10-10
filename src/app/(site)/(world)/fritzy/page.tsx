import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Disc3, Trophy } from "lucide-react";
import { activityBreakdown, getProfile, getShowTotals, listSetlistStats, listTimeline, recentActivities } from "@/lib/data";
import { ActivityChart } from "@/components/activity-chart";
import { safeQuery } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/time";
import { mediaUrl, safeUrl } from "@/lib/url";
import { ActivityItem } from "@/components/content";
import { BadgeRing } from "@/components/badge-ring";
import { ButtonLink, ErrorNotice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Profil Fritzy",
  description: "Profil Fritzy JKT48: perkenalan, perjalanan, setlist, dan rekap kegiatan terbaru.",
  alternates: { canonical: "/fritzy" },
};

export default async function FritzyPage() {
  const [profile, totals, recent, setlists, timeline, chart] = await Promise.all([
    safeQuery(() => getProfile("fritzy"), null),
    safeQuery(() => getShowTotals(), { shows: 0, setlists: 0, first: null, last: null }),
    safeQuery(() => recentActivities(7), []),
    safeQuery(() => listSetlistStats(), []),
    safeQuery(() => listTimeline(), []),
    safeQuery(() => activityBreakdown(), []),
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
    { value: String(totals.data.shows), label: "Show teater tercatat" },
    { value: String(totals.data.setlists), label: "Setlist dibawakan" },
    { value: totals.data.first ? formatDate(totals.data.first) : "—", label: "Show pertama tercatat" },
    { value: totals.data.last ? formatDate(totals.data.last) : "—", label: "Show terakhir tercatat" },
  ];
  const maxShow = Math.max(1, ...setlists.data.map((s) => s.count));

  return (
    <>
      <section className="relative overflow-hidden bg-mist">
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="shell relative grid grid-cols-1 gap-6 py-8 sm:py-12 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10">
          <div className="relative mx-auto w-full max-w-[20rem] animate-rise">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-plum-600 ring-1 ring-plum-700">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={`Foto ${p?.name ?? "Fritzy"}`} className="size-full object-cover object-[50%_20%]" fetchPriority="high" />
              ) : (
                <>
                  <div aria-hidden className="bg-stripes absolute inset-0 [--stripe-color:rgb(255_255_255/0.08)]" />
                  <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-[8rem] font-extrabold tracking-[-0.08em] text-white">
                    Zy
                  </span>
                </>
              )}
            </div>
            <BadgeRing id="ring-profil" text="JKT48 ✦ Generasi 12 ✦ Fritzy ✦ " center="12" className="absolute -top-4 -right-4 size-24" />
          </div>

          <div className="flex min-w-0 animate-rise flex-col [animation-delay:80ms]">
            <p className="kicker">Profil</p>
            <h1 className="mt-3 text-[clamp(2.4rem,11vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.045em] break-words text-ink">{p?.name || "Fritzy"}</h1>
            {p?.tagline && <p className="mt-3 text-lg font-semibold text-plum-700">{p.tagline}</p>}
            {p?.jiko && (
              <blockquote className="mt-5 max-w-2xl border-l-[3px] border-plum-400 pl-5 font-display text-xl leading-snug text-ink sm:text-2xl">“{p.jiko}”</blockquote>
            )}
            {p?.summary && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{p.summary}</p>}
            {!p?.jiko && !p?.summary && recent.data[0] && (
              <Link href="/kegiatan" className="group mt-6 flex w-full max-w-xl min-w-0 items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-line hover:ring-plum-300">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-plum-600 font-display text-lg font-bold text-white">
                  {recent.data[0].date.slice(8, 10)}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">Terakhir · {recent.data[0].type}</span>
                  <span className="block truncate font-semibold text-ink group-hover:text-plum-800">{recent.data[0].title}</span>
                </span>
              </Link>
            )}
            {links.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url!} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-plum-800 ring-1 ring-line hover:ring-plum-300">
                      {l.label} <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <dl className="mt-auto grid grid-cols-2 gap-2 pt-8 sm:gap-3 xl:grid-cols-4">
              {stats.map((s, i) => (
                <div key={s.label} className={i === 0 ? "rounded-2xl bg-plum-950 p-4 text-white" : "rounded-2xl bg-white p-4 ring-1 ring-line"}>
                  <dt className={i === 0 ? "text-xs font-semibold text-plum-200" : "text-xs font-semibold text-ink-faint"}>{s.label}</dt>
                  <dd className="mt-1 font-display text-lg leading-tight font-bold break-words tabular-nums sm:text-2xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="shell grid grid-cols-1 gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-12">
          {p?.details && p.details.length > 0 && (
            <section aria-labelledby="data-diri">
              <h2 id="data-diri" className="text-2xl font-bold">Data diri</h2>
              <dl className="mt-5 grid gap-px overflow-hidden rounded-[1.25rem] border border-line bg-line sm:grid-cols-2">
                {p.details.map((d) => (
                  <div key={d.label} className="bg-white px-5 py-4">
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">{d.label}</dt>
                    <dd className="mt-1 font-medium text-ink">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {p?.body && <section aria-label="Tentang Fritzy" className="prose-ff max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} />}

          {setlists.data.length > 0 && (
            <section aria-labelledby="setlist-fritzy">
              <div className="flex items-end justify-between">
                <h2 id="setlist-fritzy" className="text-2xl font-bold">Setlist yang dibawakan</h2>
                <Link href="/diskografi" className="inline-flex items-center gap-1 text-sm font-bold text-plum-700 hover:text-plum-900">
                  Diskografi <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {setlists.data.map((s) => (
                  <li key={s.show}>
                    <Link href={`/diskografi/setlist/${encodeURIComponent(s.show)}`} className="group flex items-center gap-4 rounded-2xl bg-mist p-4 ring-1 ring-line hover:ring-plum-300">
                      <Disc3 className="size-9 shrink-0 text-plum-500 transition-transform duration-700 group-hover:rotate-180" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg font-bold text-ink">{s.show}</span>
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-plum-100">
                          <span className="block h-full rounded-full bg-plum-600" style={{ width: `${(s.count / maxShow) * 100}%` }} />
                        </span>
                      </span>
                      <span className="font-display text-2xl font-bold text-plum-700 tabular-nums">{s.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="perjalanan" className="relative overflow-hidden rounded-[1.5rem] bg-plum-950 p-6 text-white sm:p-8">
            <div aria-hidden className="bg-dots absolute inset-0 [--dot-color:rgb(255_255_255/0.07)]" />
            <div className="relative flex items-end justify-between gap-4">
              <h2 id="perjalanan" className="text-2xl font-bold">Perjalanan</h2>
              <Link href="/timeline" className="text-sm font-bold text-plum-200 hover:text-white">Timeline lengkap →</Link>
            </div>
            {timeline.data.length > 0 ? (
              <ol className="relative mt-6 grid gap-4 sm:grid-cols-3">
                {timeline.data.slice(-3).map((t) => (
                  <li key={t.id} className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                    <time className="text-sm font-bold text-plum-300">{formatDate(t.date)}</time>
                    <p className="mt-1 font-semibold leading-snug">{t.title}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="relative mt-5 flex items-center gap-4">
                <Trophy className="size-8 shrink-0 text-plum-300" aria-hidden />
                <p className="text-plum-100">
                  Timeline pencapaian sedang dikurasi tim Fritzy Force.{" "}
                  {totals.data.first && `Show teater pertama yang tercatat: ${formatDate(totals.data.first)}.`}
                </p>
              </div>
            )}
          </section>

          <ActivityChart rows={chart.data} />
        </div>

        <aside aria-labelledby="kegiatan-terbaru" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.5rem] border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 id="kegiatan-terbaru" className="text-xl font-bold">Kegiatan terbaru</h2>
              <Link href="/kegiatan" className="inline-flex items-center gap-1 text-sm font-semibold text-plum-700 hover:text-plum-900">
                Semua <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
            {recent.data.length === 0 ? (
              <p className="mt-4 text-sm text-ink-soft">Rekap kegiatan belum tersedia.</p>
            ) : (
              <ul className="mt-1 divide-y divide-line">
                {recent.data.map((a) => (
                  <ActivityItem key={a.id} item={a} showYear />
                ))}
              </ul>
            )}
          </div>
          <ButtonLink href="/fanwall#tulis" variant="secondary" className="mt-4 w-full">
            Tulis pesan untuk Fritzy
          </ButtonLink>
        </aside>
      </div>
    </>
  );
}
