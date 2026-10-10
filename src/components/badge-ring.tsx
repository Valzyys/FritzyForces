import { cx } from "./ui";

/** Stiker bulat dengan teks melingkar yang berputar pelan (berhenti saat reduced-motion). */
export function BadgeRing({ id, text, className, center = "✦" }: { id: string; text: string; className?: string; center?: string }) {
  return (
    <div className={cx("relative grid size-28 place-items-center rounded-full bg-white text-plum-800 shadow-[var(--shadow-lift)] ring-1 ring-line", className)} aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full animate-spin-slow reduced:animate-none">
        <defs>
          <path id={id} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-current font-display text-[10.5px] font-bold uppercase tracking-[0.22em]">
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <span className="font-display text-2xl font-extrabold text-plum-600">{center}</span>
    </div>
  );
}
