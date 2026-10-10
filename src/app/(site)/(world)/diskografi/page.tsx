import type { Metadata } from "next";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import { DISCO_TYPES, listDiscography, listSetlistStats, type Disco } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { formatDate } from "@/lib/time";
import { mediaUrl } from "@/lib/url";
import { EmptyState, ErrorNotice, FilterChips, PageHeader, StatStrip, strParam } from "@/components/ui";
import { Marquee } from "@/components/marquee";

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
        aside={
          <StatStrip
            items={[
              { value: setlists.data.length, label: "Setlist" },
              { value: setlists.data.reduce((a, b) => a + b.count, 0), label: "Show tercatat" },
              { value: entries.data.length, label: "Entri lain" },
            ]}
          />
        }
      />
      {setlists.data.length > 0 && (
        <div className="border-b border-line bg-white py-4">
          <Marquee
            items={setlists.data.map((s) => (
              <span key={s.show} className="text-outline font-display text-4xl font-extrabold uppercase tracking-tight [--outline-color:var(--color-plum-300)] sm:text-5xl">
                {s.show}
              </span>
            ))}
            separator={<span className="font-display text-3xl text-plum-500">✦</span>}
            speed={60}
          />
        </div>
      )}
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
            <ol className="mt-6 divide-y divide-line overflow-hidden rounded-[1.5rem] border border-line bg-white">
              {setlists.data.map((s, i) => {
                const max = Math.max(...setlists.data.map((x) => x.count));
                return (
                  <li key={s.show}>
                    <Link
                      href={`/diskografi/setlist/${encodeURIComponent(s.show)}`}
                      className="group grid grid-cols-[3.5rem_1fr] items-center gap-x-4 gap-y-3 p-5 transition-colors hover:bg-mist sm:grid-cols-[4.5rem_minmax(0,1fr)_14rem_6rem] sm:p-6"
                    >
                      <span className="font-display text-4xl font-extrabold text-plum-200 tabular-nums transition-colors group-hover:text-plum-500">M{String(i + 1).padStart(2, "0")}</span>
                      <span className="min-w-0">
                        <span className="block font-display text-2xl font-bold leading-tight text-ink group-hover:text-plum-800 sm:text-3xl">{s.show}</span>
                        <span className="mt-1 block text-sm text-ink-faint">
                          {formatDate(s.first_date)}
                          {s.last_date !== s.first_date ? ` — ${formatDate(s.last_date)}` : ""}
                        </span>
                      </span>
                      <span className="col-span-2 block h-2.5 overflow-hidden rounded-full bg-plum-50 sm:col-span-1" aria-hidden>
                        <span className="block h-full rounded-full bg-plum-600" style={{ width: `${(s.count / max) * 100}%` }} />
                      </span>
                      <span className="col-span-2 text-left sm:col-span-1 sm:text-right">
                        <span className="font-display text-3xl font-extrabold text-plum-700 tabular-nums">{s.count}</span>
                        <span className="ml-1 text-sm text-ink-soft">show</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            {manualSetlists.length > 0 && (
              <ul className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {manualSetlists.map((d) => (
                  <li key={d.id}>
                    <DiscoCard item={d} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {!type && others.length === 0 && setlists.data.length > 0 && (
          <section aria-labelledby="kategori-lain" className="mt-14">
            <h2 id="kategori-lain" className="text-2xl font-bold">Kategori lainnya</h2>
            <p className="mt-1 text-sm text-ink-soft">Single, MV, dan penampilan lain sedang dikurasi tim.</p>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(DISCO_TYPES)
                .filter(([k]) => k !== "setlist")
                .map(([value, label], i) => (
                  <li key={value} className={i === 0 ? "col-span-2" : undefined}>
                    <Link href={`/diskografi?tipe=${value}`} className={`group flex h-full min-h-36 flex-col justify-between rounded-[1.25rem] p-4 ring-1 transition-colors ${i === 0 ? "bg-plum-600 text-white ring-plum-700" : i === 3 ? "bg-plum-950 text-white ring-plum-900" : "bg-stripes bg-mist text-ink ring-line hover:ring-plum-300"}`}>
                      <Disc3 className="size-6 opacity-70" aria-hidden />
                      <span className="font-display text-lg font-bold">{label}</span>
                    </Link>
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
