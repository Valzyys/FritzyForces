import { notFound } from "next/navigation";
import { first } from "@/lib/db";
import { getAlbum, listPhotos } from "@/lib/data";
import { mediaUrl } from "@/lib/url";
import { ConfirmButton } from "@/components/admin/confirm";
import { AdminPageHeader, Flash, Panel } from "@/components/admin/ui";
import { strParam } from "@/components/ui";
import { deleteAlbum, deletePhoto, saveAlbum, savePhoto } from "../actions";
import { AlbumForm } from "../album-form";
import { PhotoCard } from "../photo-card";
import { PhotoUploader } from "../photo-uploader";

export const metadata = { title: "Kelola album" };

export default async function AdminAlbumPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const row = await first<{ slug: string }>("SELECT slug FROM albums WHERE id = ?", id);
  const album = row ? await getAlbum(row.slug, false) : null;
  if (!album) notFound();
  const photos = await listPhotos(album.id);

  return (
    <>
      <AdminPageHeader
        title={album.title}
        back={{ href: "/admin/galeri", label: "Galeri" }}
        action={
          <ConfirmButton
            action={deleteAlbum.bind(null, album.id)}
            label="Hapus album"
            title="Hapus album beserta semua fotonya?"
            description={`${photos.length} foto akan ikut terhapus permanen dari penyimpanan.`}
          />
        }
      />
      <Flash show={strParam(sp.baru) === "1"}>Album dibuat. Sekarang unggah fotonya.</Flash>
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Panel title="Unggah foto">
            <PhotoUploader albumId={album.id} />
          </Panel>
          <Panel title={`${photos.length} foto`} description="Foto pertama dipakai sebagai sampul album.">
            {photos.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-soft">Belum ada foto.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((p) => (
                  <PhotoCard
                    key={p.id}
                    src={mediaUrl(p.r2_key)!}
                    alt={p.alt}
                    caption={p.caption}
                    saveAction={savePhoto.bind(null, p.id)}
                    deleteAction={deletePhoto.bind(null, p.id)}
                  />
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <Panel title="Detail album">
          <AlbumForm action={saveAlbum.bind(null, album.id)} album={album} />
        </Panel>
      </div>
    </>
  );
}
