import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { POST_CATEGORIES, listPublishedPosts } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { PostCard } from "@/components/content";
import { EmptyState, ErrorNotice, FilterChips, PageHeader, Pagination, pageParam, strParam } from "@/components/ui";

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
  const list = await safeQuery(() => listPublishedPosts({ page, perPage: PER_PAGE, category: category || undefined }), { items: [], total: 0 });
  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams({ ...(category && { kategori: category }), ...over });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `/berita?${s}` : "/berita";
  };
  const [lead, ...rest] = list.data.items;

  return (
    <>
      <PageHeader kicker="Berita & Artikel" title="Kabar dari Fritzy Force" />
      <div className="shell py-10">
        <FilterChips
          label="Kategori berita"
          active={category}
          items={[{ label: "Semua", value: "", href: qs({ kategori: "", hal: "" }) }, ...Object.entries(POST_CATEGORIES).map(([value, label]) => ({ label, value, href: qs({ kategori: value, hal: "" }) }))]}
        />
        <div className="mt-10">
          {list.failed ? (
            <ErrorNotice />
          ) : !lead ? (
            <EmptyState title="Belum ada tulisan" icon={<Newspaper className="size-5" aria-hidden />}>
              Berita dan artikel akan tampil di sini setelah dipublikasikan.
            </EmptyState>
          ) : (
            <>
              <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {page === 1 ? <PostCard post={lead} featured /> : <PostCard post={lead} />}
                {rest.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
              <Pagination page={page} total={list.data.total} perPage={PER_PAGE} href={(n) => qs({ hal: n > 1 ? String(n) : "" })} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
