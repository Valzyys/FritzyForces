"use client";

import type { ActionState } from "@/lib/action";
import { AdminForm, TextField } from "@/components/admin/form";

type Act = (p: ActionState, f: FormData) => Promise<ActionState>;

export function CsvImportForm({ action }: { action: Act }) {
  return (
    <AdminForm action={action} submitLabel="Impor CSV" resetOnSuccess>
      <TextField name="tab" label="Nama tab" required placeholder="2026 atau Show Recap" hint="Isi tab dengan nama yang sama akan diganti seluruhnya." />
      <TextField name="file" label="File CSV" type="file" accept=".csv,text/csv" required hint="Google Sheets → File → Download → CSV (tab yang sedang dibuka)." />
    </AdminForm>
  );
}

export function TabConfigForm({ action, value }: { action: Act; value: string }) {
  return (
    <AdminForm action={action} submitLabel="Simpan konfigurasi">
      <TextField
        name="tabs"
        label="Tab yang disinkronkan"
        defaultValue={value}
        hint='Format "Nama:gid" dipisah koma. gid terlihat di URL sheet (…#gid=123). Tambahkan tab tahun baru di sini.'
      />
    </AdminForm>
  );
}
