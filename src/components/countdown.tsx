"use client";

import { useSyncExternalStore } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}
const clientSecond = () => Math.floor(Date.now() / 1000);
const serverSecond = () => null;

/** Hitung mundur ke jadwal teater berikutnya. Di server/hidrasi awal menampilkan "--". */
export function Countdown({ target }: { target: string }) {
  const end = new Date(target).getTime();
  const nowSec = useSyncExternalStore(subscribe, clientSecond, serverSecond);
  const left = nowSec === null ? Number.POSITIVE_INFINITY : end - nowSec * 1000;
  const p = parts(Number.isFinite(left) ? left : 0);
  const ready = nowSec !== null;
  const cells = [
    { v: p.d, l: "hari" },
    { v: p.h, l: "jam" },
    { v: p.m, l: "menit" },
    { v: p.s, l: "detik" },
  ];

  if (left <= 0) {
    return <p className="font-display text-2xl font-semibold text-white">Pertunjukan sedang berlangsung.</p>;
  }

  return (
    <div role="timer" aria-live="off" aria-label={ready ? `${p.d} hari ${p.h} jam ${p.m} menit lagi` : "Menghitung waktu"} className="grid grid-cols-4 gap-2 sm:gap-3">
      {cells.map((c) => (
        <div key={c.l} className="rounded-2xl bg-white/[0.07] px-2 py-3 text-center ring-1 ring-white/10 sm:px-4 sm:py-4">
          <span className="block font-display text-3xl font-bold tabular-nums text-white sm:text-5xl">
            {ready ? String(c.v).padStart(2, "0") : "--"}
          </span>
          <span className="mt-1 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-plum-200">{c.l}</span>
        </div>
      ))}
    </div>
  );
}
