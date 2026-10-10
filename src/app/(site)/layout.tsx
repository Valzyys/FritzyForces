import { SiteHeader, type Announcement } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EMPTY_CHROME, getSiteChrome } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDate, formatTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, chrome] = await Promise.all([getSettings(), safeQuery(() => getSiteChrome(), EMPTY_CHROME)]);
  const show = chrome.data.nextShow;
  const latest = chrome.data.tickerItems[0];
  const announcement: Announcement = show
    ? { label: "Teater berikutnya", text: `${show.title} · ${formatDate(show.starts_at)}, ${formatTime(show.starts_at)}`, href: "/jadwal" }
    : latest
      ? { label: "Kegiatan terbaru", text: latest.label, href: "/kegiatan" }
      : null;
  return (
    <>
      <SiteHeader siteName={settings.siteName} announcement={announcement} />
      <main id="konten">{children}</main>
      <SiteFooter
        siteName={settings.siteName}
        tagline={settings.tagline}
        socials={settings.socials}
        nextShow={show}
        setlists={chrome.data.setlists}
      />
    </>
  );
}
