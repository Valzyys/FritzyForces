import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/time";
import { mediaUrl } from "@/lib/url";
import { ConfirmButton } from "@/components/admin/confirm";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { addAdmin, changePassword, removeAdmin, saveSiteSettings } from "./actions";
import { AddAdminForm, ChangePasswordForm, SiteSettingsForm } from "./forms";

export const metadata = { title: "Pengaturan" };

export default async function AdminSettingsPage() {
  const me = await requireAdmin();
  const [settings, admins] = await Promise.all([
    getSettings(),
    all<{ id: string; name: string; email: string; last_login_at: string | null }>("SELECT id, name, email, last_login_at FROM admins ORDER BY created_at ASC"),
  ]);
  return (
    <>
      <AdminPageHeader title="Pengaturan" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Situs">
          <SiteSettingsForm action={saveSiteSettings} settings={settings} gameImageUrl={mediaUrl(settings.gameImageKey)} />
        </Panel>
        <div className="space-y-6">
          <Panel title="Admin" description="Semua admin memiliki akses penuh ke dashboard.">
            <ul className="divide-y divide-line">
              {admins.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {a.name} {a.id === me.id && <Badge>Kamu</Badge>}
                    </p>
                    <p className="truncate text-sm text-ink-faint">
                      {a.email} · {a.last_login_at ? `terakhir masuk ${formatDate(a.last_login_at)}` : "belum pernah masuk"}
                    </p>
                  </div>
                  {a.id !== me.id && <ConfirmButton action={removeAdmin.bind(null, a.id)} title={`Hapus admin ${a.name}?`} />}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line pt-6">
              <h3 className="mb-4 font-semibold">Tambah admin</h3>
              <AddAdminForm action={addAdmin} />
            </div>
          </Panel>
          <Panel title="Ganti password">
            <ChangePasswordForm action={changePassword} />
          </Panel>
        </div>
      </div>
    </>
  );
}
