"use client";

import type { ActionState } from "@/lib/action";
import { AdminForm, TextField } from "@/components/admin/form";
import { ConfirmButton } from "@/components/admin/confirm";

export function PhotoCard({
  src,
  alt,
  caption,
  saveAction,
  deleteAction,
}: {
  src: string;
  alt: string;
  caption: string;
  saveAction: (p: ActionState, f: FormData) => Promise<ActionState>;
  deleteAction: () => Promise<ActionState>;
}) {
  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt || "Foto galeri"} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      <div className="p-4">
        <AdminForm action={saveAction} submitLabel="Simpan" className="space-y-3 [&>div:last-child]:pt-3">
          <TextField name="alt" label="Teks alternatif" defaultValue={alt} maxLength={200} hint="Deskripsikan isi foto untuk pembaca layar." />
          <TextField name="caption" label="Keterangan" defaultValue={caption} maxLength={300} />
        </AdminForm>
        <div className="mt-3 flex justify-end">
          <ConfirmButton action={deleteAction} title="Hapus foto ini?" />
        </div>
      </div>
    </li>
  );
}
