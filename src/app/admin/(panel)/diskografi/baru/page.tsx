import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { saveDisco } from "../actions";
import { DiscoForm } from "../disco-form";

export const metadata = { title: "Tambah diskografi" };

export default function NewDiscoPage() {
  return (
    <>
      <AdminPageHeader title="Tambah diskografi" back={{ href: "/admin/diskografi", label: "Diskografi" }} />
      <Panel>
        <DiscoForm action={saveDisco.bind(null, null)} />
      </Panel>
    </>
  );
}
