import { Pin, PinOff } from "lucide-react";
import { all, first } from "@/lib/db";
import type { FanMessage } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { formatDate, formatTime } from "@/lib/time";
import { FanNote } from "@/components/fan-note";
import { ConfirmButton, QuickAction } from "@/components/admin/confirm";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { FilterChips, Pagination, pageParam, strParam } from "@/components/ui";
import { deleteMessage, editMessage, setMessageStatus, togglePin } from "./actions";
import { MessageForm } from "./message-form";

export const metadata = { title: "Fanwall" };
const PER_PAGE = 24;
const TABS = { pending: "Menunggu", approved: "Tampil", hidden: "Disembunyikan" } as const;

export default async function AdminFanwallPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const status = (strParam(sp.status) in TABS ? strParam(sp.status) : "pending") as keyof typeof TABS;
  const page = pageParam(sp.hal);
  const [items, counts, settings] = await Promise.all([
    all<FanMessage>("SELECT * FROM fanwall WHERE status = ? ORDER BY pinned DESC, created_at DESC LIMIT ? OFFSET ?", status, PER_PAGE, (page - 1) * PER_PAGE),
    all<{ status: string; n: number }>("SELECT status, COUNT(*) AS n FROM fanwall GROUP BY status"),
    getSettings(),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;
  const total = await first<{ n: number }>("SELECT COUNT(*) AS n FROM fanwall WHERE status = ?", status);

  return (
    <>
      <AdminPageHeader
        title="Fanwall"
        description={settings.fanwallModeration ? "Moderasi aktif: pesan baru perlu disetujui sebelum tampil." : "Moderasi nonaktif: pesan baru langsung tampil. Ubah di Pengaturan."}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Panel>
          <div className="mb-5">
            <FilterChips label="Status pesan" active={status} items={Object.entries(TABS).map(([v, l]) => ({ label: `${l} (${count(v)})`, value: v, href: `/admin/fanwall?status=${v}` }))} />
          </div>
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-soft">Tidak ada pesan di sini.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {items.map((m) => (
                <li key={m.id} className="rounded-2xl border border-line p-3">
                  <FanNote note={m} />
                  <p className="-mt-2 mb-3 px-1 text-xs text-ink-faint">
                    Dikirim {formatDate(m.created_at)} {formatTime(m.created_at)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {m.status !== "approved" && (
                      <QuickAction action={setMessageStatus.bind(null, m.id, "approved")} variant="primary">
                        Tampilkan
                      </QuickAction>
                    )}
                    {m.status !== "hidden" && <QuickAction action={setMessageStatus.bind(null, m.id, "hidden")}>Sembunyikan</QuickAction>}
                    {m.status === "approved" && (
                      <QuickAction action={togglePin.bind(null, m.id, !m.pinned)} variant="ghost">
                        {m.pinned ? <PinOff className="size-4" aria-hidden /> : <Pin className="size-4" aria-hidden />}
                        {m.pinned ? "Lepas sematan" : "Sematkan"}
                      </QuickAction>
                    )}
                    <details className="w-full">
                      <summary className="cursor-pointer text-sm font-semibold text-plum-700">Ubah</summary>
                      <div className="mt-3">
                        <MessageForm action={editMessage.bind(null, m.id)} message={m} />
                      </div>
                    </details>
                    <ConfirmButton action={deleteMessage.bind(null, m.id)} title="Hapus pesan ini?" />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Pagination page={page} total={total?.n ?? 0} perPage={PER_PAGE} href={(n) => `/admin/fanwall?status=${status}${n > 1 ? `&hal=${n}` : ""}`} />
        </Panel>
        <Panel title="Tambah pesan" description="Untuk memasukkan pesan dari kanal lain (mis. form offline). Langsung tampil.">
          <MessageForm action={editMessage.bind(null, null)} />
        </Panel>
      </div>
    </>
  );
}
