import type { Metadata } from "next";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import { DISCO_TYPES, listDiscography, listSetlistStats, type Disco } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { formatDate } from "@/lib/time";
import { mediaUrl } from "@/lib/url";
import { EmptyState, ErrorNotice, FilterChips, PageHeader, strParam } from "@/components/ui";

export const metadata: Metadata = {
  title: "Diskografi",
  description: "Setlist teater yang dibawakan Fritzy, single, coupling, MV, special MV, penampilan, dan konten penting lainnya.",
  alternates: { canonical: "/diskografi" },
};

export default async function DiscographyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = strParam(sp.tipe);
  const type = raw in DISCO_TYPES ? raw : "";
  const [entries, setlists] = await Promise.all([
    safeQuery(() => listDiscography(type || undefined), []),
    safeQuery(() => (type === "" || type === "setlist" ? listSetlistStats() : Promise.resolve([])), []),
  ]);

  const chips = [{ label: "Semua", value: "", href: "/diskografi" }].concat(
    Object.entries(DISCO_TYPES).map(([value, label]) => ({ label, value, href: `/diskografi?tipe=${value}` })),
  );
  const manualSetlists = entries.data.filter((e) => e.type === "setlist");
  const others = entries.data.filter((e) => e.type !== "setlist");
  const nothing = setlists.data.length === 0 && entries.data.length === 0;

  return (
    <>
      <PageHeader
        kicker="Diskografi"
        title="Lagu, panggung, dan karya Fritzy"
        description="Bukan hanya setlist teater — di sini juga ada single, coupling, MV, penampilan, dan konten penting lainnya."
      />
      <div className="shell py-10">
        <FilterChips items={chips} active={type} label="Filter tipe diskografi" />

        {(entries.failed || setlists.failed) && (
          <div className="mt-8">
            <ErrorNotice />
          </div>
        )}

        {nothing && !entries.failed && (
          <div className="mt-10">
            <EmptyState title="Belum ada entri" icon={<Disc3 className="size-5" aria-hidden />}>
              Konten diskografi untuk kategori ini belum ditambahkan.
            </EmptyState>
          </div>
        )}

        {(setlists.data.length > 0 || manualSetlists.length > 0) && (
          <section aria-labelledby="setlist" className="mt-12">
            <h2 id="setlist" className="text-2xl font-bold">Setlist yang dibawakan</h2>
            <p className="mt-1 text-sm text-ink-soft">Dihitung otomatis dari rekap show teater.</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {setlists.data.map((s, i) => (
                <li key={s.show}>
                  <Link
                    href={`/diskografi/setlist/${encodeURIComponent(s.show)}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white p-6 transition-[border-color,box-shadow] hover:border-plum-200 hover:shadow-[var(--shadow-soft)]"
                  >
                    <span className="font-display text-sm font-bold text-plum-300 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-ink group-hover:text-plum-800">{s.show}</h3>
                    <p className="mt-auto pt-6 text-sm text-ink-soft">
                      <span className="font-display text-3xl font-bold text-plum-700 tabular-nums">{s.count}</span> show
                    </p>
                    <p className="mt-1 text-xs text-ink-faint">
                      {formatDate(s.first_date)}
                      {s.last_date !== s.first_date ? ` — ${formatDate(s.last_date)}` : ""}
                    </p>
                  </Link>
                </li>
              ))}
              {manualSetlists.map((d) => (
                <li key={d.id}>
                  <DiscoCard item={d} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {others.length > 0 && (
          <section aria-labelledby="karya" className="mt-14">
            <h2 id="karya" className="text-2xl font-bold">{type ? DISCO_TYPES[type] : "Single, MV & konten lainnya"}</h2>
            <ul className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((d) => (
                <li key={d.id}>
                  <DiscoCard item={d} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function DiscoCard({ item }: { item: Disco }) {
  const cover = mediaUrl(item.cover_key);
  return (
    <Link href={`/diskografi/${item.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-plum-50 ring-1 ring-line">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="grid size-full place-items-center">
            <Disc3 className="size-12 text-plum-200" aria-hidden />
          </div>
        )}
        {item.featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-plum-800">Unggulan</span>
        ) : null}
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-plum-700">{DISCO_TYPES[item.type] ?? item.type}</p>
      <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink group-hover:text-plum-800">{item.title}</h3>
      {item.release_date && <p className="mt-0.5 text-sm text-ink-faint">{formatDate(item.release_date)}</p>}
    </Link>
  );
}
