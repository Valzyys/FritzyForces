import { notFound } from "next/navigation";
import { first } from "@/lib/db";
import { getDisco } from "@/lib/data";
import { mediaUrl } from "@/lib/url";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { saveDisco } from "../actions";
import { DiscoForm } from "../disco-form";

export const metadata = { title: "Ubah diskografi" };

export default async function EditDiscoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await first<{ slug: string }>("SELECT slug FROM discography WHERE id = ?", id);
  const item = row ? await getDisco(row.slug) : null;
  if (!item) notFound();
  return (
    <>
      <AdminPageHeader title="Ubah diskografi" back={{ href: "/admin/diskografi", label: "Diskografi" }} />
      <Panel>
        <DiscoForm action={saveDisco.bind(null, id)} item={item} coverUrl={mediaUrl(item.cover_key)} />
      </Panel>
    </>
  );
}
