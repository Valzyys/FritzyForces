"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { Button, cx } from "@/components/ui";

type Size = 3 | 4;

function solved(n: Size): number[] {
  return [...Array.from({ length: n * n - 1 }, (_, i) => i + 1), 0];
}

function neighbors(idx: number, n: Size): number[] {
  const r = Math.floor(idx / n);
  const c = idx % n;
  const out: number[] = [];
  if (r > 0) out.push(idx - n);
  if (r < n - 1) out.push(idx + n);
  if (c > 0) out.push(idx - 1);
  if (c < n - 1) out.push(idx + 1);
  return out;
}

/** Acak dengan langkah-langkah valid dari kondisi selesai → selalu bisa diselesaikan. */
function shuffle(n: Size): number[] {
  const tiles = solved(n);
  let blank = tiles.length - 1;
  let prev = -1;
  for (let i = 0; i < n * n * 25; i++) {
    const options = neighbors(blank, n).filter((x) => x !== prev);
    const pick = options[Math.floor(Math.random() * options.length)];
    [tiles[blank], tiles[pick]] = [tiles[pick], tiles[blank]];
    prev = blank;
    blank = pick;
  }
  return isSolved(tiles) ? shuffle(n) : tiles;
}

function isSolved(tiles: number[]): boolean {
  return tiles.every((t, i) => (i === tiles.length - 1 ? t === 0 : t === i + 1));
}

function readBest(n: Size): number | null {
  try {
    const v = Number(window.localStorage.getItem(`ff-puzzle-best-${n}`));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

function writeBest(n: Size, moves: number) {
  try {
    window.localStorage.setItem(`ff-puzzle-best-${n}`, String(moves));
  } catch {
    /* penyimpanan tidak tersedia */
  }
}

export function SlidingPuzzle({ image }: { image: string | null }) {
  const [size, setSize] = useState<Size>(3);
  const [tiles, setTiles] = useState<number[]>(() => solved(3));
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const won = started && isSolved(tiles);

  const reset = useCallback((n: Size) => {
    setSize(n);
    setTiles(shuffle(n));
    setMoves(0);
    setStarted(true);
    setBest(readBest(n));
  }, []);

  const move = useCallback(
    (idx: number) => {
      if (won) return;
      const blank = tiles.indexOf(0);
      if (!neighbors(blank, size).includes(idx)) return;
      const next = [...tiles];
      [next[blank], next[idx]] = [next[idx], next[blank]];
      setTiles(next);
      setMoves((m) => {
        const total = m + 1;
        if (isSolved(next)) {
          const prevBest = readBest(size);
          if (!prevBest || total < prevBest) {
            writeBest(size, total);
            setBest(total);
          }
        }
        return total;
      });
    },
    [tiles, size, won],
  );

  // Panah keyboard menggeser petak di sebelah ruang kosong.
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const blank = tiles.indexOf(0);
      const map: Record<string, number> = { ArrowUp: blank + size, ArrowDown: blank - size, ArrowLeft: blank + 1, ArrowRight: blank - 1 };
      const idx = map[e.key];
      if (idx === undefined) return;
      if (neighbors(blank, size).includes(idx)) {
        e.preventDefault();
        move(idx);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, tiles, size, move]);

  const pct = useMemo(() => 100 / (size - 1), [size]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,30rem)_1fr] lg:items-start">
      <div>
        <div
          className="relative grid aspect-square w-full gap-1.5 rounded-[1.5rem] bg-plum-950 p-1.5 sm:gap-2 sm:p-2"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          role="grid"
          aria-label={`Puzzle geser ${size}×${size}`}
        >
          {tiles.map((t, i) => {
            if (t === 0) return <div key="blank" role="gridcell" aria-label="Kosong" className="rounded-xl" />;
            const r = Math.floor((t - 1) / size);
            const c = (t - 1) % size;
            const movable = started && neighbors(tiles.indexOf(0), size).includes(i);
            return (
              <button
                key={t}
                type="button"
                role="gridcell"
                onClick={() => move(i)}
                disabled={!started || won}
                aria-label={`Petak ${t}${movable ? ", bisa digeser" : ""}`}
                className={cx(
                  "relative overflow-hidden rounded-xl font-display text-2xl font-bold transition-transform duration-150 sm:text-3xl",
                  image ? "text-white" : "bg-plum-100 text-plum-800",
                  movable && "ring-2 ring-plum-300 hover:scale-[0.97]",
                )}
                style={
                  image
                    ? { backgroundImage: `url(${image})`, backgroundSize: `${size * 100}%`, backgroundPosition: `${c * pct}% ${r * pct}%` }
                    : undefined
                }
              >
                <span className={cx(image && "absolute left-1.5 top-1 text-xs font-bold opacity-80 drop-shadow")}>{t}</span>
              </button>
            );
          })}
          {won && (
            <div className="absolute inset-0 grid animate-fade place-items-center rounded-[1.5rem] bg-plum-950/80 p-6 text-center text-white">
              <div>
                <Trophy className="mx-auto size-10 text-plum-200" aria-hidden />
                <p className="mt-3 font-display text-3xl font-bold">Selesai!</p>
                <p className="mt-1 text-plum-200">{moves} langkah</p>
                <Button variant="inverse" className="mt-5" onClick={() => reset(size)}>
                  Main lagi
                </Button>
              </div>
            </div>
          )}
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {won ? `Puzzle selesai dalam ${moves} langkah.` : ""}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="field-label">Tingkat kesulitan</p>
          <div className="flex gap-2">
            {([3, 4] as Size[]).map((n) => (
              <Button key={n} variant={size === n && started ? "primary" : "secondary"} size="sm" onClick={() => reset(n)}>
                {n}×{n} {n === 3 ? "· Santai" : "· Menantang"}
              </Button>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <dt className="text-sm text-ink-faint">Langkah</dt>
            <dd className="font-display text-3xl font-bold tabular-nums">{moves}</dd>
          </div>
          <div className="card p-4">
            <dt className="text-sm text-ink-faint">Rekor kamu ({size}×{size})</dt>
            <dd className="font-display text-3xl font-bold tabular-nums">{best ?? "—"}</dd>
          </div>
        </dl>
        {!started ? (
          <Button size="lg" onClick={() => reset(size)}>
            Mulai main
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => reset(size)}>
            <RotateCcw className="size-4" aria-hidden /> Acak ulang
          </Button>
        )}
        <p className="text-sm leading-relaxed text-ink-soft">
          Geser petak ke ruang kosong sampai gambar kembali utuh. Bisa juga memakai tombol panah di keyboard.
        </p>
      </div>
    </div>
  );
}
