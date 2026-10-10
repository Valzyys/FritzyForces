import Link from "next/link";

const SHADES = ["bg-plum-700", "bg-plum-500", "bg-plum-300", "bg-plum-950", "bg-plum-200", "bg-ink-faint"];

/** Batang bertumpuk jumlah kegiatan per tahun menurut jenis (6 jenis teratas, sisanya "Lainnya"). */
export function ActivityChart({ rows }: { rows: { year: string; type: string; n: number }[] }) {
  if (rows.length === 0) return null;
  const totals = new Map<string, number>();
  for (const r of rows) totals.set(r.type, (totals.get(r.type) ?? 0) + r.n);
  const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
  const keyOf = (t: string) => (top.includes(t) ? t : "Lainnya");
  const legend = [...top, ...(totals.size > top.length ? ["Lainnya"] : [])];
  const years = [...new Set(rows.map((r) => r.year))].sort();
  const perYear = years.map((y) => {
    const m = new Map<string, number>();
    for (const r of rows.filter((r) => r.year === y)) m.set(keyOf(r.type), (m.get(keyOf(r.type)) ?? 0) + r.n);
    return { year: y, parts: m, total: [...m.values()].reduce((a, b) => a + b, 0) };
  });
  const max = Math.max(...perYear.map((y) => y.total));

  return (
    <figure className="rounded-[1.5rem] bg-white p-5 ring-1 ring-line">
      <figcaption className="font-display text-lg font-bold">Kegiatan per tahun</figcaption>
      <ul className="mt-4 space-y-3">
        {perYear.map((y) => (
          <li key={y.year}>
            <Link href={`/kegiatan?tahun=${y.year}`} className="group block">
              <span className="flex justify-between text-sm">
                <span className="font-bold text-ink group-hover:text-plum-800">{y.year}</span>
                <span className="font-semibold text-ink-soft tabular-nums">{y.total}</span>
              </span>
              <span className="mt-1.5 flex h-3 overflow-hidden rounded-full bg-mist" style={{ width: `${Math.max(8, (y.total / max) * 100)}%` }}>
                {legend.map((t, i) => {
                  const n = y.parts.get(t) ?? 0;
                  return n ? <span key={t} className={SHADES[i]} style={{ width: `${(n / y.total) * 100}%` }} title={`${t}: ${n}`} /> : null;
                })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line pt-4 text-xs">
        {legend.map((t, i) => (
          <li key={t} className="flex items-center gap-1.5 text-ink-soft">
            <span className={`size-2.5 shrink-0 rounded-sm ${SHADES[i]}`} aria-hidden />
            <span className="truncate">{t}</span>
            <span className="ml-auto font-semibold tabular-nums">{t === "Lainnya" ? [...totals.entries()].filter(([k]) => !top.includes(k)).reduce((a, [, n]) => a + n, 0) : totals.get(t)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
