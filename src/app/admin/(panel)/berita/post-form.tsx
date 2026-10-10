"use client";

import type { ActionState } from "@/lib/action";
import { POST_CATEGORIES } from "@/lib/constants";
import type { Post } from "@/lib/data";
import { AdminForm, ImageField, SelectField, TextArea, TextField } from "@/components/admin/form";

export function PostForm({
  action,
  post,
  coverUrl,
  publishedLocal,
}: {
  action: (p: ActionState, f: FormData) => Promise<ActionState>;
  post?: Post;
  coverUrl?: string | null;
  publishedLocal?: string;
}) {
  return (
    <AdminForm action={action} submitLabel={post ? "Simpan" : "Buat berita"}>
      <TextField name="title" label="Judul" required defaultValue={post?.title} maxLength={200} />
      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField name="category" label="Kategori" options={POST_CATEGORIES} defaultValue={post?.category ?? "berita"} />
        <SelectField name="status" label="Status" options={{ draft: "Draf", published: "Terbit" }} defaultValue={post?.status ?? "draft"} />
        <TextField name="published_at" label="Tanggal terbit (WIB)" type="datetime-local" defaultValue={publishedLocal} hint="Kosongkan = saat diterbitkan." />
      </div>
      <TextField name="slug" label="Slug URL" defaultValue={post?.slug} hint="Kosongkan untuk dibuat otomatis dari judul." />
      <TextArea name="excerpt" label="Ringkasan" rows={2} maxLength={400} defaultValue={post?.excerpt} hint="Tampil di daftar berita dan pratinjau media sosial." />
      <TextArea name="body" label="Isi" rows={16} defaultValue={post?.body} hint="Markdown: ## Subjudul, **tebal**, _miring_, [tautan](https://…), - daftar, > kutipan." className="[&_textarea]:font-mono [&_textarea]:text-sm" />
      <ImageField name="cover" label="Gambar sampul" currentUrl={coverUrl} />
    </AdminForm>
  );
}
