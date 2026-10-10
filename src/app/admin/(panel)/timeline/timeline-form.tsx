"use client";

import type { ActionState } from "@/lib/action";
import type { TimelineItem } from "@/lib/data";
import { AdminForm, ImageField, TextArea, TextField } from "@/components/admin/form";

export function TimelineForm({ action, item, imageUrl }: { action: (p: ActionState, f: FormData) => Promise<ActionState>; item?: TimelineItem; imageUrl?: string | null }) {
  return (
    <AdminForm action={action} submitLabel={item ? "Simpan perubahan" : "Tambah ke timeline"}>
      <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
        <TextField name="date" label="Tanggal" type="date" required defaultValue={item?.date} />
        <TextField name="title" label="Judul" required defaultValue={item?.title} maxLength={160} />
      </div>
      <TextField name="category" label="Kategori" defaultValue={item?.category ?? "pencapaian"} maxLength={40} hint="mis. pencapaian, debut, konser" />
      <TextArea name="description" label="Deskripsi" rows={5} defaultValue={item?.description} hint="Mendukung Markdown sederhana." />
      <TextField name="link_url" label="Tautan sumber" type="url" defaultValue={item?.link_url} placeholder="https://" />
      <ImageField name="image" label="Gambar (opsional)" currentUrl={imageUrl} />
    </AdminForm>
  );
}
