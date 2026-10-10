import Link from "next/link";
import { Images } from "lucide-react";
import { listAlbums } from "@/lib/data";
import { formatDate } from "@/lib/time";
import { mediaUrl } from "@/lib/url";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { saveAlbum } from "./actions";
import { AlbumForm } from "./album-form";

export const metadata = { title: "Galeri" };

export default async function AdminGalleryPage() {
  const albums = await listAlbums({ publishedOnly: false });
  return (
    <>
      <AdminPageHeader title="Galeri" description="Album dokumentasi project Fritzy Force dan kegiatan ZyFriends yang notable." />
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Panel title="Album">
          {albums.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-soft">Belum ada album.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((a) => {
                const cover = mediaUrl(a.cover_key);
                return (
                  <li key={a.id}>
                    <Link href={`/admin/galeri/${a.id}`} className="group block overflow-hidden rounded-2xl border border-line hover:border-plum-300">
                      <div className="grid aspect-[4/3] place-items-center bg-plum-50">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt="" loading="lazy" className="size-full object-cover" />
                        ) : (
                          <Images className="size-8 text-plum-200" aria-hidden />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold group-hover:text-plum-700">{a.title}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
                          {a.photo_count} foto {a.date && `· ${formatDate(a.date)}`}
                          {!a.published && <Badge tone="neutral">Disembunyikan</Badge>}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
        <Panel title="Album baru">
          <AlbumForm action={saveAlbum.bind(null, null)} />
        </Panel>
      </div>
    </>
  );
}
