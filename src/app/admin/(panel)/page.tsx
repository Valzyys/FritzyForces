import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { all, first, safeQuery } from "@/lib/db";
import { getEnv } from "@/lib/cf";
import { getNextTheaterShow } from "@/lib/data";
import { describeApiError, getJkt48Client } from "@/lib/sync/run";
import { formatDate, formatTime } from "@/lib/time";
import { safeUrl } from "@/lib/url";
import { QuickAction } from "@/components/admin/confirm";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { runRecapSync, runTheaterSync } from "./sync-actions";

type SyncRun = { kind: string; ok: number; message: string; created_at: string };

async function fritzyLive() {
  const client = await getJkt48Client();
  if (!client) return { error: "JKT48_API_KEY belum diset.", items: [] };
  try {
    const key = (await getEnv()).FRITZY_MEMBER_KEY || "fritzy";
    const live = await client.getLive();
    return {
      error: null,
      items: live.filter((m) => m.url_key?.toLowerCase().includes(key) || m.name?.toLowerCase().includes(key)),
    };
  } catch (err) {
    return { error: describeApiError(err), items: [] };
  }
}

export default async function AdminHome() {
  const admin = await requireAdmin();
  const now = new Date().toISOString();
  const [counts, runs, nextShow, live, recentLive] = await Promise.all([
    safeQuery(
      () =>
        first<{ events: number; posts: number; drafts: number; photos: number; pending: number; activities: number }>(
          `SELECT
             (SELECT COUNT(*) FROM events WHERE starts_at >= ?) AS events,
             (SELECT COUNT(*) FROM posts WHERE status = 'published') AS posts,
             (SELECT COUNT(*) FROM posts WHERE status = 'draft') AS drafts,
             (SELECT COUNT(*) FROM photos) AS photos,
             (SELECT COUNT(*) FROM fanwall WHERE status = 'pending') AS pending,
             (SELECT COUNT(*) FROM activities) AS activities`,
          now,
        ),
      null,
    ),
    safeQuery(
      () =>
        all<SyncRun>(
          `SELECT kind, ok, message, created_at FROM sync_runs WHERE id IN (SELECT MAX(id) FROM sync_runs GROUP BY kind)`,
        ),
      [],
    ),
    safeQuery(() => getNextTheaterShow(), null),
    fritzyLive(),
    safeQuery(
      () =>
        all<{ id: number; date: string; type: string; title: string }>(
          "SELECT id, date, type, title FROM activities WHERE type LIKE '%Live%' ORDER BY date DESC LIMIT 5",
        ),
      [],
    ),
  ]);
  const c = counts.data;
  const stat = [
    { label: "Jadwal mendatang", value: c?.events, href: "/admin/jadwal" },
    { label: "Berita terbit", value: c?.posts, sub: c?.drafts ? `${c.drafts} draf` : undefined, href: "/admin/berita" },
    { label: "Foto galeri", value: c?.photos, href: "/admin/galeri" },
    { label: "Fanwall menunggu", value: c?.pending, href: "/admin/fanwall", highlight: (c?.pending ?? 0) > 0 },
    { label: "Baris rekap kegiatan", value: c?.activities, href: "/admin/kegiatan" },
  ];
  const runOf = (k: string) => runs.data.find((r) => r.kind === k);

  return (
    <>
      <AdminPageHeader title={`Halo, ${admin.name.split(" ")[0]}`} description="Ringkasan konten dan status sinkronisasi otomatis." />
      {counts.failed && (
        <p role="alert" className="mb-6 rounded-2xl border border-[#f0c6cf] bg-[#fdf2f4] px-4 py-3 text-sm text-danger">
          Database belum siap. Jalankan migrasi D1 (lihat README).
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stat.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className={`block rounded-[var(--radius-card)] border bg-white p-4 transition-colors hover:border-plum-300 ${s.highlight ? "border-plum-400" : "border-line"}`}>
              <p className="text-sm text-ink-faint">{s.label}</p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">{s.value ?? "—"}</p>
              {s.sub && <p className="text-xs text-ink-faint">{s.sub}</p>}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Sinkronisasi otomatis" description="Berjalan tiap 3 jam lewat Cron Trigger. Bisa juga dijalankan manual.">
          <ul className="divide-y divide-line">
            {[
              { kind: "theater", label: "Jadwal teater (JKT48Connect)", action: runTheaterSync },
              { kind: "recap", label: "Rekap kegiatan (Google Sheets)", action: runRecapSync },
            ].map((s) => {
              const r = runOf(s.kind);
              return (
                <li key={s.kind} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{s.label}</p>
                    {r ? (
                      <p className="mt-1 text-sm text-ink-soft">
                        <Badge tone={r.ok ? "success" : "danger"}>{r.ok ? "Berhasil" : "Gagal"}</Badge>{" "}
                        <span className="text-ink-faint">{formatDate(r.created_at)} {formatTime(r.created_at)}</span>
                        <span className="mt-1 block break-words">{r.message}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-ink-faint">Belum pernah dijalankan.</p>
                    )}
                  </div>
                  <QuickAction action={s.action}>Sinkron sekarang</QuickAction>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Live Fritzy" description="Hanya terlihat oleh admin — tidak ditampilkan di jadwal publik.">
          {live.error ? (
            <p className="text-sm text-ink-soft">{live.error}</p>
          ) : live.items.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Radio className="size-4 text-ink-faint" aria-hidden /> Fritzy sedang tidak live.
            </p>
          ) : (
            <ul className="space-y-3">
              {live.items.map((m) => {
                const url = safeUrl(m.stream_url);
                return (
                  <li key={`${m.platform}-${m.room_id ?? m.slug}`} className="flex items-center justify-between gap-3 rounded-xl bg-plum-50 p-3">
                    <span>
                      <Badge tone="solid">LIVE</Badge> <span className="font-semibold">{m.platform}</span>
                      {m.title && <span className="block text-sm text-ink-soft">{m.title}</span>}
                    </span>
                    {m.viewers != null && <span className="text-sm text-ink-soft tabular-nums">{m.viewers} penonton</span>}
                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-plum-700" aria-label="Buka siaran">
                        <ArrowUpRight className="size-4" aria-hidden />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {recentLive.data.length > 0 && (
            <>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-ink-faint">Live terakhir (rekap)</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {recentLive.data.map((a) => (
                  <li key={a.id} className="flex justify-between gap-3">
                    <span className="text-ink">{a.title}</span>
                    <span className="shrink-0 text-ink-faint">{formatDate(a.date)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <Panel title="Teater berikutnya">
          {nextShow.data ? (
            <div>
              <p className="font-display text-xl font-semibold">{nextShow.data.title}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {formatDate(nextShow.data.starts_at)} · {formatTime(nextShow.data.starts_at)}
              </p>
              <p className="mt-3 text-sm text-ink-faint">Dipakai untuk hitung mundur di beranda.</p>
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              Belum ada jadwal teater mendatang. Tambahkan manual di{" "}
              <Link href="/admin/jadwal/baru" className="font-semibold text-plum-700 underline underline-offset-4">
                Jadwal
              </Link>{" "}
              atau jalankan sinkronisasi.
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}
