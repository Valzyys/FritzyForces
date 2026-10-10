import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { saveTimeline } from "../actions";
import { TimelineForm } from "../timeline-form";

export const metadata = { title: "Tambah timeline" };

export default function NewTimelinePage() {
  return (
    <>
      <AdminPageHeader title="Tambah entri timeline" back={{ href: "/admin/timeline", label: "Timeline" }} />
      <Panel>
        <TimelineForm action={saveTimeline.bind(null, null)} />
      </Panel>
    </>
  );
}
