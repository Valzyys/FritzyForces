"use client";

import type { ActionState } from "@/lib/action";
import { EVENT_CATEGORIES, EVENT_STATUS } from "@/lib/constants";
import type { EventRow } from "@/lib/data";
import { AdminForm, SelectField, TextArea, TextField } from "@/components/admin/form";

export function EventForm({
  action,
  event,
  startsLocal,
  endsLocal,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  event?: EventRow;
  startsLocal?: string;
  endsLocal?: string;
}) {
  return (
    <AdminForm action={action} submitLabel={event ? "Simpan perubahan" : "Tambah jadwal"}>
      <TextField name="title" label="Judul" required defaultValue={event?.title} maxLength={160} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField name="category" label="Kategori" options={EVENT_CATEGORIES} defaultValue={event?.category ?? "theater"} hint="Kategori Live hanya tampil di dashboard admin." />
        <SelectField name="status" label="Status" options={EVENT_STATUS} defaultValue={event?.status ?? "scheduled"} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="starts_at" label="Mulai (WIB)" type="datetime-local" required defaultValue={startsLocal} />
        <TextField name="ends_at" label="Selesai (WIB)" type="datetime-local" defaultValue={endsLocal} hint="Opsional" />
      </div>
      <TextField name="location" label="Lokasi" defaultValue={event?.location} maxLength={120} placeholder="mis. JKT48 Theater" />
      <TextArea name="description" label="Keterangan" rows={4} defaultValue={event?.description} maxLength={2000} />
      <TextField name="url" label="Tautan info / tiket" type="url" defaultValue={event?.url} placeholder="https://" />
    </AdminForm>
  );
}
