import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { all, first } from "@/lib/db";
import { POST_CATEGORIES, type Post } from "@/lib/data";
import { formatDate } from "@/lib/time";
import { ConfirmButton, QuickAction } from "@/components/admin/confirm";
import { AdminPageHeader, DataTable, Flash, Panel, Td } from "@/components/admin/ui";
import { Badge, ButtonLink, FilterChips, Pagination, pageParam, strParam } from "@/components/ui";
import { deletePost, setPostStatus } from "./actions";

export const metadata = { title: "Berita" };
const PER_PAGE = 20;

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const page = pageParam(sp.hal);
  const status = ["draft", "published"].includes(strParam(sp.status)) ? strParam(sp.status) : "";
  const q = strParam(sp.q).trim().slice(0, 80);
  const where: string[] = [];
  const params: string[] = [];
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  if (q) {
    where.push("title LIKE ?");
    params.push(`%${q.replace(/[%_]/g, "")}%`);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [items, total] = await Promise.all([
    all<Post>(`SELECT id, slug, title, excerpt, '' AS body, category, cover_key, status, published_at, updated_at FROM posts ${clause} ORDER BY COALESCE(published_at, created_at) DESC LIMIT ? OFFSET ?`, ...params, PER_PAGE, (page - 1) * PER_PAGE),
    first<{ n: number }>(`SELECT COUNT(*) AS n FROM posts ${clause}`, ...params),
  ]);
  const qs = (o: Record<string, string>) => {
    const p = new URLSearchParams({ ...(status && { status }), ...(q && { q }), ...o });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `/admin/berita?${s}` : "/admin/berita";
  };
  const now = new Date().toISOString();

  return (
    <>
      <AdminPageHeader
        title="Berita & artikel"
        action={
          <ButtonLink href="/admin/berita/baru" size="sm">
            <Plus className="size-4" aria-hidden /> Tulis berita
          </ButtonLink>
        }
      />
      <Flash show={strParam(sp.saved) === "1"}>Berita disimpan.</Flash>
      <Panel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <FilterChips
            label="Status"
            active={status}
            items={[
              { label: "Semua", value: "", href: qs({ status: "", hal: "" }) },
              { label: "Terbit", value: "published", href: qs({ status: "published", hal: "" }) },
              { label: "Draf", value: "draft", href: qs({ status: "draft", hal: "" }) },
            ]}
          />
          <form role="search" className="flex gap-2" action="/admin/berita">
            {status && <input type="hidden" name="status" value={status} />}
            <label htmlFor="q" className="sr-only">Cari judul</label>
            <input id="q" name="q" defaultValue={q} placeholder="Cari judul…" className="field-input h-9 w-48 py-1.5" />
          </form>
        </div>
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-soft">Tidak ada berita.</p>
        ) : (
          <DataTable head={["Judul", "Kategori", "Status", "Terbit", ""]}>
            {items.map((p) => {
              const scheduled = p.status === "published" && p.published_at && p.published_at > now;
              return (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/admin/berita/${p.id}`} className="font-semibold hover:text-plum-700">{p.title}</Link>
                  </Td>
                  <Td className="text-ink-soft">{POST_CATEGORIES[p.category] ?? p.category}</Td>
                  <Td>
                    <Badge tone={p.status === "published" ? (scheduled ? "warning" : "success") : "neutral"}>
                      {p.status === "published" ? (scheduled ? "Terjadwal" : "Terbit") : "Draf"}
                    </Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-ink-soft">{formatDate(p.published_at)}</Td>
                  <Td className="whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-2">
                      {p.status === "published" && !scheduled && (
                        <Link href={`/berita/${p.slug}`} target="_blank" className="grid size-9 place-items-center rounded-full text-ink-faint hover:bg-plum-50 hover:text-plum-700" aria-label="Lihat di situs">
                          <ExternalLink className="size-4" aria-hidden />
                        </Link>
                      )}
                      <QuickAction action={setPostStatus.bind(null, p.id, p.status === "published" ? "draft" : "published")}>
                        {p.status === "published" ? "Tarik" : "Terbitkan"}
                      </QuickAction>
                      <ConfirmButton action={deletePost.bind(null, p.id)} title="Hapus berita ini?" />
                    </div>
                  </Td>
                </tr>
              );
            })}
          </DataTable>
        )}
        <Pagination page={page} total={total?.n ?? 0} perPage={PER_PAGE} href={(n) => qs({ hal: n > 1 ? String(n) : "" })} />
      </Panel>
    </>
  );
}
