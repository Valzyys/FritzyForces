import { listCommunities } from "@/lib/data";
import { mediaUrl } from "@/lib/url";
import { ConfirmButton } from "@/components/admin/confirm";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { deleteCommunity, saveCommunity } from "./actions";
import { CommunityForm } from "./community-form";

export const metadata = { title: "Komunitas" };

export default async function AdminCommunitiesPage() {
  const items = await listCommunities();
  return (
    <>
      <AdminPageHeader title="Komunitas & aliansi" description="Tampil di halaman Tentang Kami. Aliansi muncul di bagian “Bagian dari”." />
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Panel>
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-soft">Belum ada data.</p>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((c) => (
                <li key={c.id} className="py-4 first:pt-0">
                  <details>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                        <span className="font-semibold">{c.name}</span>
                        <Badge tone={c.kind === "aliansi" ? "solid" : "plum"}>{c.kind === "aliansi" ? "Aliansi" : "Komunitas"}</Badge>
                      </span>
                      <span className="text-sm font-semibold text-plum-700">Ubah</span>
                    </summary>
                    <div className="mt-4 space-y-4">
                      <CommunityForm action={saveCommunity.bind(null, c.id)} item={c} logoUrl={mediaUrl(c.logo_key)} />
                      <ConfirmButton action={deleteCommunity.bind(null, c.id)} title={`Hapus ${c.name}?`} />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Tambah">
          <CommunityForm action={saveCommunity.bind(null, null)} />
        </Panel>
      </div>
    </>
  );
}
