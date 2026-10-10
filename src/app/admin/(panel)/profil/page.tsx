import { getProfile } from "@/lib/data";
import { mediaUrl } from "@/lib/url";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { FilterChips, strParam } from "@/components/ui";
import { saveProfile } from "./actions";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profil" };

const TABS = { fritzy: "Profil Fritzy", fanbase: "Tentang Fritzy Force", esport: "Esport" } as const;

export default async function AdminProfilePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const slug = (strParam(sp.p) in TABS ? strParam(sp.p) : "fritzy") as keyof typeof TABS;
  const profile = await getProfile(slug);
  return (
    <>
      <AdminPageHeader title="Profil" description="Kelola isi halaman Profil Fritzy, Tentang Kami, dan Esport. Gunakan hanya informasi yang terverifikasi." />
      <div className="mb-6">
        <FilterChips label="Pilih profil" active={slug} items={Object.entries(TABS).map(([v, l]) => ({ label: l, value: v, href: `/admin/profil?p=${v}` }))} />
      </div>
      <Panel title={TABS[slug]}>
        <ProfileForm key={slug} slug={slug} profile={profile} imageUrl={mediaUrl(profile?.image_key)} action={saveProfile.bind(null, slug)} />
      </Panel>
    </>
  );
}
