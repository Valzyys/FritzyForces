import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { cx } from "./ui";

const DOW = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTH = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });

/** Kalender bulan (WIB) yang menandai hari-hari berjadwal. Server component, tanpa JS. */
export function MonthCalendar({
  year,
  month,
  today,
  days,
  className,
}: {
  year: number;
  month: number;
  today: string;
  days: { day: string; categories: string }[];
  className?: string;
}) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const total = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // Senin = 0
  const marked = new Map(days.map((d) => [d.day, d.categories.split(",")]));
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const key = (d: number) => `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className={cx("rounded-2xl bg-white p-4 ring-1 ring-line", className)}>
      <div className="flex items-center justify-between">
        <p className="font-display font-bold capitalize text-ink">{MONTH.format(first)}</p>
        <p className="text-xs font-semibold text-ink-faint">{marked.size} hari berjadwal</p>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center" role="grid" aria-label={`Kalender ${MONTH.format(first)}`}>
        {DOW.map((d) => (
          <span key={d} role="columnheader" className="pb-1 text-[0.68rem] font-bold uppercase tracking-wider text-ink-faint">
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} role="gridcell" />;
          const cats = marked.get(key(d));
          const isToday = key(d) === today;
          const label = cats ? `${d}: ${cats.map((c) => EVENT_CATEGORIES[c] ?? c).join(", ")}` : String(d);
          const inner = (
            <span
              className={cx(
                "relative grid aspect-square place-items-center rounded-lg text-sm tabular-nums",
                cats ? "bg-plum-600 font-bold text-white" : "text-ink-soft",
                isToday && !cats && "font-bold text-plum-700 ring-2 ring-plum-300",
                isToday && cats && "ring-2 ring-plum-300 ring-offset-1",
              )}
            >
              {d}
              {cats && cats.length > 1 && <span className="absolute right-1 bottom-1 size-1.5 rounded-full bg-plum-200" aria-hidden />}
            </span>
          );
          return (
            <span key={d} role="gridcell" aria-label={label}>
              {cats ? (
                <Link href="/jadwal" title={label}>
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
