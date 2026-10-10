import { notFound } from "next/navigation";
import { first } from "@/lib/db";
import type { TimelineItem } from "@/lib/data";
import { mediaUrl } from "@/lib/url";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { saveTimeline } from "../actions";
import { TimelineForm } from "../timeline-form";

export const metadata = { title: "Ubah timeline" };

export default async function EditTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await first<TimelineItem>("SELECT * FROM timeline WHERE id = ?", id);
  if (!item) notFound();
  return (
    <>
      <AdminPageHeader title="Ubah entri timeline" back={{ href: "/admin/timeline", label: "Timeline" }} />
      <Panel>
        <TimelineForm action={saveTimeline.bind(null, id)} item={item} imageUrl={mediaUrl(item.image_key)} />
      </Panel>
    </>
  );
}
