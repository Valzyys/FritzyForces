import type { Metadata } from "next";
import { ArrowUpRight, Trophy } from "lucide-react";
import { listTimeline } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/time";
import { mediaUrl, safeUrl } from "@/lib/url";
import { EmptyState, ErrorNotice, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Momen dan pencapaian penting dalam perjalanan Fritzy di JKT48.",
  alternates: { canonical: "/timeline" },
};

export default async function TimelinePage() {
  const items = await safeQuery(() => listTimeline(), []);
  const byYear = new Map<string, typeof items.data>();
  for (const it of items.data) {
    const y = it.date.slice(0, 4);
    byYear.set(y, [...(byYear.get(y) ?? []), it]);
  }

  return (
    <>
      <PageHeader kicker="Timeline" title="Perjalanan Fritzy" description="Momen-momen yang menandai langkah Fritzy — dipilih dan dirangkum oleh tim Fritzy Force." />
      <div className="shell py-14">
        {items.failed ? (
          <ErrorNotice />
        ) : items.data.length === 0 ? (
          <EmptyState title="Timeline sedang dikurasi" icon={<Trophy className="size-5" aria-hidden />}>
            Pencapaian akan ditambahkan oleh admin.
          </EmptyState>
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
