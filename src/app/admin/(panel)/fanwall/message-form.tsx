"use client";

import type { ActionState } from "@/lib/action";
import type { FanMessage } from "@/lib/data";
import { NOTE_THEMES } from "@/components/fan-note";
import { AdminForm, SelectField, TextArea, TextField } from "@/components/admin/form";

export function MessageForm({ action, message }: { action: (p: ActionState, f: FormData) => Promise<ActionState>; message?: FanMessage }) {
  return (
    <AdminForm action={action} submitLabel={message ? "Simpan" : "Tambah pesan"} resetOnSuccess={!message}>
      <TextField name="name" label="Nama" required defaultValue={message?.name} maxLength={40} />
      <TextArea name="message" label="Pesan" required rows={4} defaultValue={message?.message} maxLength={500} />
      <SelectField name="theme" label="Warna kartu" options={Object.fromEntries(Object.entries(NOTE_THEMES).map(([k, v]) => [k, v.label]))} defaultValue={message?.theme ?? "lilac"} />
    </AdminForm>
  );
}
