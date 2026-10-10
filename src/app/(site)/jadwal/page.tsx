import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarX2, Ticket } from "lucide-react";
import { EVENT_CATEGORIES, PRIVATE_EVENT_CATEGORIES, eventDaysInMonth, getNextTheaterShow, listPublicEvents } from "@/lib/data";
import { parseJsonArray } from "@/lib/json";
import { all, safeQuery } from "@/lib/db";
import { formatDate, formatTime, formatWeekday, todayWib } from "@/lib/time";
import { Countdown } from "@/components/countdown";
import { EventTicket } from "@/components/content";
import { MonthCalendar } from "@/components/month-calendar";
import { ErrorNotice, FilterChips, PageHeader, Pagination, StatStrip, pageParam, strParam } from "@/components/ui";

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
  const today = todayWib();
  const [list, nextShow, calendar, perCategory, lastShows] = await Promise.all([
    safeQuery(() => listPublicEvents({ when, category, page, perPage: PER_PAGE }), { items: [], total: 0 }),
    safeQuery(() => getNextTheaterShow(), null),
    safeQuery(() => eventDaysInMonth(Number(today.slice(0, 4)), Number(today.slice(5, 7))), []),
    safeQuery(
      () =>
        all<{ category: string; n: number }>(
          `SELECT category, COUNT(*) AS n FROM events WHERE category NOT IN (${PRIVATE_EVENT_CATEGORIES.map(() => "?").join(",")}) AND starts_at >= ? GROUP BY category`,
          ...PRIVATE_EVENT_CATEGORIES,
          new Date().toISOString(),
        ),
      [],
    ),
    safeQuery(
      () => all<{ date: string; show: string; show_count: number | null; unit_songs: string }>("SELECT date, show, show_count, unit_songs FROM show_recaps ORDER BY date DESC LIMIT 6"),
      [],
    ),
  ]);
  const upcomingTotal = perCategory.data.reduce((a, b) => a + b.n, 0);

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams({ ...(when === "past" && { waktu: "lalu" }), ...(category && { kategori: category }), ...over });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `/jadwal?${s}` : "/jadwal";
  };

  return (
    <>
      <PageHeader
        kicker="Jadwal"
        title="Kapan bisa ketemu Fritzy?"
        description="Teater, video call, off-air, dan event — semua waktu dalam WIB (UTC+7)."
        aside={
          <StatStrip
            items={[
              { value: upcomingTotal, label: "Jadwal mendatang" },
              { value: perCategory.data.find((c) => c.category === "theater")?.n ?? 0, label: "Show teater" },
              { value: calendar.data.length, label: "Hari berjadwal bulan ini" },
            ]}
          />
        }
      />
      <div className="shell grid grid-cols-1 gap-8 py-10 [--ticket-bg:var(--color-paper)] lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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

          <div className="mt-6">
            {list.failed ? (
              <ErrorNotice />
            ) : list.data.items.length === 0 ? (
              <div className="ticket bg-stripes flex flex-col items-start gap-3 p-8">
                <CalendarX2 className="size-8 text-plum-500" aria-hidden />
                <p className="font-display text-2xl font-bold">{when === "upcoming" ? "Belum ada jadwal yang diumumkan" : "Belum ada arsip jadwal"}</p>
                <p className="max-w-md text-ink-soft">
                  {when === "upcoming" ? "Jadwal baru muncul di sini begitu diumumkan. Sementara itu, intip arsip atau rekap kegiatan Fritzy." : "Jadwal yang sudah lewat akan tersimpan di sini."}
                </p>
                <div className="flex gap-4 text-sm font-bold text-plum-700">
                  <Link href="/jadwal?waktu=lalu" className="hover:text-plum-900">Arsip jadwal →</Link>
                  <Link href="/kegiatan" className="hover:text-plum-900">Rekap kegiatan →</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {list.data.items.map((e) => (
                    <EventTicket key={e.id} event={e} />
                  ))}
                </div>
                <Pagination page={page} total={list.data.total} perPage={PER_PAGE} href={(n) => qs({ hal: n > 1 ? String(n) : "" })} />
              </>
            )}
          </div>

          {lastShows.data.length > 0 && (
            <section aria-labelledby="show-terakhir" className="mt-12">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="kicker">Dari rekap</p>
                  <h2 id="show-terakhir" className="mt-2 text-2xl font-bold">Show teater terakhir yang tercatat</h2>
                </div>
                <Link href="/diskografi" className="text-sm font-bold text-plum-700 hover:text-plum-900">Diskografi →</Link>
              </div>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {lastShows.data.map((s) => {
                  const units = parseJsonArray<string>(s.unit_songs);
                  return (
                    <li key={`${s.date}-${s.show}`} className="relative overflow-hidden rounded-2xl bg-mist p-4 ring-1 ring-line">
                      <span aria-hidden className="absolute -right-2 -bottom-4 font-display text-6xl font-extrabold text-plum-100 tabular-nums">#{s.show_count ?? ""}</span>
                      <p className="relative text-xs font-bold uppercase tracking-[0.12em] text-plum-700">{formatDate(s.date)}</p>
                      <p className="relative mt-1 font-display text-lg font-bold">{s.show}</p>
                      {units[0] && <p className="relative mt-1 line-clamp-2 text-sm text-ink-soft">{units.join(" · ")}</p>}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Ringkasan jadwal">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-plum-950 p-5 text-white">
            <div aria-hidden className="bg-dots absolute inset-0 [--dot-color:rgb(255_255_255/0.08)]" />
            <p className="relative flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-plum-300">
              <Ticket className="size-3.5" aria-hidden /> Teater berikutnya
            </p>
            {nextShow.data ? (
              <div className="relative">
                <p className="mt-2 font-display text-xl font-bold leading-tight">{nextShow.data.title}</p>
                <p className="mt-1 mb-4 text-sm text-plum-200">
                  {formatWeekday(nextShow.data.starts_at)}, {formatDate(nextShow.data.starts_at)} · {formatTime(nextShow.data.starts_at)}
                </p>
                <div className="[&_[role=timer]]:gap-1.5 [&_span.block:first-child]:text-2xl">
                  <Countdown target={nextShow.data.starts_at} />
                </div>
              </div>
            ) : (
              <p className="relative mt-2 text-plum-100">Belum ada show teater yang dijadwalkan.</p>
            )}
          </div>
          <MonthCalendar year={Number(today.slice(0, 4))} month={Number(today.slice(5, 7))} today={today} days={calendar.data} />
          <div className="rounded-2xl bg-mist p-4 ring-1 ring-line">
            <p className="text-sm font-bold text-ink">Per kategori (mendatang)</p>
            <ul className="mt-3 space-y-2">
              {PUBLIC_CATEGORIES.map(([value, label]) => {
                const n = perCategory.data.find((c) => c.category === value)?.n ?? 0;
                const pct = upcomingTotal ? (n / upcomingTotal) * 100 : 0;
                return (
                  <li key={value}>
                    <Link href={qs({ kategori: value, waktu: "", hal: "" })} className="block text-sm hover:text-plum-800">
                      <span className="flex justify-between"><span className="font-medium">{label}</span><span className="font-bold tabular-nums">{n}</span></span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-plum-100"><span className="block h-full rounded-full bg-plum-600" style={{ width: `${pct}%` }} /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <Link href="/kegiatan" className="group flex items-center justify-between rounded-2xl bg-white p-4 text-sm font-bold text-plum-800 ring-1 ring-line hover:ring-plum-300">
            Lihat rekap kegiatan Fritzy <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </aside>
      </div>
    </>
  );
}
