import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { DISCO_TYPES, getDisco } from "@/lib/data";
import { plainText, renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/time";
import { mediaUrl, safeUrl, youtubeId } from "@/lib/url";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getDisco(slug).catch(() => null);
  if (!item) return { title: "Diskografi" };
  const cover = mediaUrl(item.cover_key);
  return {
    title: item.title,
    description: plainText(item.description) || `${DISCO_TYPES[item.type] ?? "Diskografi"} — ${item.title}`,
    alternates: { canonical: `/diskografi/${item.slug}` },
    openGraph: cover ? { images: [cover] } : undefined,
  };
}

export default async function DiscoDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getDisco(slug);
  if (!item) notFound();
  const cover = mediaUrl(item.cover_key);
  const yt = youtubeId(item.video_url);
  const links = item.links.map((l) => ({ ...l, url: safeUrl(l.url) })).filter((l) => l.url);

  return (
    <article className="shell py-12">
      <Link href="/diskografi" className="inline-flex items-center gap-1.5 text-sm font-semibold text-plum-700 hover:text-plum-900">
        <ArrowLeft className="size-4" aria-hidden /> Diskografi
      </Link>
      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,20rem)_1fr]">
        <div className="aspect-square overflow-hidden rounded-[var(--radius-card)] bg-plum-50 ring-1 ring-line">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={`Sampul ${item.title}`} className="size-full object-cover" />
          )}
        </div>
        <div>
          <p className="kicker">{DISCO_TYPES[item.type] ?? item.type}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{item.title}</h1>
          {item.release_date && <p className="mt-3 text-ink-soft">{formatDate(item.release_date)}</p>}
          {item.description && <div className="prose-ff mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.description) }} />}
          {links.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {links.map((l) => (
                <li key={l.url}>
                  <a href={l.url!} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-plum-50 px-4 text-sm font-semibold text-plum-800 hover:bg-plum-100">
                    {l.label} <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {yt && (
        <div className="mt-12 aspect-video overflow-hidden rounded-[var(--radius-card)] bg-ink">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}`}
            title={`Video: ${item.title}`}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            className="size-full"
          />
        </div>
      )}
    </article>
  );
}
