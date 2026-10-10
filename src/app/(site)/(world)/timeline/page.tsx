import type { Metadata } from "next";
import { ArrowUpRight, Trophy } from "lucide-react";
import { getShowTotals, listTimeline, recentActivities } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/time";
import { mediaUrl, safeUrl } from "@/lib/url";
import { ErrorNotice, PageHeader, StatStrip } from "@/components/ui";
import { ActivityItem } from "@/components/content";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Momen dan pencapaian penting dalam perjalanan Fritzy di JKT48.",
  alternates: { canonical: "/timeline" },
};

export default async function TimelinePage() {
  const [items, totals, recent] = await Promise.all([
    safeQuery(() => listTimeline(), []),
    safeQuery(() => getShowTotals(), { shows: 0, setlists: 0, first: null, last: null }),
    safeQuery(() => recentActivities(6), []),
  ]);
  const byYear = new Map<string, typeof items.data>();
  for (const it of items.data) {
    const y = it.date.slice(0, 4);
    byYear.set(y, [...(byYear.get(y) ?? []), it]);
  }

  return (
    <>
      <PageHeader kicker="Timeline" title="Perjalanan Fritzy" description="Momen-momen yang menandai langkah Fritzy — dipilih dan dirangkum oleh tim Fritzy Force."
        aside={<StatStrip items={[{ value: items.data.length, label: "Momen" }, { value: new Set(items.data.map((i) => i.date.slice(0, 4))).size, label: "Tahun" }, { value: totals.data.shows, label: "Show teater" }]} />}
      />
      <div className="shell py-14">
        {items.failed ? (
          <ErrorNotice />
        ) : items.data.length === 0 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="bg-stripes relative overflow-hidden rounded-[1.5rem] bg-plum-950 p-8 text-white">
              <Trophy className="size-10 text-plum-300" aria-hidden />
              <p className="mt-6 font-display text-3xl font-bold leading-tight">Timeline pencapaian sedang dikurasi.</p>
              <p className="mt-3 text-plum-100">Tim Fritzy Force sedang memilih momen-momen terpenting. Sementara itu, ikuti jejak kegiatan terbaru Fritzy.</p>
              <Link href="/kegiatan" className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-plum-900 hover:bg-plum-100">Buka rekap kegiatan</Link>
            </div>
            <div className="rounded-[1.5rem] border border-line bg-white p-6">
              <p className="kicker">Jejak terbaru</p>
              <ul className="mt-2 divide-y divide-line">
                {recent.data.map((a) => (
                  <ActivityItem key={a.id} item={a} showYear />
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {[...byYear.entries()].map(([year, list]) => (
              <section key={year} aria-labelledby={`tahun-${year}`} className="grid gap-6 md:grid-cols-[8rem_1fr]">
                <h2 id={`tahun-${year}`} className="font-display text-5xl font-extrabold text-plum-200 md:sticky md:top-24 md:self-start">
                  {year}
                </h2>
                <ol className="relative space-y-8 border-l-2 border-plum-100 pl-7">
                  {list.map((it) => {
                    const img = mediaUrl(it.image_key);
                    const link = safeUrl(it.link_url);
                    return (
                      <li key={it.id} className="relative">
                        <span aria-hidden className="absolute -left-[2.3rem] top-1.5 size-4 rounded-full border-[3px] border-white bg-plum-600 ring-2 ring-plum-200" />
                        <time dateTime={it.date} className="text-sm font-semibold text-plum-700">{formatDate(it.date)}</time>
                        <h3 className="mt-1 text-xl font-semibold leading-snug text-ink">{it.title}</h3>
                        {it.description && <div className="prose-ff mt-2 text-base text-ink-soft" dangerouslySetInnerHTML={{ __html: renderMarkdown(it.description) }} />}
                        {img && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" loading="lazy" className="mt-4 max-h-80 rounded-2xl object-cover ring-1 ring-line" />
                        )}
                        {link && (
                          <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-plum-700 hover:text-plum-900">
                            Lihat sumber <ArrowUpRight className="size-3.5" aria-hidden />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
