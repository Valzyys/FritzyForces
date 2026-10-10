import type { Metadata } from "next";
import { MessageCircleHeart } from "lucide-react";
import { listApprovedMessages } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { FanNote } from "@/components/fan-note";
import { EmptyState, ErrorNotice, PageHeader, Pagination, StatStrip, pageParam } from "@/components/ui";
import { FanwallForm } from "./fanwall-form";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Fanwall",
  description: "Dinding pesan dukungan ZyFriends untuk Fritzy.",
  alternates: { canonical: "/fanwall" },
};

const PER_PAGE = 24;

export default async function FanwallPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const page = pageParam((await searchParams).hal);
  const [list, settings] = await Promise.all([
    safeQuery(() => listApprovedMessages(page, PER_PAGE), { items: [], total: 0 }),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader
        kicker="Fanwall"
        title="Pesan untuk Fritzy"
        description="Ucapan, dukungan, dan cerita kecil dari ZyFriends."
        aside={<StatStrip items={[{ value: list.data.total, label: "Pesan tertempel" }, { value: settings.fanwallModeration ? "Aktif" : "Bebas", label: "Moderasi" }]} />}
      />
      <div className="shell grid grid-cols-1 gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-label="Pesan-pesan" className="bg-dots order-2 rounded-[1.5rem] bg-plum-50/60 p-4 sm:p-5 lg:order-1">
          {list.failed ? (
            <ErrorNotice />
          ) : list.data.items.length === 0 ? (
            <EmptyState title="Belum ada pesan" icon={<MessageCircleHeart className="size-5" aria-hidden />}>
              Jadilah yang pertama menulis untuk Fritzy.
            </EmptyState>
          ) : (
            <>
              <div className="columns-1 gap-4 sm:columns-2">
                {list.data.items.map((n, i) => (
                  <FanNote key={n.id} note={n} index={i} />
                ))}
              </div>
              <Pagination page={page} total={list.data.total} perPage={PER_PAGE} href={(n) => (n > 1 ? `/fanwall?hal=${n}` : "/fanwall")} />
            </>
          )}
        </section>
        <aside id="tulis" aria-labelledby="tulis-judul" className="order-1 lg:order-2">
          <div className="card p-6 lg:sticky lg:top-24">
            <h2 id="tulis-judul" className="text-2xl font-bold">Tulis pesan</h2>
            <p className="mt-1 mb-6 text-sm text-ink-soft">
              {settings.fanwallModeration ? "Pesan akan tampil setelah ditinjau admin." : "Pesan langsung tampil setelah dikirim."}
            </p>
            <FanwallForm />
          </div>
        </aside>
      </div>
    </>
  );
}
