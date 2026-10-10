import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader siteName={settings.siteName} />
      <main id="konten">{children}</main>
      <SiteFooter siteName={settings.siteName} tagline={settings.tagline} socials={settings.socials} />
    </>
  );
}
