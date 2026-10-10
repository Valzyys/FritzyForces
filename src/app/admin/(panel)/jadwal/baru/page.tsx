import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { saveEvent } from "../actions";
import { EventForm } from "../event-form";

export const metadata = { title: "Tambah jadwal" };

export default function NewEventPage() {
  return (
    <>
      <AdminPageHeader title="Tambah jadwal" back={{ href: "/admin/jadwal", label: "Jadwal" }} />
      <Panel>
        <EventForm action={saveEvent.bind(null, null)} />
      </Panel>
    </>
  );
}
