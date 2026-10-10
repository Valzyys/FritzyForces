import { all, first } from "@/lib/db";
import type { Activity } from "@/lib/data";
import { DEFAULT_RECAP_TABS } from "@/lib/sync/recap";
import { formatDate } from "@/lib/time";
import { ConfirmButton, QuickAction } from "@/components/admin/confirm";
import { AdminPageHeader, DataTable, Panel, Td } from "@/components/admin/ui";
import { Badge, FilterChips, Pagination, pageParam, strParam } from "@/components/ui";
import { runRecapSync } from "../sync-actions";
import { promoteActivity } from "../timeline/actions";
import { importCsv, saveTabConfig } from "./actions";
import { CsvImportForm, TabConfigForm } from "./forms";

export const metadata = { title: "Rekap kegiatan" };
const PER_PAGE = 40;

export default async function AdminActivitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const page = pageParam(sp.hal);
  const [years, types, tabSetting] = await Promise.all([
    all<{ y: string }>("SELECT DISTINCT substr(date,1,4) AS y FROM activities ORDER BY y DESC"),
    all<{ type: string; n: number }>("SELECT type, COUNT(*) AS n FROM activities GROUP BY type ORDER BY n DESC"),
    first<{ value: string }>("SELECT value FROM settings WHERE key = 'recap_tabs'"),
  ]);
  const year = years.some((y) => y.y === strParam(sp.tahun)) ? strParam(sp.tahun) : "";
  const type = types.some((t) => t.type === strParam(sp.jenis)) ? strParam(sp.jenis) : "";
  const where: string[] = [];
  const params: string[] = [];
  if (year) {
    where.push("substr(date,1,4) = ?");
    params.push(year);
  }
  if (type) {
    where.push("type = ?");
    params.push(type);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [items, total] = await Promise.all([
    all<Activity>(`SELECT * FROM activities ${clause} ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`, ...params, PER_PAGE, (page - 1) * PER_PAGE),
    first<{ n: number }>(`SELECT COUNT(*) AS n FROM activities ${clause}`, ...params),
  ]);
  const qs = (o: Record<string, string>) => {
    const p = new URLSearchParams({ ...(year && { tahun: year }), ...(type && { jenis: type }), ...o });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `/admin/kegiatan?${s}` : "/admin/kegiatan";
  };

  return (
    <>
      <AdminPageHeader
        title="Rekap kegiatan"
        description='Data ini disalin otomatis dari sheet "Fritzy Rosmerian − Recap". Ubah datanya di Google Sheets, lalu sinkronkan.'
        action={<QuickAction action={runRecapSync} variant="primary">Sinkron sekarang</QuickAction>}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Impor manual dari CSV" description="Pakai ini bila sheet tidak dibagikan publik sehingga sinkron otomatis gagal.">
          <CsvImportForm action={importCsv} />
        </Panel>
        <Panel title="Konfigurasi tab">
          <TabConfigForm action={saveTabConfig} value={tabSetting ? (JSON.parse(tabSetting.value) as string) : DEFAULT_RECAP_TABS} />
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title={`${total?.n ?? 0} kegiatan`} description="Jenis live tidak ditampilkan di halaman publik. Tombol “Timeline” menyalin kegiatan sebagai kandidat pencapaian.">
          <div className="mb-5 space-y-3">
            <FilterChips label="Tahun" active={year} items={[{ label: "Semua", value: "", href: qs({ tahun: "", hal: "" }) }, ...years.map((y) => ({ label: y.y, value: y.y, href: qs({ tahun: y.y, hal: "" }) }))]} />
            <FilterChips label="Jenis" active={type} items={[{ label: "Semua", value: "", href: qs({ jenis: "", hal: "" }) }, ...types.map((t) => ({ label: `${t.type} (${t.n})`, value: t.type, href: qs({ jenis: t.type, hal: "" }) }))]} />
          </div>
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-soft">Belum ada data. Jalankan sinkronisasi atau impor CSV.</p>
          ) : (
            <DataTable head={["Tanggal", "Jenis", "Kegiatan", "Lokasi", ""]}>
              {items.map((a) => (
                <tr key={a.id}>
                  <Td className="whitespace-nowrap">{formatDate(a.date)}</Td>
                  <Td><Badge tone={/live/i.test(a.type) ? "solid" : "neutral"}>{a.type}</Badge></Td>
                  <Td>
                    <span className="font-medium">{a.title}</span>
                    {a.notes && <span className="block text-xs text-ink-faint">{a.notes}</span>}
                  </Td>
                  <Td className="text-ink-soft">{a.location}</Td>
                  <Td className="text-right">
                    <ConfirmButton
                      action={promoteActivity.bind(null, a.id)}
                      label="Timeline"
                      title="Tambahkan ke timeline?"
                      description="Kegiatan ini akan disalin sebagai entri timeline publik."
                      confirmLabel="Tambahkan"
                      variant="secondary"
                      icon={false}
                    />
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
          <Pagination page={page} total={total?.n ?? 0} perPage={PER_PAGE} href={(n) => qs({ hal: n > 1 ? String(n) : "" })} />
        </Panel>
      </div>
    </>
  );
}
