import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { POST_CATEGORIES, getPublishedPost } from "@/lib/data";
import { plainText, renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/time";
import { mediaUrl } from "@/lib/url";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug).catch(() => null);
  if (!post) return { title: "Berita tidak ditemukan" };
  const cover = mediaUrl(post.cover_key);
  const description = post.excerpt || plainText(post.body);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/berita/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const cover = mediaUrl(post.cover_key);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image: cover ? `${siteUrl()}${cover}` : undefined,
    mainEntityOfPage: `${siteUrl()}/berita/${post.slug}`,
  };

  return (
    <article className="pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="shell max-w-3xl pt-12">
        <Link href="/berita" className="inline-flex items-center gap-1.5 text-sm font-semibold text-plum-700 hover:text-plum-900">
          <ArrowLeft className="size-4" aria-hidden /> Berita
        </Link>
        <p className="mt-8 flex items-center gap-2 text-sm text-ink-faint">
          <span className="font-semibold text-plum-700">{POST_CATEGORIES[post.category] ?? post.category}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-[1.08] sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-5 text-xl leading-relaxed text-ink-soft">{post.excerpt}</p>}
      </header>
      {cover && (
        <div className="shell mt-10 max-w-5xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" className="aspect-[16/9] w-full rounded-[1.5rem] object-cover" />
        </div>
      )}
      <div className="shell mt-10 max-w-3xl">
        <div className="prose-ff" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      </div>
    </article>
  );
}
