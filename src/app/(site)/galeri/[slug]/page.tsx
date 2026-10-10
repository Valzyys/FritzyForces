import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAlbum, listPhotos } from "@/lib/data";
import { plainText } from "@/lib/markdown";
import { formatDate } from "@/lib/time";
import { mediaUrl } from "@/lib/url";
import { Lightbox } from "@/components/lightbox";
import { EmptyState } from "@/components/ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug, true).catch(() => null);
  if (!album) return { title: "Album tidak ditemukan" };
  const cover = mediaUrl(album.cover_key);
  return {
    title: album.title,
    description: plainText(album.description) || `Album foto ${album.title}`,
    alternates: { canonical: `/galeri/${album.slug}` },
    openGraph: cover ? { images: [cover] } : undefined,
  };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = await getAlbum(slug, true);
  if (!album) notFound();
  const photos = await listPhotos(album.id);

  return (
    <div className="shell py-12">
      <Link href="/galeri" className="inline-flex items-center gap-1.5 text-sm font-semibold text-plum-700 hover:text-plum-900">
        <ArrowLeft className="size-4" aria-hidden /> Galeri
      </Link>
      <h1 className="mt-6 text-4xl font-bold sm:text-5xl">{album.title}</h1>
      <p className="mt-2 text-ink-faint">
        {album.date ? `${formatDate(album.date)} · ` : ""}
        {photos.length} foto
      </p>
      {album.description && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{album.description}</p>}
      <div className="mt-10">
        {photos.length === 0 ? (
          <EmptyState title="Album ini belum berisi foto" />
        ) : (
          <Lightbox
            photos={photos.map((p) => ({
              id: p.id,
              src: mediaUrl(p.r2_key)!,
              alt: p.alt || `Foto dari album ${album.title}`,
              caption: p.caption,
              width: p.width,
              height: p.height,
            }))}
          />
        )}
      </div>
    </div>
  );
}
