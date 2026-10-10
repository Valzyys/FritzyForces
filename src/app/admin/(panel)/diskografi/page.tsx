import Link from "next/link";
import { Plus } from "lucide-react";
import { DISCO_TYPES, listDiscography, listSetlistStats } from "@/lib/data";
import { formatDate } from "@/lib/time";
import { ConfirmButton } from "@/components/admin/confirm";
import { AdminPageHeader, DataTable, Flash, Panel, Td } from "@/components/admin/ui";
import { Badge, ButtonLink, strParam } from "@/components/ui";
import { deleteDisco } from "./actions";

export const metadata = { title: "Diskografi" };

export default async function AdminDiscoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const [items, setlists] = await Promise.all([listDiscography(), listSetlistStats()]);
  return (
    <>
      <AdminPageHeader
        title="Diskografi"
        description="Single, coupling, MV, special MV, performance, off-air, dan konten penting. Setlist teater dihitung otomatis dari Show Recap."
        action={
          <ButtonLink href="/admin/diskografi/baru" size="sm">
            <Plus className="size-4" aria-hidden /> Tambah
          </ButtonLink>
        }
      />
      <Flash show={strParam(sp.saved) === "1"}>Entri diskografi ditambahkan.</Flash>
      <div className="space-y-6">
        <Panel>
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-soft">Belum ada entri diskografi manual.</p>
          ) : (
            <DataTable head={["Judul", "Tipe", "Tanggal", ""]}>
              {items.map((d) => (
                <tr key={d.id}>
                  <Td>
                    <Link href={`/admin/diskografi/${d.id}`} className="font-semibold hover:text-plum-700">{d.title}</Link>
                    {d.featured ? <span className="ml-2"><Badge>Unggulan</Badge></span> : null}
                  </Td>
                  <Td>{DISCO_TYPES[d.type] ?? d.type}</Td>
                  <Td className="whitespace-nowrap text-ink-soft">{formatDate(d.release_date)}</Td>
                  <Td className="text-right"><ConfirmButton action={deleteDisco.bind(null, d.id)} /></Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
        <Panel title="Setlist otomatis" description="Dari tab Show Recap. Untuk mengubahnya, perbarui Google Sheets lalu sinkronkan di Rekap kegiatan.">
          {setlists.length === 0 ? (
            <p className="text-sm text-ink-soft">Belum ada data Show Recap.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {setlists.map((s) => (
                <li key={s.show}><Badge tone="neutral">{s.show} · {s.count} show</Badge></li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
