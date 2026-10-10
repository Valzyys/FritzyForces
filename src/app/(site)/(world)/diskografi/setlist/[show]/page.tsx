import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getShowsForSetlist } from "@/lib/data";
import { parseJsonArray } from "@/lib/json";
import { formatDate, formatWeekday } from "@/lib/time";

type Props = { params: Promise<{ show: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const show = decodeURIComponent((await params).show);
  return { title: `Setlist ${show}`, description: `Daftar show ${show} yang dibawakan Fritzy.` };
}

export default async function SetlistDetailPage({ params }: Props) {
  const show = decodeURIComponent((await params).show).slice(0, 120);
  const rows = await getShowsForSetlist(show);
  if (rows.length === 0) notFound();

  return (
    <div className="shell py-12">
      <Link href="/diskografi?tipe=setlist" className="inline-flex items-center gap-1.5 text-sm font-semibold text-plum-700 hover:text-plum-900">
        <ArrowLeft className="size-4" aria-hidden /> Semua setlist
      </Link>
      <p className="kicker mt-8">Setlist</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{show}</h1>
      <p className="mt-3 text-ink-soft">
        <span className="font-semibold text-ink">{rows.length}</span> show tercatat bersama Fritzy.
      </p>

      <ol className="mt-10 space-y-3">
        {rows.map((r) => {
          const units = parseJsonArray<string>(r.unit_songs);
          return (
            <li key={`${r.date}-${r.show_count}`} className="card grid gap-3 p-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <div>
                <p className="font-display text-lg font-semibold text-ink">{formatDate(r.date)}</p>
                <p className="text-sm text-ink-faint">{formatWeekday(r.date)}</p>
                {r.show_count != null && <p className="mt-2 text-sm font-semibold text-plum-700">Show ke-{r.show_count}</p>}
              </div>
              <div className="min-w-0 text-sm">
                {units.length > 0 && (
                  <p className="text-ink">
                    <span className="font-semibold">Unit song: </span>
                    {units.join(" · ")}
                  </p>
                )}
                {r.lineup && (
                  <p className="mt-2 leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">Line up: </span>
                    {r.lineup}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
