import "server-only";
import { getBucket } from "./cf";
import { MAX_IMAGE_BYTES, sniffImage, type ImageInfo } from "./images";

export type StoredImage = ImageInfo & { key: string; size: number };

export class UploadError extends Error {
  name = "UploadError";
}

/** Simpan file gambar yang sudah divalidasi ke R2. Mengembalikan null bila input kosong. */
export async function storeImage(file: FormDataEntryValue | null, folder: string): Promise<StoredImage | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Ukuran gambar maksimal 8 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = sniffImage(bytes);
  if (!info) throw new UploadError("Format gambar tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau AVIF.");
  const now = new Date();
  const key = `u/${folder}/${now.getUTCFullYear()}/${crypto.randomUUID()}.${info.ext}`;
  const bucket = await getBucket();
  await bucket.put(key, bytes, {
    httpMetadata: { contentType: info.mime, cacheControl: "public, max-age=31536000, immutable" },
  });
  return { ...info, key, size: file.size };
}

export async function deleteObject(key: string | null | undefined): Promise<void> {
  if (!key) return;
  try {
    await (await getBucket()).delete(key);
  } catch (err) {
    console.error("[r2] gagal menghapus objek:", err instanceof Error ? err.message : err);
  }
}

/**
 * Tangani input gambar tunggal pada form admin: unggah baru (menggantikan yang lama),
 * hapus bila dicentang, atau pertahankan yang sekarang.
 */
export async function resolveImageField(
  form: FormData,
  field: string,
  folder: string,
  currentKey: string | null,
): Promise<{ key: string | null; obsolete: string | null }> {
  const uploaded = await storeImage(form.get(field), folder);
  if (uploaded) return { key: uploaded.key, obsolete: currentKey };
  if (form.get(`${field}_remove`) === "on") return { key: null, obsolete: currentKey };
  return { key: currentKey, obsolete: null };
}
