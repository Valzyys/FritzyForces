import Link from "next/link";
import { Plus } from "lucide-react";
import { all, first } from "@/lib/db";
import { EVENT_CATEGORIES, EVENT_STATUS, type EventRow } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/time";
import { ConfirmButton, QuickAction } from "@/components/admin/confirm";
import { AdminPageHeader, DataTable, Flash, Panel, Td } from "@/components/admin/ui";
import { Badge, ButtonLink, FilterChips, Pagination, pageParam, strParam } from "@/components/ui";
import { runTheaterSync } from "../sync-actions";
import { deleteEvent } from "./actions";

const PER_PAGE = 25;

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const page = pageParam(sp.hal);
  const when = ["upcoming", "past", "all"].includes(strParam(sp.waktu)) ? strParam(sp.waktu) : "upcoming";
  const category = strParam(sp.kategori) in EVENT_CATEGORIES ? strParam(sp.kategori) : "";
  const now = new Date().toISOString();
  const where: string[] = [];
  const params: string[] = [];
  if (when === "upcoming") {
    where.push("starts_at >= ?");
    params.push(now);
  }
  if (when === "past") {
    where.push("starts_at < ?");
    params.push(now);
  }
  if (category) {
    where.push("category = ?");
    params.push(category);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [items, total] = await Promise.all([
    all<EventRow>(`SELECT * FROM events ${clause} ORDER BY starts_at ${when === "upcoming" ? "ASC" : "DESC"} LIMIT ? OFFSET ?`, ...params, PER_PAGE, (page - 1) * PER_PAGE),
    first<{ n: number }>(`SELECT COUNT(*) AS n FROM events ${clause}`, ...params),
  ]);
  const qs = (o: Record<string, string>) => {
    const p = new URLSearchParams({ waktu: when, ...(category && { kategori: category }), ...o });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    return `/admin/jadwal?${p}`;
  };

  return (
    <>
      <AdminPageHeader
        title="Jadwal"
        description="Teater dengan Fritzy disinkronkan otomatis dari JKT48Connect. Video call, off-air, dan event lain bisa ditambahkan manual."
        action={
          <div className="flex gap-2">
            <QuickAction action={runTheaterSync}>Sinkron teater</QuickAction>
            <ButtonLink href="/admin/jadwal/baru" size="sm">
              <Plus className="size-4" aria-hidden /> Tambah
            </ButtonLink>
          </div>
        }
      />
      <Flash show={strParam(sp.saved) === "1"}>Jadwal ditambahkan.</Flash>
      <Panel>
        <div className="mb-5 space-y-3">
          <FilterChips
            label="Waktu"
            active={when}
            items={[
              { label: "Mendatang", value: "upcoming", href: qs({ waktu: "upcoming", hal: "" }) },
              { label: "Lewat", value: "past", href: qs({ waktu: "past", hal: "" }) },
              { label: "Semua", value: "all", href: qs({ waktu: "all", hal: "" }) },
            ]}
          />
          <FilterChips
            label="Kategori"
            active={category}
            items={[{ label: "Semua", value: "", href: qs({ kategori: "", hal: "" }) }, ...Object.entries(EVENT_CATEGORIES).map(([v, l]) => ({ label: l, value: v, href: qs({ kategori: v, hal: "" }) }))]}
          />
        </div>
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-soft">Tidak ada jadwal untuk filter ini.</p>
        ) : (
          <DataTable head={["Waktu (WIB)", "Judul", "Kategori", "Sumber", ""]}>
            {items.map((e) => (
              <tr key={e.id}>
                <Td className="whitespace-nowrap">
                  {formatDate(e.starts_at)}
                  <span className="block text-xs text-ink-faint">{formatTime(e.starts_at)}</span>
                </Td>
                <Td>
                  <Link href={`/admin/jadwal/${e.id}`} className="font-semibold text-ink hover:text-plum-700">
                    {e.title}
                  </Link>
                  {e.status !== "scheduled" && (
                    <span className="ml-2">
                      <Badge tone={e.status === "cancelled" ? "danger" : "warning"}>{EVENT_STATUS[e.status]}</Badge>
                    </span>
                  )}
                </Td>
                <Td>
                  <Badge tone={e.category === "live" ? "solid" : "plum"}>{EVENT_CATEGORIES[e.category] ?? e.category}</Badge>
                </Td>
                <Td className="text-ink-faint">{e.source === "jkt48connect" ? "Otomatis" : "Manual"}</Td>
                <Td className="text-right">
                  <ConfirmButton action={deleteEvent.bind(null, e.id)} title="Hapus jadwal ini?" description={e.source === "jkt48connect" ? "Jadwal otomatis bisa muncul lagi saat sinkronisasi berikutnya." : undefined} />
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
        <Pagination page={page} total={total?.n ?? 0} perPage={PER_PAGE} href={(n) => qs({ hal: n > 1 ? String(n) : "" })} />
      </Panel>
    </>
  );
}
