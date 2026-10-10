"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui";
import { finishUpload, uploadPhoto } from "./actions";

const MAX_FILES = 30;
const MAX_BYTES = 8 * 1024 * 1024;

export function PhotoUploader({ albumId }: { albumId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number } | null>(null);

  async function handle(files: File[]) {
    const list = files.slice(0, MAX_FILES);
    if (files.length > MAX_FILES) toast.message(`Hanya ${MAX_FILES} foto pertama yang diunggah.`);
    let failed = 0;
    setProgress({ done: 0, total: list.length, failed: 0 });
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      if (file.size > MAX_BYTES) {
        failed++;
        toast.error(`${file.name}: lebih dari 8 MB.`);
      } else {
        const fd = new FormData();
        fd.append("file", file);
        try {
          const res = await uploadPhoto(albumId, fd);
          if (!res.ok) {
            failed++;
            toast.error(`${file.name}: ${res.message}`);
          }
        } catch {
          failed++;
          toast.error(`${file.name}: koneksi terputus.`);
        }
      }
      setProgress({ done: i + 1, total: list.length, failed });
    }
    await finishUpload();
    const ok = list.length - failed;
    if (ok > 0) toast.success(`${ok} foto berhasil diunggah.`);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  const busy = progress !== null;
  return (
    <div className="rounded-2xl border-2 border-dashed border-line-strong bg-mist p-6 text-center">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="sr-only"
        id="photo-input"
        disabled={busy}
        onChange={(e) => handle(Array.from(e.target.files ?? []))}
      />
      <Upload className="mx-auto size-6 text-plum-600" aria-hidden />
      <p className="mt-2 text-sm text-ink-soft">JPG, PNG, WebP, GIF, AVIF · maks. 8 MB per foto · {MAX_FILES} foto sekali unggah</p>
      {busy ? (
        <div className="mx-auto mt-4 max-w-xs" role="status" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-plum-100">
            <div className="h-full rounded-full bg-plum-600 transition-[width]" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">
            Mengunggah {progress.done}/{progress.total}
            {progress.failed > 0 && <span className="text-danger"> · {progress.failed} gagal</span>}
          </p>
        </div>
      ) : (
        <Button type="button" className="mt-4" onClick={() => inputRef.current?.click()}>
          Pilih foto
        </Button>
      )}
    </div>
  );
}
