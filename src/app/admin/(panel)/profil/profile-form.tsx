"use client";

import type { ActionState } from "@/lib/action";
import type { Profile } from "@/lib/data";
import { pairsToText } from "@/lib/json";
import { AdminForm, ImageField, TextArea, TextField } from "@/components/admin/form";

const COPY: Record<string, { image: string; jiko?: boolean; detailsHint: string; tagline: string }> = {
  fritzy: { image: "Foto profil (juga dipakai di beranda)", jiko: true, detailsHint: "Satu per baris: Label | Nilai. Contoh: Generasi | 12", tagline: "mis. JKT48 Generasi 12" },
  fanbase: { image: "Logo fanbase", detailsHint: "Satu per baris, mis. Berdiri | <tahun>", tagline: "Judul besar di halaman Tentang Kami" },
  esport: { image: "Foto tim / banner", detailsHint: "Satu per baris, mis. Game | <nama game>", tagline: "Judul besar di halaman Esport" },
};

export function ProfileForm({ action, profile, slug, imageUrl }: { action: (p: ActionState, f: FormData) => Promise<ActionState>; profile: Profile | null; slug: string; imageUrl: string | null }) {
  const c = COPY[slug];
  return (
    <AdminForm action={action} submitLabel="Simpan profil">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Nama" required defaultValue={profile?.name} maxLength={120} />
        <TextField name="tagline" label="Tagline" defaultValue={profile?.tagline} maxLength={160} hint={c.tagline} />
      </div>
      {c.jiko && <TextArea name="jiko" label="Jikoshoukai" rows={3} maxLength={600} defaultValue={profile?.jiko} hint="Tampil di hero beranda dan halaman profil. Tanpa hashtag." />}
      <TextArea name="summary" label="Ringkasan singkat" rows={3} maxLength={800} defaultValue={profile?.summary} />
      <TextArea name="body" label="Isi halaman" rows={14} defaultValue={profile?.body} hint="Markdown: ## Subjudul, **tebal**, daftar, [tautan](https://…)." className="[&_textarea]:font-mono [&_textarea]:text-sm" />
      <TextArea name="details" label="Rincian" rows={5} defaultValue={profile ? pairsToText(profile.details) : ""} hint={c.detailsHint} />
      <TextArea name="links" label="Tautan resmi" rows={4} defaultValue={profile ? pairsToText(profile.links) : ""} hint="Satu per baris: Label | https://… — hanya tautan yang terverifikasi." />
      <ImageField name="image" label={c.image} currentUrl={imageUrl} />
    </AdminForm>
  );
}
