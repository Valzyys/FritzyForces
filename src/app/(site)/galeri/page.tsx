import type { Metadata } from "next";
import Link from "next/link";
import { Images } from "lucide-react";
import { listAlbums } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { formatDate } from "@/lib/time";
import { mediaUrl } from "@/lib/url";
import { ErrorNotice, FilterChips, PageHeader, StatStrip, strParam } from "@/components/ui";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Dokumentasi project Fritzy Force dan kegiatan ZyFriends yang berkesan.",
  alternates: { canonical: "/galeri" },
};

const KINDS: Record<string, string> = { project: "Project FF", kegiatan: "Kegiatan ZyFriends" };

export default async function GalleryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const kind = strParam(sp.jenis) in KINDS ? strParam(sp.jenis) : "";
  const albums = await safeQuery(() => listAlbums({ publishedOnly: true }), []);
  const shown = albums.data.filter((a) => !kind || a.kind === kind);

  return (
    <>
      <PageHeader
        kicker="Galeri"
        title="Momen yang kami abadikan"
        description="Bukan arsip semua foto — hanya project Fritzy Force dan kegiatan ZyFriends yang paling berkesan."
        aside={
          <StatStrip
            items={[
              { value: albums.data.length, label: "Album" },
              { value: albums.data.reduce((a, b) => a + b.photo_count, 0), label: "Foto" },
              { value: albums.data.filter((a) => a.kind === "project").length, label: "Project FF" },
            ]}
          />
        }
      />
      <div className="shell py-10">
        <FilterChips
          label="Jenis album"
          active={kind}
          items={[{ label: "Semua album", value: "", href: "/galeri" }, ...Object.entries(KINDS).map(([value, label]) => ({ label, value, href: `/galeri?jenis=${value}` }))]}
        />
        <div className="mt-10">
          {albums.failed ? (
            <ErrorNotice />
          ) : shown.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {["STS", "100 Show", "Kegiatan ZyFriends"].map((t, i) => (
                <div key={t} className={`bg-stripes flex aspect-[4/3] flex-col justify-end rounded-[1.5rem] p-6 ring-1 ${i === 0 ? "bg-plum-600 text-white ring-plum-700 [--stripe-color:rgb(255_255_255/0.08)]" : "bg-mist ring-line"}`}>
                  <Images className="size-7 opacity-70" aria-hidden />
                  <p className="mt-3 font-display text-xl font-bold">{t}</p>
                  <p className="text-sm opacity-80">Dokumentasi segera diunggah</p>
                </div>
              ))}
            </div>
          ) : (
            <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((a) => {
                const cover = mediaUrl(a.cover_key);
                return (
                  <li key={a.id}>
                    <Link href={`/galeri/${a.slug}`} className="group block">
                      <div className="relative aspect-[4/3]">
                        <div aria-hidden className="absolute inset-0 translate-x-2 -translate-y-2 rounded-[var(--radius-card)] bg-plum-100 transition-transform group-hover:translate-x-3 group-hover:-translate-y-3" />
                        <div className="relative size-full overflow-hidden rounded-[var(--radius-card)] bg-plum-50 ring-1 ring-line">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cover} alt="" loading="lazy" className="size-full object-cover" />
                          ) : (
                            <div className="grid size-full place-items-center">
                              <Images className="size-10 text-plum-200" aria-hidden />
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-plum-700">{KINDS[a.kind] ?? a.kind}</p>
                      <h2 className="mt-1 font-display text-xl font-semibold text-ink group-hover:text-plum-800">{a.title}</h2>
                      <p className="mt-0.5 text-sm text-ink-faint">
                        {a.date ? `${formatDate(a.date)} · ` : ""}
                        {a.photo_count} foto
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
