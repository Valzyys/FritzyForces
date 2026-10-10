import type { Metadata } from "next";
import { CalendarX2 } from "lucide-react";
import { EVENT_CATEGORIES, PRIVATE_EVENT_CATEGORIES, listPublicEvents } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { EventTicket } from "@/components/content";
import { EmptyState, ErrorNotice, FilterChips, PageHeader, Pagination, pageParam, strParam } from "@/components/ui";

export const metadata: Metadata = {
  title: "Jadwal",
  description: "Jadwal teater, video call, off-air, dan event Fritzy JKT48 dalam zona waktu WIB.",
  alternates: { canonical: "/jadwal" },
};

const PER_PAGE = 12;
const PUBLIC_CATEGORIES = Object.entries(EVENT_CATEGORIES).filter(([k]) => !PRIVATE_EVENT_CATEGORIES.includes(k));

export default async function SchedulePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const when = strParam(sp.waktu) === "lalu" ? "past" : "upcoming";
  const category = PUBLIC_CATEGORIES.some(([k]) => k === strParam(sp.kategori)) ? strParam(sp.kategori) : "";
  const page = pageParam(sp.hal);
  const list = await safeQuery(() => listPublicEvents({ when, category, page, perPage: PER_PAGE }), { items: [], total: 0 });

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams({ ...(when === "past" && { waktu: "lalu" }), ...(category && { kategori: category }), ...over });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `/jadwal?${s}` : "/jadwal";
  };

  return (
    <>
      <PageHeader kicker="Jadwal" title="Kapan bisa ketemu Fritzy?" description="Semua waktu ditampilkan dalam WIB (UTC+7)." />
      <div className="shell py-10 [--ticket-bg:var(--color-paper)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <FilterChips
            label="Rentang waktu"
            active={when}
            items={[
              { label: "Akan datang", value: "upcoming", href: qs({ waktu: "", hal: "" }) },
              { label: "Sudah lewat", value: "past", href: qs({ waktu: "lalu", hal: "" }) },
            ]}
          />
          <FilterChips
            label="Kategori jadwal"
            active={category}
            items={[{ label: "Semua", value: "", href: qs({ kategori: "", hal: "" }) }, ...PUBLIC_CATEGORIES.map(([value, label]) => ({ label, value, href: qs({ kategori: value, hal: "" }) }))]}
          />
        </div>

        <div className="mt-8">
          {list.failed ? (
            <ErrorNotice />
          ) : list.data.items.length === 0 ? (
            <EmptyState title={when === "upcoming" ? "Belum ada jadwal yang diumumkan" : "Belum ada arsip jadwal"} icon={<CalendarX2 className="size-5" aria-hidden />}>
              {when === "upcoming" ? "Jadwal baru akan muncul di sini begitu diumumkan." : "Jadwal yang sudah lewat akan tersimpan di sini."}
            </EmptyState>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {list.data.items.map((e) => (
                  <EventTicket key={e.id} event={e} />
                ))}
              </div>
              <Pagination page={page} total={list.data.total} perPage={PER_PAGE} href={(n) => qs({ hal: n > 1 ? String(n) : "" })} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
