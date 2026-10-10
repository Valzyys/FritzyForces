import { notFound } from "next/navigation";
import { first } from "@/lib/db";
import type { EventRow } from "@/lib/data";
import { isoToWibLocal } from "@/lib/time";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { saveEvent } from "../actions";
import { EventForm } from "../event-form";

export const metadata = { title: "Ubah jadwal" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await first<EventRow>("SELECT * FROM events WHERE id = ?", id);
  if (!event) notFound();
  return (
    <>
      <AdminPageHeader
        title="Ubah jadwal"
        back={{ href: "/admin/jadwal", label: "Jadwal" }}
        description={event.source === "jkt48connect" ? "Jadwal ini berasal dari sinkronisasi JKT48Connect. Judul, waktu, dan gambar akan diperbarui lagi saat sinkronisasi; keterangan & tautan tetap." : undefined}
      />
      <Panel>
        <EventForm action={saveEvent.bind(null, id)} event={event} startsLocal={isoToWibLocal(event.starts_at)} endsLocal={isoToWibLocal(event.ends_at)} />
      </Panel>
    </>
  );
}
