"use client";

import { useSyncExternalStore } from "react";
import { cx } from "./ui";

const KEY = "ff-motion";

function read(): "full" | "reduced" {
  return document.documentElement.dataset.motion === "reduced" ? "reduced" : "full";
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function setMode(mode: "full" | "reduced") {
  const root = document.documentElement;
  if (mode === "reduced") root.dataset.motion = "reduced";
  else delete root.dataset.motion;
  try {
    if (mode === "reduced") window.localStorage.setItem(KEY, "reduced");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* localStorage tidak tersedia: pilihan berlaku sampai halaman ditutup */
  }
  listeners.forEach((l) => l());
}

/** Tombol pengunjung untuk mengurangi animasi (disimpan di localStorage). */
export function MotionToggle({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const mode = useSyncExternalStore(subscribe, read, () => "full" as const);
  const reduced = mode === "reduced";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={reduced}
      onClick={() => setMode(reduced ? "full" : "reduced")}
      className={cx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
        tone === "dark" ? "text-plum-100 ring-1 ring-white/15 hover:bg-white/10" : "text-ink-soft ring-1 ring-line hover:bg-plum-50",
        className,
      )}
    >
      <span
        aria-hidden
        className={cx(
          "relative h-4 w-7 rounded-full transition-colors",
          reduced ? "bg-plum-400" : tone === "dark" ? "bg-white/20" : "bg-line-strong",
        )}
      >
        <span className={cx("absolute top-0.5 size-3 rounded-full bg-white transition-transform", reduced ? "translate-x-3.5" : "translate-x-0.5")} />
      </span>
      Kurangi animasi
    </button>
  );
}
