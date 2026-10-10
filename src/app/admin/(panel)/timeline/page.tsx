import Link from "next/link";
import { Plus } from "lucide-react";
import { listTimeline } from "@/lib/data";
import { formatDate } from "@/lib/time";
import { ConfirmButton } from "@/components/admin/confirm";
import { AdminPageHeader, DataTable, Flash, Panel, Td } from "@/components/admin/ui";
import { ButtonLink, strParam } from "@/components/ui";
import { deleteTimeline } from "./actions";

export const metadata = { title: "Timeline" };

export default async function AdminTimelinePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const items = await listTimeline();
  return (
    <>
      <AdminPageHeader
        title="Timeline"
        description="Kurasi pencapaian yang tampil di halaman Timeline. Entri bisa dibuat manual atau diambil dari Rekap kegiatan."
        action={
          <ButtonLink href="/admin/timeline/baru" size="sm">
            <Plus className="size-4" aria-hidden /> Tambah
          </ButtonLink>
        }
      />
      <Flash show={strParam(sp.saved) === "1"}>Entri timeline ditambahkan.</Flash>
      <Panel>
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-soft">Belum ada entri timeline.</p>
        ) : (
          <DataTable head={["Tanggal", "Judul", "Kategori", ""]}>
            {[...items].reverse().map((t) => (
              <tr key={t.id}>
                <Td className="whitespace-nowrap">{formatDate(t.date)}</Td>
                <Td>
                  <Link href={`/admin/timeline/${t.id}`} className="font-semibold hover:text-plum-700">{t.title}</Link>
                </Td>
                <Td className="text-ink-soft">{t.category}</Td>
                <Td className="text-right">
                  <ConfirmButton action={deleteTimeline.bind(null, t.id)} />
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
