import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Disc3,
  Gamepad2,
  Images,
  MessageCircleHeart,
  PenLine,
  Sparkles,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import {
  EMPTY_CHROME,
  eventDaysInMonth,
  getProfile,
  getShowTotals,
  getSiteChrome,
  getUpcomingEvents,
  latestPhotos,
  listApprovedMessages,
  listPublishedPosts,
  onThisDate,
  recentActivities,
} from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDate, formatShortDate, formatTime, formatWeekday, todayWib } from "@/lib/time";
import { mediaUrl } from "@/lib/url";
import { POST_CATEGORIES } from "@/lib/constants";
import { BadgeRing } from "@/components/badge-ring";
import { Countdown } from "@/components/countdown";
import { EventTicket } from "@/components/content";
import { FanNote } from "@/components/fan-note";
import { Marquee } from "@/components/marquee";
import { MonthCalendar } from "@/components/month-calendar";
import { ButtonLink, ErrorNotice, cx } from "@/components/ui";

export default async function HomePage() {
  const [profile, chrome, upcoming, posts, notes, memories, recent, totals, photos, settings] = await Promise.all([
    safeQuery(() => getProfile("fritzy"), null),
    safeQuery(() => getSiteChrome(), EMPTY_CHROME),
    safeQuery(() => getUpcomingEvents(4), []),
    safeQuery(() => listPublishedPosts({ page: 1, perPage: 4 }), { items: [], total: 0 }),
    safeQuery(() => listApprovedMessages(1, 7), { items: [], total: 0 }),
    safeQuery(() => onThisDate(), []),
    safeQuery(() => recentActivities(6), []),
    safeQuery(() => getShowTotals(), { shows: 0, setlists: 0, first: null, last: null }),
    safeQuery(() => latestPhotos(3), []),
    getSettings(),
  ]);
  const today = todayWib();
  const calendar = await safeQuery(() => eventDaysInMonth(Number(today.slice(0, 4)), Number(today.slice(5, 7))), []);

  const p = profile.data;
  const photo = mediaUrl(p?.image_key);
  const firstName = (p?.name || "Fritzy").split(" ")[0];
  const nextShow = chrome.data.nextShow;
  const c = chrome.data.counts;
  const latest = recent.data[0];

  return (
    <>
      {profile.failed && chrome.failed && (
        <div className="shell pt-6">
          <ErrorNotice />
        </div>
      )}

      {/* ───────────── Hero bento ───────────── */}
      <section aria-label="Sorotan" className="relative overflow-hidden bg-mist">
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="shell relative grid gap-3 py-5 sm:gap-4 sm:py-8 lg:grid-cols-12">
          {/* Nama + jiko */}
          <div className="relative flex flex-col overflow-hidden rounded-[2rem] bg-white p-6 ring-1 ring-line sm:p-9 lg:col-span-7 lg:row-span-2">
            <div className="flex items-center justify-between gap-3">
              <p className="kicker animate-fade">{settings.tagline}</p>
              <span className="hidden rounded-full bg-plum-50 px-3 py-1 text-xs font-bold text-plum-800 ring-1 ring-plum-100 sm:inline">
                {formatWeekday(today)}, {formatDate(today)}
              </span>
            </div>
            <h1 className="mt-6 animate-rise font-display text-[clamp(4.2rem,15vw,9.5rem)] leading-[0.82] font-extrabold tracking-[-0.055em] text-ink">
              {firstName}
              <span className="text-plum-600">.</span>
            </h1>
            <p className="mt-4 animate-rise text-lg font-semibold text-ink-soft [animation-delay:60ms]">
              {p?.name && p.name !== firstName ? p.name : ""}
              {p?.tagline && <span className="font-normal text-ink-faint">{p?.name && p.name !== firstName ? " — " : ""}{p.tagline}</span>}
            </p>
            <figure className="mt-7 animate-rise border-l-[3px] border-plum-400 pl-5 [animation-delay:120ms]">
              <blockquote className="font-display text-xl leading-snug text-ink sm:text-2xl">
                {p?.jiko ? `“${p.jiko}”` : p?.summary || "Rumah ZyFriends untuk mengikuti setiap langkah Fritzy — dari panggung teater sampai cerita di balik layar."}
              </blockquote>
              {p?.jiko && <figcaption className="mt-2 text-sm text-ink-faint">Jikoshoukai</figcaption>}
            </figure>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/fritzy" size="lg">
                Kenali Fritzy <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/jadwal" variant="secondary" size="lg">
                Lihat jadwal
              </ButtonLink>
            </div>
            {chrome.data.setlists.length > 0 && (
              <div className="mt-auto pt-8">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">Setlist yang pernah dibawakan</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {chrome.data.setlists.map((s) => (
                    <li key={s}>
                      <Link
                        href={`/diskografi/setlist/${encodeURIComponent(s)}`}
                        className="inline-flex h-8 items-center rounded-full bg-mist px-3 text-sm font-semibold text-ink-soft ring-1 ring-line hover:text-plum-800 hover:ring-plum-200"
                      >
                        {s}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Foto / monogram */}
          <div className="relative min-h-80 overflow-hidden rounded-[2rem] bg-plum-600 ring-1 ring-plum-700 lg:col-span-5">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={`Foto ${p?.name ?? "Fritzy"}`} className="absolute inset-0 size-full object-cover object-[50%_22%]" fetchPriority="high" />
            ) : (
              <>
                <div aria-hidden className="bg-stripes absolute inset-0 [--stripe-color:rgb(255_255_255/0.08)]" />
                <span aria-hidden className="text-outline absolute -bottom-6 -left-3 font-display text-[11rem] leading-none font-extrabold tracking-[-0.08em] [--outline-color:rgb(255_255_255/0.28)]">
                  ZY
                </span>
                <span aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] font-display text-[8.5rem] leading-none font-extrabold tracking-[-0.08em] text-white">
                  Zy
                </span>
              </>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum-950/70 to-transparent p-5 pt-16">
              <p className="font-display text-2xl font-bold text-white">{p?.name || "Fritzy"}</p>
              {p?.tagline && <p className="text-sm font-medium text-plum-100">{p.tagline}</p>}
            </div>
            <BadgeRing id="ring-hero" text="Fritzy Force ✦ ZyFriends ✦ " className="absolute top-4 right-4 size-24 sm:size-28" />
          </div>

          {/* Angka-angka */}
          <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5">
            {[
              { value: totals.data.shows, label: "Show teater tercatat", href: "/kegiatan?jenis=Theater+Show", tone: "dark" },
              { value: totals.data.setlists, label: "Setlist dibawakan", href: "/diskografi?tipe=setlist", tone: "light" },
              { value: c.activities, label: "Kegiatan direkap", href: "/kegiatan", tone: "light" },
              { value: c.messages, label: "Pesan di fanwall", href: "/fanwall", tone: "plum" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={cx(
                  "group relative flex min-h-32 flex-col justify-between overflow-hidden rounded-[1.5rem] p-5 ring-1 transition-transform hover:-translate-y-0.5",
                  s.tone === "dark" && "bg-plum-950 text-white ring-plum-900",
                  s.tone === "light" && "bg-white text-ink ring-line",
                  s.tone === "plum" && "bg-plum-100 text-plum-950 ring-plum-200",
                )}
              >
                <dt className={cx("text-sm font-semibold", s.tone === "dark" ? "text-plum-200" : "text-ink-soft")}>{s.label}</dt>
                <dd className="font-display text-5xl font-extrabold tracking-tight tabular-nums">{s.value}</dd>
                <ArrowUpRight className="absolute top-4 right-4 size-4 opacity-50 transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            ))}
          </dl>

          {/* Countdown / kegiatan terbaru */}
          <div className="relative overflow-hidden rounded-[2rem] bg-plum-950 p-6 text-white sm:p-8 lg:col-span-12">
            <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 [--dot-color:rgb(255_255_255/0.08)]" />
            <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full border border-white/10" />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-center">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-plum-300">
                  <Ticket className="size-4" aria-hidden /> {nextShow ? "Teater berikutnya" : "Kegiatan terbaru"}
                </p>
                {nextShow ? (
                  <>
                    <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{nextShow.title}</h2>
                    <p className="mt-2 text-plum-200">
                      {formatWeekday(nextShow.starts_at)}, {formatDate(nextShow.starts_at)} · {formatTime(nextShow.starts_at)}
                      {nextShow.location ? ` · ${nextShow.location}` : ""}
                    </p>
                  </>
                ) : latest ? (
                  <>
                    <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{latest.title}</h2>
                    <p className="mt-2 text-plum-200">
                      {latest.type} · {formatDate(latest.date)}
                      {latest.location ? ` · ${latest.location}` : ""}
                    </p>
                  </>
                ) : (
                  <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Jadwal teater berikutnya segera hadir.</h2>
                )}
              </div>
              {nextShow ? (
                <Countdown target={nextShow.starts_at} />
              ) : (
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <ButtonLink href="/jadwal" variant="inverse">
                    Buka jadwal <ArrowRight className="size-4" aria-hidden />
                  </ButtonLink>
                  <ButtonLink href="/kegiatan" variant="ghost" className="text-white ring-1 ring-white/20 hover:bg-white/10">
                    Rekap kegiatan
                  </ButtonLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Pita kegiatan ───────────── */}
      {recent.data.length > 0 && (
        <div className="border-y border-plum-700 bg-plum-600 py-3.5 text-white">
          <Marquee
            items={recent.data.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-3 whitespace-nowrap">
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">{a.type}</span>
                <span className="font-display text-lg font-semibold">{a.title}</span>
                <span className="text-sm text-plum-200">{formatShortDate(a.date)}</span>
              </span>
            ))}
            separator={<span className="text-plum-300">✦</span>}
          />
        </div>
      )}

      {/* ───────────── Zy This Date + Fritzy's World ───────────── */}
      <section className="shell mt-16 grid gap-4 lg:grid-cols-12" aria-label="Fritzy's World">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white p-6 sm:p-8 lg:col-span-5">
          <div aria-hidden className="pointer-events-none absolute top-5 right-6 rounded-xl bg-plum-950 px-3 py-2 text-center font-display leading-none font-bold text-white tabular-nums">
            <span className="block text-[0.6rem] tracking-[0.2em] text-plum-300">HARI INI</span>
            <span className="mt-1 block text-2xl">
{today.slice(8, 10)}/{today.slice(5, 7)}</span>
          </div>
          <p className="kicker relative">{memories.data.length > 0 ? "Zy This Date" : "Kegiatan terbaru"}</p>
          <h2 className="relative mt-2 pr-20 text-3xl font-bold leading-tight">
            {memories.data.length > 0 ? "Hari ini, di tahun-tahun sebelumnya" : "Yang baru saja Fritzy lakukan"}
          </h2>
          <ol className="relative mt-6 space-y-1">
            {(memories.data.length > 0 ? memories.data : recent.data.slice(0, 5)).map((m) => (
              <li key={m.id} className="grid grid-cols-[4.5rem_1fr] gap-3 rounded-xl px-2 py-2.5 hover:bg-mist">
                <span className="font-display text-xl font-bold text-plum-600 tabular-nums">
                  {memories.data.length > 0 ? m.date.slice(0, 4) : formatShortDate(m.date)}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink-faint">{m.type}</span>
                  <span className="block font-medium leading-snug text-ink">{m.title}</span>
                </span>
              </li>
            ))}
            {recent.data.length === 0 && memories.data.length === 0 && (
              <li className="rounded-xl bg-mist p-4 text-sm text-ink-soft">Rekap kegiatan akan muncul setelah sinkronisasi dengan sheet rekap.</li>
            )}
          </ol>
          <Link href="/kegiatan" className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold text-plum-700 hover:text-plum-900">
            Semua kegiatan <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          <p className="sr-only">Fritzy&apos;s World</p>
          {[
            { href: "/fritzy", icon: Sparkles, title: "Profil", text: "Kenalan lebih dekat dengan Fritzy.", stat: p?.tagline || "Profil", big: true },
            { href: "/diskografi", icon: Disc3, title: "Diskografi", text: "Setlist, single, MV, dan penampilan.", stat: `${totals.data.setlists + c.discography} entri` },
            { href: "/timeline", icon: Trophy, title: "Timeline", text: "Momen & pencapaian penting.", stat: `${c.timeline} momen` },
            { href: "/kegiatan", icon: CalendarDays, title: "Kegiatan", text: "Teater, video call, off-air, dan lainnya.", stat: `${c.activities} catatan` },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cx(
                "group relative flex min-h-44 flex-col overflow-hidden rounded-[2rem] p-6 ring-1 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
                t.big ? "bg-plum-600 text-white ring-plum-700" : "bg-white text-ink ring-line",
              )}
            >
              {t.big && <div aria-hidden className="bg-stripes absolute inset-0 [--stripe-color:rgb(255_255_255/0.07)]" />}
              <div className="relative flex items-start justify-between">
                <span className={cx("grid size-11 place-items-center rounded-xl", t.big ? "bg-white text-plum-700" : "bg-plum-50 text-plum-700")}>
                  <t.icon className="size-5" aria-hidden />
                </span>
                <span className={cx("rounded-full px-3 py-1 text-xs font-bold", t.big ? "bg-white/15" : "bg-mist text-ink-soft ring-1 ring-line")}>{t.stat}</span>
              </div>
              <h3 className="relative mt-auto pt-6 text-2xl font-bold">{t.title}</h3>
              <p className={cx("relative mt-1 text-sm", t.big ? "text-plum-100" : "text-ink-soft")}>{t.text}</p>
              <ArrowUpRight className="absolute right-6 bottom-6 size-5 opacity-40 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────── Jadwal + Berita ───────────── */}
      <section className="shell mt-16 grid gap-4 lg:grid-cols-12" aria-label="Jadwal dan berita">
        <div className="rounded-[2rem] bg-mist p-6 ring-1 ring-line [--ticket-bg:var(--color-mist)] sm:p-8 lg:col-span-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="kicker">Jadwal</p>
              <h2 className="mt-2 text-3xl font-bold">Jadwal terdekat</h2>
            </div>
            <Link href="/jadwal" className="inline-flex items-center gap-1 text-sm font-bold text-plum-700 hover:text-plum-900">
              Semua <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_15rem]">
          <div className="space-y-3">
            {upcoming.data.length > 0 ? (
              upcoming.data.map((e) => <EventTicket key={e.id} event={e} compact />)
            ) : (
              <div className="ticket flex items-center gap-4 p-5">
                <CalendarDays className="size-8 shrink-0 text-plum-300" aria-hidden />
                <p className="text-sm text-ink-soft">
                  Belum ada jadwal yang diumumkan. Sambil menunggu, lihat <Link href="/jadwal?waktu=lalu" className="font-semibold text-plum-700 underline underline-offset-4">arsip jadwal</Link>{" "}
                  atau <Link href="/kegiatan" className="font-semibold text-plum-700 underline underline-offset-4">rekap kegiatan</Link>.
                </p>
              </div>
            )}
          </div>
          <MonthCalendar year={Number(today.slice(0, 4))} month={Number(today.slice(5, 7))} today={today} days={calendar.data} className="self-start" />
          </div>
        </div>

        <div className="flex flex-col rounded-[2rem] border border-line bg-white p-6 sm:p-8 lg:col-span-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="kicker">Berita & artikel</p>
              <h2 className="mt-2 text-3xl font-bold">Kabar terbaru</h2>
            </div>
            <Link href="/berita" className="inline-flex items-center gap-1 text-sm font-bold text-plum-700 hover:text-plum-900">
              Semua <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          {posts.data.items.length > 0 ? (
            <ul className="mt-6 flex-1 divide-y divide-line">
              {posts.data.items.map((post, i) => {
                const cover = mediaUrl(post.cover_key);
                return (
                  <li key={post.id} className={cx("group relative", i === 0 ? "pb-5" : "py-4")}>
                    {i === 0 && (
                      <div className="mb-4 aspect-[16/9] overflow-hidden rounded-2xl bg-plum-50">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                        ) : (
                          <div className="bg-stripes grid size-full place-items-center">
                            <PenLine className="size-8 text-plum-300" aria-hidden />
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs font-semibold text-ink-faint">
                      <span className="text-plum-700">{POST_CATEGORIES[post.category] ?? post.category}</span> · {formatDate(post.published_at)}
                    </p>
                    <Link href={`/berita/${post.slug}`} className={cx("mt-1 block font-display font-semibold leading-snug text-ink after:absolute after:inset-0 group-hover:text-plum-800", i === 0 ? "text-xl" : "text-base")}>
                      {post.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="bg-stripes mt-6 flex flex-1 flex-col items-start justify-end rounded-2xl p-6 ring-1 ring-line">
              <PenLine className="size-8 text-plum-500" aria-hidden />
              <p className="mt-3 font-display text-xl font-semibold">Redaksi sedang menulis.</p>
              <p className="mt-1 text-sm text-ink-soft">Artikel dan pengumuman Fritzy Force akan tampil di sini.</p>
            </div>
          )}
        </div>
      </section>

      {/* ───────────── Fanwall ───────────── */}
      <section aria-labelledby="fanwall-preview" className="relative mt-16 overflow-hidden bg-plum-50 py-14">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0" />
        <div className="shell relative">
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
            <div className="mb-4 break-inside-avoid rounded-[1.5rem] bg-plum-950 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum-300">Fanwall</p>
              <h2 id="fanwall-preview" className="mt-2 text-3xl font-bold leading-tight">Pesan dari ZyFriends</h2>
              <p className="mt-2 text-sm text-plum-200">
                {notes.data.total > 0 ? `${notes.data.total} pesan sudah ditempel untuk Fritzy.` : "Jadilah yang pertama menempelkan pesan untuk Fritzy."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href="/fanwall#tulis" variant="inverse" size="sm">
                  <MessageCircleHeart className="size-4" aria-hidden /> Tulis pesan
                </ButtonLink>
                <ButtonLink href="/fanwall" variant="ghost" size="sm" className="text-white ring-1 ring-white/20 hover:bg-white/10">
                  Lihat semua
                </ButtonLink>
              </div>
            </div>
            {notes.data.items.map((n, i) => (
              <FanNote key={n.id} note={n} index={i} />
            ))}
            {notes.data.items.length < 3 &&
              ["Ceritakan momen teater favoritmu.", "Kirim semangat sebelum show berikutnya.", "Ucapkan terima kasih untuk Fritzy."].slice(0, 3 - notes.data.items.length).map((prompt, i) => (
                <Link
                  key={prompt}
                  href="/fanwall#tulis"
                  className={cx(
                    "mb-4 flex min-h-36 break-inside-avoid flex-col justify-between rounded-[1.25rem] border-2 border-dashed border-plum-200 bg-white/70 p-5 text-ink-soft transition-colors hover:border-plum-400 hover:text-plum-800",
                    i % 2 ? "sm:rotate-[0.5deg]" : "sm:-rotate-[0.5deg]",
                  )}
                >
                  <span className="text-sm font-semibold">Ide pesan</span>
                  <span className="font-display text-lg leading-snug">{prompt}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ───────────── Galeri + Eksplorasi ───────────── */}
      <section aria-labelledby="eksplorasi" className="shell mt-16 grid gap-4 lg:grid-cols-12">
        <div className="rounded-[2rem] border border-line bg-white p-6 sm:p-8 lg:col-span-5">
          <p className="kicker">Eksplorasi komunitas</p>
          <h2 id="eksplorasi" className="mt-2 text-3xl font-bold leading-tight">Lebih dari sekadar fanbase</h2>
          <p className="mt-3 text-ink-soft">
            {settings.exploreIntro || "Kenali Fritzy Force, komunitas yang tergabung bersama kami, tim esport, dan dokumentasi project yang sudah kami jalankan."}
          </p>
          <ul className="mt-6 grid gap-2">
            {[
              { href: "/tentang", icon: Users, title: "Tentang Fritzy Force", text: "Siapa kami & komunitas kami" },
              { href: "/esport", icon: Trophy, title: "Esport", text: "Tim esport Fritzy Force" },
              { href: "/galeri", icon: Images, title: "Galeri", text: `${c.photos} foto project & kegiatan` },
              { href: "/games", icon: Gamepad2, title: "Games", text: "Puzzle foto Fritzy" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group flex items-center gap-4 rounded-2xl bg-mist p-4 transition-colors hover:bg-plum-50">
                  <l.icon className="size-5 shrink-0 text-plum-600" aria-hidden />
                  <span className="flex-1">
                    <span className="block font-semibold text-ink group-hover:text-plum-800">{l.title}</span>
                    <span className="block text-sm text-ink-soft">{l.text}</span>
                  </span>
                  <ArrowRight className="size-4 text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-80 overflow-hidden rounded-[2rem] lg:col-span-7">
          {photos.data.length > 0 ? (
            <ul className="grid h-full min-h-80 grid-cols-3 grid-rows-2 gap-2">
              {photos.data.map((ph, i) => (
                <li
                  key={ph.id}
                  className={cx(
                    "relative overflow-hidden rounded-2xl bg-plum-50",
                    photos.data.length === 1 && "col-span-3 row-span-2",
                    photos.data.length > 1 && i === 0 && "col-span-2 row-span-2",
                    photos.data.length === 2 && i === 1 && "row-span-2",
                  )}
                >
                  <Link href={`/galeri/${ph.album_slug}`} className="group block size-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(ph.r2_key)!} alt={ph.alt || `Foto dari album ${ph.album_title}`} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    {i === 0 && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-plum-900">{ph.album_title}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Link href="/galeri" className="bg-stripes group flex size-full min-h-80 flex-col justify-end rounded-[2rem] bg-plum-100 p-8 ring-1 ring-plum-200">
              <Images className="size-10 text-plum-600" aria-hidden />
              <p className="mt-4 font-display text-3xl font-bold text-plum-950">Galeri project Fritzy Force</p>
              <p className="mt-1 text-plum-900">Dokumentasi STS, 100 show, dan kegiatan ZyFriends akan dipajang di sini.</p>
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
