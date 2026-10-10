import type { MetadataRoute } from "next";
import { all } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticPaths = ["", "/fritzy", "/diskografi", "/timeline", "/kegiatan", "/jadwal", "/berita", "/galeri", "/fanwall", "/games", "/tentang", "/esport"];
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({ url: `${base}${p}` }));
  try {
    const [posts, albums, disco] = await Promise.all([
      all<{ slug: string; updated_at: string }>(
        "SELECT slug, updated_at FROM posts WHERE status = 'published' AND published_at <= ?",
        new Date().toISOString(),
      ),
      all<{ slug: string }>("SELECT slug FROM albums WHERE published = 1"),
      all<{ slug: string; updated_at: string }>("SELECT slug, updated_at FROM discography"),
    ]);
    entries.push(
      ...posts.map((p) => ({ url: `${base}/berita/${p.slug}`, lastModified: p.updated_at })),
      ...albums.map((a) => ({ url: `${base}/galeri/${a.slug}` })),
      ...disco.map((d) => ({ url: `${base}/diskografi/${d.slug}`, lastModified: d.updated_at })),
    );
  } catch {
    /* tanpa database: sitemap tetap berisi halaman statis */
  }
  return entries;
}
