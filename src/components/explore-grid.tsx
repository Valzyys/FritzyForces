import Link from "next/link";
import { ArrowUpRight, CalendarDays, Gamepad2, Images, MessageCircleHeart, Newspaper, Sparkles, Trophy, Users } from "lucide-react";
import { cx } from "./ui";

const ALL = {
  fritzy: { href: "/fritzy", icon: Sparkles, title: "Profil Fritzy", text: "Kenalan lebih dekat" },
  jadwal: { href: "/jadwal", icon: CalendarDays, title: "Jadwal", text: "Teater, video call, event" },
  fanwall: { href: "/fanwall", icon: MessageCircleHeart, title: "Fanwall", text: "Tempel pesan untuk Fritzy" },
  galeri: { href: "/galeri", icon: Images, title: "Galeri", text: "Dokumentasi project FF" },
  esport: { href: "/esport", icon: Trophy, title: "Esport", text: "Tim esport Fritzy Force" },
  tentang: { href: "/tentang", icon: Users, title: "Tentang kami", text: "Fritzy Force & komunitas" },
  berita: { href: "/berita", icon: Newspaper, title: "Berita", text: "Kabar & pengumuman" },
  games: { href: "/games", icon: Gamepad2, title: "Games", text: "Puzzle foto Fritzy" },
} as const;

/** Kartu navigasi bergaya bento untuk mengisi akhir halaman dengan tujuan yang berguna. */
export function ExploreGrid({ keys, title = "Jelajahi juga" }: { keys: (keyof typeof ALL)[]; title?: string }) {
  return (
    <section aria-label={title} className="mt-16">
      <p className="kicker">{title}</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {keys.map((k, i) => {
          const it = ALL[k];
          return (
            <li key={k}>
              <Link
                href={it.href}
                className={cx(
                  "group relative flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-[1.5rem] p-5 ring-1 transition-transform hover:-translate-y-0.5",
                  i === 0 ? "bg-plum-950 text-white ring-plum-900" : i === 1 ? "bg-plum-600 text-white ring-plum-700" : "bg-white text-ink ring-line hover:ring-plum-300",
                )}
              >
                {i < 2 && <div aria-hidden className="bg-stripes absolute inset-0 [--stripe-color:rgb(255_255_255/0.07)]" />}
                <it.icon className="relative size-7 opacity-80" aria-hidden />
                <span className="relative">
                  <span className="block font-display text-xl font-bold">{it.title}</span>
                  <span className={cx("block text-sm", i < 2 ? "text-plum-100" : "text-ink-soft")}>{it.text}</span>
                </span>
                <ArrowUpRight className="absolute top-5 right-5 size-5 opacity-50 transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
