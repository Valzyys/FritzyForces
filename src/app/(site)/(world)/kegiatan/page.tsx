import type { Metadata } from "next";
import { activityBreakdown, activityFacets, listActivities } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { ActivityItem } from "@/components/content";
import { EmptyState, ErrorNotice, FilterChips, PageHeader, Pagination, StatStrip, pageParam, strParam } from "@/components/ui";
import { ActivityChart } from "@/components/activity-chart";

export const metadata: Metadata = {
  title: "Rekap Kegiatan",
  description: "Rekap kegiatan Fritzy JKT48: teater, video call, off-air, konser, dan lainnya.",
  alternates: { canonical: "/kegiatan" },
};

const PER_PAGE = 30;

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const page = pageParam(sp.hal);
  const facets = await safeQuery(() => activityFacets(), { years: [], types: [] });
  const year = facets.data.years.includes(strParam(sp.tahun)) ? strParam(sp.tahun) : "";
  const type = facets.data.types.includes(strParam(sp.jenis)) ? strParam(sp.jenis) : "";
  const [list, breakdown] = await Promise.all([
    safeQuery(() => listActivities({ year, type, page, perPage: PER_PAGE }), { items: [], total: 0 }),
    safeQuery(() => activityBreakdown(), []),
  ]);
  const totalAll = breakdown.data.reduce((a, b) => a + b.n, 0);

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams({ ...(year && { tahun: year }), ...(type && { jenis: type }), ...over });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `/kegiatan?${s}` : "/kegiatan";
  };

  return (
    <>
      <PageHeader
        kicker="Kegiatan"
        title="Rekap kegiatan Fritzy"
        description="Diperbarui otomatis dari rekap yang dikelola tim Fritzy Force."
        aside={
          <StatStrip
            items={[
              { value: totalAll, label: "Kegiatan" },
              { value: facets.data.years.length, label: "Tahun" },
              { value: facets.data.types.length, label: "Jenis" },
            ]}
          />
        }
      />
      <div className="shell grid grid-cols-1 gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
        <div className="space-y-3">
          <FilterChips
            label="Filter tahun"
            active={year}
            items={[{ label: "Semua tahun", value: "", href: qs({ tahun: "", hal: "" }) }, ...facets.data.years.map((y) => ({ label: y, value: y, href: qs({ tahun: y, hal: "" }) }))]}
          />
          <FilterChips
            label="Filter jenis kegiatan"
            active={type}
            items={[{ label: "Semua jenis", value: "", href: qs({ jenis: "", hal: "" }) }, ...facets.data.types.map((t) => ({ label: t, value: t, href: qs({ jenis: t, hal: "" }) }))]}
          />
        </div>

        <div className="mt-8">
          {list.failed ? (
            <ErrorNotice />
          ) : list.data.items.length === 0 ? (
            <EmptyState title="Belum ada kegiatan">Rekap kegiatan untuk filter ini belum tersedia.</EmptyState>
          ) : (
            <>
              <p className="text-sm text-ink-faint">{list.data.total} kegiatan</p>
              <ul className="mt-2 divide-y divide-line">
                {list.data.items.map((a) => (
                  <ActivityItem key={a.id} item={a} showYear />
                ))}
              </ul>
              <Pagination page={page} total={list.data.total} perPage={PER_PAGE} href={(n) => qs({ hal: n > 1 ? String(n) : "" })} />
            </>
          )}
        </div>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Ringkasan kegiatan">
          <ActivityChart rows={breakdown.data} />
        </aside>
      </div>
    </>
  );
}
