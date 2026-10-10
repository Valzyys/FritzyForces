"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type LightboxPhoto = { id: string; src: string; alt: string; caption: string; width: number | null; height: number | null };

export function Lightbox({ photos }: { photos: LightboxPhoto[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setIndex(null);
    dlg.addEventListener("keydown", onKey);
    dlg.addEventListener("close", onClose);
    return () => {
      dlg.removeEventListener("keydown", onKey);
      dlg.removeEventListener("close", onClose);
    };
  }, [step]);

  const current = index !== null ? photos[index] : null;

  return (
    <>
      <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {photos.map((p, i) => (
          <li key={p.id} className="mb-3 break-inside-avoid">
            <button
              type="button"
              onClick={() => open(i)}
              className="group block w-full overflow-hidden rounded-2xl bg-plum-50 ring-1 ring-line"
              aria-label={`Perbesar foto: ${p.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                decoding="async"
                width={p.width ?? undefined}
                height={p.height ?? undefined}
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Penampil foto"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-plum-950/90 open:animate-fade"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {current && (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-4 sm:p-10" onClick={(e) => e.target === e.currentTarget && close()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={current.alt} className="max-h-[78dvh] max-w-full rounded-xl object-contain" />
            <div className="flex w-full max-w-3xl items-center justify-between gap-4 text-white">
              <p className="min-w-0 text-sm text-plum-100">
                <span className="tabular-nums text-plum-300">
                  {index! + 1}/{photos.length}
                </span>
                {current.caption && <span className="ml-3">{current.caption}</span>}
              </p>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => step(-1)} className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Foto sebelumnya">
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button type="button" onClick={() => step(1)} className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Foto berikutnya">
                  <ChevronRight className="size-5" aria-hidden />
                </button>
                <button type="button" onClick={close} className="grid size-11 place-items-center rounded-full bg-white text-plum-900 hover:bg-plum-100" aria-label="Tutup">
                  <X className="size-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
