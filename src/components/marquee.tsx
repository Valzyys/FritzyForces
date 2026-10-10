import type { ReactNode } from "react";
import { cx } from "./ui";

/**
 * Pita berjalan (CSS murni). Isi digandakan untuk loop mulus; salinan kedua
 * disembunyikan dari pembaca layar. Berhenti saat hover & saat reduced-motion.
 */
export function Marquee({ items, className, separator, speed = 40 }: { items: ReactNode[]; className?: string; separator?: ReactNode; speed?: number }) {
  if (items.length === 0) return null;
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={i} className="flex shrink-0 items-center">
          {item}
          <span className="mx-5 sm:mx-7" aria-hidden>
            {separator ?? "✦"}
          </span>
        </li>
      ))}
    </ul>
  );
  // Ulangi agar lebar track selalu melebihi layar.
  const reps = Math.max(1, Math.ceil(8 / items.length));
  return (
    <div className={cx("marquee overflow-hidden", className)}>
      <div className="marquee-track" style={{ animationDuration: `${speed + items.length * reps * 2}s` }}>
        {Array.from({ length: reps }, (_, i) => (
          <div key={`a${i}`} className="flex">{row(i > 0)}</div>
        ))}
        {Array.from({ length: reps }, (_, i) => (
          <div key={`b${i}`} className="flex">{row(true)}</div>
        ))}
      </div>
    </div>
  );
}
