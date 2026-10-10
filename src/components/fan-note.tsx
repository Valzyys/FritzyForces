import type { FanMessage } from "@/lib/data";
import { formatDate } from "@/lib/time";
import { Pin } from "lucide-react";
import { cx } from "./ui";

export const NOTE_THEMES: Record<string, { label: string; card: string; meta: string; swatch: string }> = {
  lilac: { label: "Lilac", card: "bg-plum-50 text-ink ring-plum-100", meta: "text-plum-800", swatch: "bg-plum-100" },
  plum: { label: "Plum", card: "bg-plum-600 text-white ring-plum-700", meta: "text-plum-100", swatch: "bg-plum-600" },
  cream: { label: "Kertas", card: "bg-[#fffdf8] text-ink ring-line", meta: "text-ink-soft", swatch: "bg-[#fffdf8]" },
  ink: { label: "Malam", card: "bg-plum-950 text-white ring-plum-900", meta: "text-plum-200", swatch: "bg-plum-950" },
};

const TILTS = ["sm:-rotate-[0.6deg]", "sm:rotate-[0.5deg]", "", "sm:rotate-[0.3deg]", "sm:-rotate-[0.4deg]"];

export function FanNote({ note, index = 0 }: { note: FanMessage; index?: number }) {
  const theme = NOTE_THEMES[note.theme] ?? NOTE_THEMES.lilac;
  return (
    <figure
      className={cx(
        "relative mb-4 break-inside-avoid rounded-[1.25rem] p-5 ring-1 transition-transform duration-200 hover:rotate-0",
        theme.card,
        TILTS[index % TILTS.length],
      )}
    >
      {note.pinned ? <Pin className={cx("absolute right-4 top-4 size-4", theme.meta)} aria-label="Disematkan" /> : null}
      <blockquote className="whitespace-pre-line pr-4 text-[0.975rem] leading-relaxed">{note.message}</blockquote>
      <figcaption className={cx("mt-4 flex items-center justify-between gap-3 text-sm", theme.meta)}>
        <span className="font-semibold">— {note.name}</span>
        <time dateTime={note.created_at} className="text-xs opacity-80">
          {formatDate(note.created_at)}
        </time>
      </figcaption>
    </figure>
  );
}
