"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4">
      <div className="max-w-md text-center">
        <p className="kicker justify-center">Terjadi kendala</p>
        <h1 className="mt-3 text-3xl font-bold">Halaman ini gagal dimuat</h1>
        <p className="mt-3 text-ink-soft">Coba muat ulang. Kalau masih bermasalah, kabari admin Fritzy Force.</p>
        <Button className="mt-8" onClick={reset}>
          Coba lagi
        </Button>
      </div>
    </main>
  );
}
