"use client";

import type { ActionState } from "@/lib/action";
import { DISCO_TYPES } from "@/lib/constants";
import type { Disco } from "@/lib/data";
import { pairsToText } from "@/lib/json";
import { AdminForm, CheckboxField, ImageField, SelectField, TextArea, TextField } from "@/components/admin/form";

export function DiscoForm({ action, item, coverUrl }: { action: (p: ActionState, f: FormData) => Promise<ActionState>; item?: Disco; coverUrl?: string | null }) {
  return (
    <AdminForm action={action} submitLabel={item ? "Simpan perubahan" : "Tambah entri"}>
      <TextField name="title" label="Judul" required defaultValue={item?.title} maxLength={160} />
      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField name="type" label="Tipe" options={DISCO_TYPES} defaultValue={item?.type ?? "single"} />
        <TextField name="release_date" label="Tanggal" type="date" defaultValue={item?.release_date ?? ""} />
        <TextField name="sort_order" label="Urutan" type="number" defaultValue={item?.sort_order ?? 0} hint="Angka kecil tampil lebih dulu." />
      </div>
      <TextField name="slug" label="Slug URL" defaultValue={item?.slug} hint="Kosongkan untuk dibuat otomatis dari judul." />
      <TextArea name="description" label="Deskripsi" rows={6} defaultValue={item?.description} hint="Mendukung Markdown: **tebal**, _miring_, [tautan](https://…), daftar." />
      <TextField name="video_url" label="URL video YouTube" type="url" defaultValue={item?.video_url} placeholder="https://youtu.be/…" />
      <TextArea name="links" label="Tautan lain" rows={3} defaultValue={item ? pairsToText(item.links) : ""} hint="Satu per baris: Label | https://…" />
      <ImageField name="cover" label="Sampul" currentUrl={coverUrl} />
      <CheckboxField name="featured" label="Tandai sebagai unggulan" defaultChecked={Boolean(item?.featured)} />
    </AdminForm>
  );
}
