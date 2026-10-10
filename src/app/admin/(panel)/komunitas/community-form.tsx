"use client";

import type { ActionState } from "@/lib/action";
import type { Community } from "@/lib/data";
import { AdminForm, ImageField, SelectField, TextArea, TextField } from "@/components/admin/form";

export function CommunityForm({ action, item, logoUrl }: { action: (p: ActionState, f: FormData) => Promise<ActionState>; item?: Community; logoUrl?: string | null }) {
  return (
    <AdminForm action={action} submitLabel={item ? "Simpan" : "Tambah"} resetOnSuccess={!item}>
      <TextField name="name" label="Nama" required defaultValue={item?.name} maxLength={120} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField name="kind" label="Jenis" options={{ komunitas: "Komunitas", aliansi: "Aliansi (bagian dari)" }} defaultValue={item?.kind ?? "komunitas"} />
        <TextField name="sort_order" label="Urutan" type="number" defaultValue={item?.sort_order ?? 0} />
      </div>
      <TextArea name="description" label="Deskripsi" rows={3} maxLength={600} defaultValue={item?.description} />
      <TextField name="url" label="Tautan" type="url" defaultValue={item?.url} placeholder="https://" />
      <ImageField name="logo" label="Logo" currentUrl={logoUrl} />
    </AdminForm>
  );
}
