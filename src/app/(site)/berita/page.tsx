import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import Link from "next/link";
import { POST_CATEGORIES, listPublishedPosts, recentActivities } from "@/lib/data";
import { all } from "@/lib/db";
import { safeQuery } from "@/lib/db";
import { PostCard } from "@/components/content";
import { ErrorNotice, FilterChips, PageHeader, Pagination, StatStrip, pageParam, strParam } from "@/components/ui";
import { formatShortDate } from "@/lib/time";

export const metadata: Metadata = {
  title: "Berita & Artikel",
  description: "Berita, artikel, dan pengumuman terbaru dari Fritzy Force.",
  alternates: { canonical: "/berita" },
};

const PER_PAGE = 9;

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const page = pageParam(sp.hal);
  const category = strParam(sp.kategori) in POST_CATEGORIES ? strParam(sp.kategori) : "";
  const [list, catCounts, recent] = await Promise.all([
    safeQuery(() => listPublishedPosts({ page, perPage: PER_PAGE, category: category || undefined }), { items: [], total: 0 }),
    safeQuery(() => all<{ category: string; n: number }>("SELECT category, COUNT(*) AS n FROM posts WHERE status = 'published' AND published_at <= ? GROUP BY category", new Date().toISOString()), []),
    safeQuery(() => recentActivities(5), []),
  ]);
  const totalPosts = catCounts.data.reduce((a, b) => a + b.n, 0);
  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams({ ...(category && { kategori: category }), ...over });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `/berita?${s}` : "/berita";
  };
  const [lead, ...rest] = list.data.items;

  return (
    <>
      <PageHeader
        kicker="Berita & Artikel"
        title="Kabar dari Fritzy Force"
        description="Pengumuman, liputan project, dan tulisan dari tim."
        aside={<StatStrip items={[{ value: totalPosts, label: "Tulisan" }, ...Object.entries(POST_CATEGORIES).map(([k, l]) => ({ value: catCounts.data.find((c) => c.category === k)?.n ?? 0, label: l }))]} />}
      />
      <div className="shell grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
        <FilterChips
          label="Kategori berita"
          active={category}
          items={[{ label: "Semua", value: "", href: qs({ kategori: "", hal: "" }) }, ...Object.entries(POST_CATEGORIES).map(([value, label]) => ({ label, value, href: qs({ kategori: value, hal: "" }) }))]}
        />
        <div className="mt-10">
          {list.failed ? (
            <ErrorNotice />
          ) : !lead ? (
            <div className="bg-stripes flex min-h-72 flex-col justify-end rounded-[1.5rem] bg-mist p-8 ring-1 ring-line">
              <Newspaper className="size-9 text-plum-500" aria-hidden />
              <p className="mt-4 font-display text-3xl font-bold">Redaksi sedang menulis.</p>
              <p className="mt-2 max-w-md text-ink-soft">Berita dan artikel akan tampil di sini setelah dipublikasikan.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
                {page === 1 && rest.length !== 1 ? <PostCard post={lead} featured /> : <PostCard post={lead} />}
                {rest.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
              <Pagination page={page} total={list.data.total} perPage={PER_PAGE} href={(n) => qs({ hal: n > 1 ? String(n) : "" })} />
            </>
          )}
        </div>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Sorotan">
          <div className="rounded-[1.5rem] bg-plum-950 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum-300">Jejak Fritzy</p>
            <ul className="mt-3 space-y-3">
              {recent.data.map((a) => (
                <li key={a.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                  <p className="text-xs font-semibold text-plum-300">{a.type} · {formatShortDate(a.date)}</p>
                  <p className="mt-0.5 text-sm font-medium leading-snug">{a.title}</p>
                </li>
              ))}
            </ul>
            <Link href="/kegiatan" className="mt-4 inline-block text-sm font-bold text-plum-200 hover:text-white">Rekap lengkap →</Link>
          </div>
          <Link href="/fanwall#tulis" className="bg-stripes block rounded-[1.5rem] bg-plum-100 p-5 ring-1 ring-plum-200 hover:ring-plum-400">
            <p className="font-display text-xl font-bold text-plum-950">Punya cerita untuk Fritzy?</p>
            <p className="mt-1 text-sm text-plum-900">Tempel pesanmu di fanwall →</p>
          </Link>
        </aside>
      </div>
    </>
  );
}
