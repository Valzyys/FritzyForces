import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Disc3, Gamepad2, Images, Sparkles, Trophy, Users } from "lucide-react";
import {
  getNextTheaterShow,
  getProfile,
  getShowTotals,
  getUpcomingEvents,
  listApprovedMessages,
  listPublishedPosts,
  onThisDate,
} from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDate, formatTime, formatWeekday, todayWib } from "@/lib/time";
import { mediaUrl } from "@/lib/url";
import { Countdown } from "@/components/countdown";
import { EventTicket, PostCard } from "@/components/content";
import { FanNote } from "@/components/fan-note";
import { ButtonLink, EmptyState, ErrorNotice, SectionHeading } from "@/components/ui";

export default async function HomePage() {
  const [profile, nextShow, upcoming, posts, notes, memories, totals, settings] = await Promise.all([
    safeQuery(() => getProfile("fritzy"), null),
    safeQuery(() => getNextTheaterShow(), null),
    safeQuery(() => getUpcomingEvents(3), []),
    safeQuery(() => listPublishedPosts({ page: 1, perPage: 3 }), { items: [], total: 0 }),
    safeQuery(() => listApprovedMessages(1, 6), { items: [], total: 0 }),
    safeQuery(() => onThisDate(), []),
    safeQuery(() => getShowTotals(), { shows: 0, setlists: 0, first: null, last: null }),
    getSettings(),
  ]);

  const p = profile.data;
  const photo = mediaUrl(p?.image_key);
  const firstName = (p?.name || "Fritzy").split(" ")[0];
  const dbDown = profile.failed && nextShow.failed;

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden bg-mist">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,var(--color-plum-100),transparent_70%)]" />
        <div className="shell relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="kicker animate-fade">{settings.tagline}</p>
            <h1 className="mt-5 animate-rise font-display text-[clamp(3.6rem,13vw,8.5rem)] font-extrabold leading-[0.88] tracking-[-0.045em] text-ink">
              {firstName}
              <span className="text-plum-600">.</span>
            </h1>
            {p?.name && p.name !== firstName && (
              <p className="mt-4 animate-rise text-lg font-semibold text-ink-soft [animation-delay:60ms]">
                {p.name}
                {p.tagline && <span className="font-normal text-ink-faint"> — {p.tagline}</span>}
              </p>
            )}
            {p?.jiko ? (
              <figure className="mt-8 max-w-xl animate-rise border-l-[3px] border-plum-400 pl-5 [animation-delay:120ms]">
                <blockquote className="font-display text-xl leading-snug text-ink sm:text-2xl">“{p.jiko}”</blockquote>
                <figcaption className="mt-2 text-sm text-ink-faint">Jikoshoukai</figcaption>
              </figure>
            ) : null}
            <div className="mt-9 flex flex-wrap gap-3 animate-rise [animation-delay:180ms]">
              <ButtonLink href="/fritzy" size="lg">
                Kenali Fritzy <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/jadwal" variant="secondary" size="lg">
                Lihat jadwal
              </ButtonLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm animate-rise [animation-delay:100ms] lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-plum-100 ring-1 ring-plum-200">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={`Foto ${p?.name ?? "Fritzy"}`} className="size-full object-cover" fetchPriority="high" />
              ) : (
                <div className="flex size-full flex-col items-center justify-end bg-[linear-gradient(180deg,var(--color-plum-100),var(--color-plum-200))] pb-10">
                  <span className="font-display text-[7rem] font-extrabold leading-none text-white/80">Zy</span>
                </div>
              )}
            </div>
            {totals.data.shows > 0 && (
              <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white px-5 py-4 shadow-[var(--shadow-lift)] ring-1 ring-line sm:-left-8">
                <p className="font-display text-3xl font-bold leading-none text-plum-700 tabular-nums">{totals.data.shows}</p>
                <p className="mt-1 text-xs font-semibold text-ink-soft">show teater tercatat</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {dbDown && (
        <div className="shell mt-8">
          <ErrorNotice />
        </div>
      )}

      {/* ───────────── Countdown teater ───────────── */}
      <section aria-labelledby="countdown-title" className="shell mt-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-plum-950 px-6 py-10 text-white sm:px-10 sm:py-12">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full border border-white/10" />
          <div aria-hidden className="pointer-events-none absolute -right-6 -top-14 size-52 rounded-full border border-white/10" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum-300">Teater berikutnya</p>
              {nextShow.data ? (
                <>
                  <h2 id="countdown-title" className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                    {nextShow.data.title}
                  </h2>
                  <p className="mt-3 text-plum-200">
                    {formatWeekday(nextShow.data.starts_at)}, {formatDate(nextShow.data.starts_at)} · {formatTime(nextShow.data.starts_at)}
                  </p>
                </>
              ) : (
                <>
                  <h2 id="countdown-title" className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                    Belum ada jadwal teater baru.
                  </h2>
                  <p className="mt-3 max-w-md text-plum-200">
                    Jadwal akan muncul di sini begitu pertunjukan dengan Fritzy diumumkan.
                  </p>
                </>
              )}
            </div>
            {nextShow.data ? (
              <Countdown target={nextShow.data.starts_at} />
            ) : (
              <div className="flex lg:justify-end">
                <ButtonLink href="/jadwal" variant="inverse">
                  Buka halaman jadwal <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────────── Zy This Date ───────────── */}
      {memories.data.length > 0 && (
        <section aria-labelledby="zythisdate" className="shell mt-24">
          <SectionHeading
            kicker="Zy This Date"
            title={<span id="zythisdate">Hari ini, di tahun-tahun sebelumnya</span>}
            description={`Kegiatan Fritzy yang tercatat pada ${formatDate(todayWib()).replace(/ \d{4}$/, "")}.`}
          />
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {memories.data.map((m) => (
              <li key={m.id} className="card flex flex-col p-5">
                <p className="font-display text-4xl font-bold text-plum-600 tabular-nums">{m.date.slice(0, 4)}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">{m.type}</p>
                <p className="mt-3 font-medium leading-snug text-ink">{m.title}</p>
                {m.location && <p className="mt-auto pt-3 text-sm text-ink-soft">{m.location}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ───────────── Fritzy's World ───────────── */}
      <section aria-labelledby="fritzy-world" className="shell mt-24">
        <SectionHeading kicker="Fritzy's World" title={<span id="fritzy-world">Semua tentang Fritzy, di satu tempat</span>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/fritzy", icon: Sparkles, title: "Profil", text: "Kenalan lebih dekat dengan Fritzy." },
            {
              href: "/diskografi",
              icon: Disc3,
              title: "Diskografi",
              text: totals.data.setlists > 0 ? `${totals.data.setlists} setlist teater, single, MV, dan penampilan lainnya.` : "Setlist, single, MV, dan penampilan lainnya.",
            },
            { href: "/timeline", icon: Trophy, title: "Timeline", text: "Momen dan pencapaian penting perjalanan Fritzy." },
            { href: "/kegiatan", icon: CalendarDays, title: "Kegiatan", text: "Rekap aktivitas: teater, video call, off-air, dan lainnya." },
          ].map((c, i) => (
            <Link
              key={c.href}
              href={c.href}
              className="group card relative flex min-h-48 flex-col p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-plum-200 hover:shadow-[var(--shadow-soft)]"
            >
              <span className={i === 0 ? "grid size-11 place-items-center rounded-xl bg-plum-600 text-white" : "grid size-11 place-items-center rounded-xl bg-plum-50 text-plum-700"}>
                <c.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-ink">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{c.text}</p>
              <ArrowUpRight className="absolute right-5 top-5 size-4 text-ink-faint transition-colors group-hover:text-plum-700" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────── Jadwal ───────────── */}
      <section aria-labelledby="jadwal-terdekat" className="mt-24 bg-mist py-20 [--ticket-bg:var(--color-mist)]">
        <div className="shell">
          <SectionHeading
            kicker="Jadwal"
            title={<span id="jadwal-terdekat">Jadwal terdekat</span>}
            action={
              <ButtonLink href="/jadwal" variant="secondary" size="sm">
                Semua jadwal <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            }
          />
          {upcoming.failed ? (
            <ErrorNotice />
          ) : upcoming.data.length === 0 ? (
            <EmptyState title="Belum ada jadwal yang diumumkan">Pantau halaman ini lagi nanti, ya.</EmptyState>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {upcoming.data.map((e) => (
                <EventTicket key={e.id} event={e} compact />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───────────── Berita ───────────── */}
      <section aria-labelledby="berita-terbaru" className="shell mt-24">
        <SectionHeading
          kicker="Berita & Artikel"
          title={<span id="berita-terbaru">Kabar terbaru</span>}
          action={
            <ButtonLink href="/berita" variant="secondary" size="sm">
              Semua berita <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          }
        />
        {posts.data.items.length === 0 ? (
          <EmptyState title="Belum ada berita">Artikel dan pengumuman dari Fritzy Force akan tampil di sini.</EmptyState>
        ) : (
          <div className="grid gap-10 md:grid-cols-3">
            {posts.data.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* ───────────── Fanwall ───────────── */}
      <section aria-labelledby="fanwall-preview" className="shell mt-24">
        <SectionHeading
          kicker="Fanwall"
          title={<span id="fanwall-preview">Pesan dari ZyFriends</span>}
          description="Tinggalkan dukungan dan cerita kecilmu untuk Fritzy."
          action={
            <ButtonLink href="/fanwall#tulis" size="sm">
              Tulis pesan
            </ButtonLink>
          }
        />
        {notes.data.items.length === 0 ? (
          <EmptyState title="Fanwall masih kosong">Jadilah yang pertama menulis pesan untuk Fritzy.</EmptyState>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {notes.data.items.map((n, i) => (
              <FanNote key={n.id} note={n} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ───────────── Eksplorasi komunitas ───────────── */}
      <section aria-labelledby="eksplorasi" className="shell mt-24">
        <div className="grid gap-10 rounded-[2rem] border border-line p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="kicker">Eksplorasi komunitas</p>
            <h2 id="eksplorasi" className="mt-2 text-3xl font-bold leading-tight sm:text-[2.35rem]">
              Lebih dari sekadar fanbase
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
              {settings.exploreIntro ||
                "Kenali Fritzy Force, komunitas yang tergabung bersama kami, tim esport, dan dokumentasi project yang sudah kami jalankan."}
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/tentang", icon: Users, title: "Tentang Fritzy Force", text: "Siapa kami & komunitas kami" },
              { href: "/esport", icon: Trophy, title: "Esport", text: "Tim esport Fritzy Force" },
              { href: "/galeri", icon: Images, title: "Galeri", text: "Dokumentasi project & kegiatan" },
              { href: "/games", icon: Gamepad2, title: "Games", text: "Main puzzle bareng Fritzy" },
            ].map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="group flex h-full items-start gap-4 rounded-2xl bg-mist p-5 transition-colors hover:bg-plum-50">
                  <c.icon className="mt-0.5 size-5 shrink-0 text-plum-600" aria-hidden />
                  <span>
                    <span className="block font-semibold text-ink group-hover:text-plum-800">{c.title}</span>
                    <span className="mt-0.5 block text-sm text-ink-soft">{c.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
