"use client";

import type { ActionState } from "@/lib/action";
import type { Album } from "@/lib/data";
import { AdminForm, CheckboxField, SelectField, TextArea, TextField } from "@/components/admin/form";

export function AlbumForm({ action, album }: { action: (p: ActionState, f: FormData) => Promise<ActionState>; album?: Album }) {
  return (
    <AdminForm action={action} submitLabel={album ? "Simpan album" : "Buat album"}>
      <TextField name="title" label="Judul album" required defaultValue={album?.title} maxLength={160} placeholder="mis. Project 100 Show" />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField name="kind" label="Jenis" options={{ project: "Project FF", kegiatan: "Kegiatan ZyFriends" }} defaultValue={album?.kind ?? "project"} />
        <TextField name="date" label="Tanggal" type="date" defaultValue={album?.date ?? ""} />
      </div>
      <TextField name="slug" label="Slug URL" defaultValue={album?.slug} hint="Kosongkan untuk dibuat otomatis." />
      <TextArea name="description" label="Deskripsi" rows={3} defaultValue={album?.description} maxLength={2000} />
      <CheckboxField name="published" label="Tampilkan di situs" defaultChecked={album ? Boolean(album.published) : true} />
    </AdminForm>
  );
}
