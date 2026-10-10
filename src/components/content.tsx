import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import type { Activity, EventRow, Post } from "@/lib/data";
import { EVENT_CATEGORIES, EVENT_STATUS, POST_CATEGORIES } from "@/lib/data";
import { formatDate, formatShortDate, formatTime, formatWeekday } from "@/lib/time";
import { mediaUrl, safeUrl } from "@/lib/url";
import { Badge, cx } from "./ui";

export function EventTicket({ event, compact = false }: { event: EventRow; compact?: boolean }) {
  const d = new Date(event.starts_at);
  const day = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit" }).format(d);
  const month = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", month: "short" }).format(d);
  const link = safeUrl(event.url);
  const statusTone = event.status === "cancelled" ? "danger" : event.status === "postponed" ? "warning" : null;
  return (
    <article className="ticket flex overflow-visible">
      <div className="flex w-20 shrink-0 flex-col items-center justify-center px-2 py-4 text-center sm:w-24">
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-plum-700">{month}</span>
        <span className="font-display text-4xl font-bold leading-none text-ink">{day}</span>
        <span className="mt-1 text-xs text-ink-faint">{formatWeekday(event.starts_at).slice(0, 3)}</span>
      </div>
      <div className="ticket-divider min-w-0 flex-1 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{EVENT_CATEGORIES[event.category] ?? event.category}</Badge>
          {statusTone && <Badge tone={statusTone}>{EVENT_STATUS[event.status]}</Badge>}
        </div>
        <h3 className={cx("mt-2 font-display font-semibold leading-snug text-ink", compact ? "text-lg" : "text-xl")}>
          {event.title}
        </h3>
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
          <div className="inline-flex items-center gap-1.5">
            <dt className="sr-only">Waktu</dt>
            <Clock className="size-3.5 text-plum-500" aria-hidden />
            <dd>
              {formatTime(event.starts_at)}
              {event.ends_at ? ` – ${formatTime(event.ends_at)}` : ""}
            </dd>
          </div>
          {event.location && (
            <div className="inline-flex items-center gap-1.5">
              <dt className="sr-only">Lokasi</dt>
              <MapPin className="size-3.5 text-plum-500" aria-hidden />
              <dd>{event.location}</dd>
            </div>
          )}
        </dl>
        {!compact && event.description && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{event.description}</p>}
        {!compact && link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-plum-700 hover:text-plum-900">
            Info selengkapnya <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        )}
      </div>
    </article>
  );
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const cover = mediaUrl(post.cover_key);
  return (
    <article className={cx("group relative flex flex-col", featured && "md:col-span-2 md:grid md:grid-cols-2 md:gap-8")}>
      <div className={cx("relative overflow-hidden rounded-[var(--radius-card)] bg-plum-50", featured ? "aspect-[4/3]" : "aspect-[16/10]")}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="bg-stripes grid size-full place-items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" className="size-20 rounded-2xl opacity-90" />
          </div>
        )}
      </div>
      <div className={cx("mt-4", featured && "md:mt-0 md:self-center")}>
        <div className="flex items-center gap-2 text-sm text-ink-faint">
          <span className="font-semibold text-plum-700">{POST_CATEGORIES[post.category] ?? post.category}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
        </div>
        <h3 className={cx("mt-2 font-display font-semibold leading-snug text-ink", featured ? "text-3xl" : "text-xl")}>
          <Link href={`/berita/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-plum-800">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 leading-relaxed text-ink-soft">{post.excerpt}</p>}
      </div>
    </article>
  );
}

export function ActivityItem({ item, showYear = false }: { item: Activity; showYear?: boolean }) {
  const link = safeUrl(item.link_url);
  return (
    <li className="relative grid grid-cols-[4.5rem_1fr] gap-4 py-4 sm:grid-cols-[6rem_1fr]">
      <time dateTime={item.date} className="pt-0.5 text-sm font-semibold text-ink-soft">
        {showYear ? formatDate(item.date) : formatShortDate(item.date)}
      </time>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{item.type}</Badge>
          {item.location && <span className="text-xs text-ink-faint">{item.location}</span>}
        </div>
        <p className="mt-1.5 font-medium leading-snug text-ink">{item.title}</p>
        {item.notes && <p className="mt-1 text-sm text-ink-soft">{item.notes}</p>}
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-plum-700 hover:text-plum-900">
            {item.link_label || "Lihat tautan"} <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        )}
      </div>
    </li>
  );
}
