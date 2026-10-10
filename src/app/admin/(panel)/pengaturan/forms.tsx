"use client";

import type { ActionState } from "@/lib/action";
import type { SiteSettings } from "@/lib/settings";
import { pairsToText } from "@/lib/json";
import { AdminForm, CheckboxField, ImageField, TextArea, TextField } from "@/components/admin/form";

type Act = (p: ActionState, f: FormData) => Promise<ActionState>;

export function SiteSettingsForm({ action, settings, gameImageUrl }: { action: Act; settings: SiteSettings; gameImageUrl: string | null }) {
  return (
    <AdminForm action={action}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="site_name" label="Nama situs" required defaultValue={settings.siteName} maxLength={60} />
        <TextField name="tagline" label="Tagline" defaultValue={settings.tagline} maxLength={160} hint="Tampil di hero beranda & footer." />
      </div>
      <TextArea name="explore_intro" label="Teks Eksplorasi komunitas (beranda)" rows={3} maxLength={400} defaultValue={settings.exploreIntro} hint="Kosongkan untuk memakai teks bawaan." />
      <TextArea name="socials" label="Media sosial Fritzy Force" rows={4} defaultValue={pairsToText(settings.socials)} hint="Satu per baris: Instagram | https://instagram.com/…" />
      <CheckboxField name="fanwall_moderation" label="Moderasi fanwall" hint="Jika aktif, pesan baru harus disetujui admin sebelum tampil." defaultChecked={settings.fanwallModeration} />
      <ImageField name="game_image" label="Gambar puzzle (Games)" currentUrl={gameImageUrl} hint="Sebaiknya persegi. Jika kosong, memakai foto profil Fritzy." />
    </AdminForm>
  );
}

export function AddAdminForm({ action }: { action: Act }) {
  return (
    <AdminForm action={action} submitLabel="Tambah admin" resetOnSuccess>
      <TextField name="name" label="Nama" required maxLength={60} />
      <TextField name="email" label="Email" type="email" required autoComplete="off" />
      <TextField name="password" label="Password awal" type="password" required autoComplete="new-password" hint="Minimal 12 karakter. Minta admin baru menggantinya setelah masuk." />
    </AdminForm>
  );
}

export function ChangePasswordForm({ action }: { action: Act }) {
  return (
    <AdminForm action={action} submitLabel="Ganti password" resetOnSuccess>
      <TextField name="current" label="Password saat ini" type="password" required autoComplete="current-password" />
      <TextField name="next" label="Password baru" type="password" required autoComplete="new-password" />
      <TextField name="confirm" label="Ulangi password baru" type="password" required autoComplete="new-password" />
    </AdminForm>
  );
}
