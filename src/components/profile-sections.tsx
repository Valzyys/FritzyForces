import { ArrowUpRight } from "lucide-react";
import type { Profile } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";
import { safeUrl } from "@/lib/url";

/** Bagian isi profil (fanbase / esport): ringkasan, isi Markdown, rincian, dan tautan. */
export function ProfileBody({ profile }: { profile: Profile }) {
  const links = profile.links.map((l) => ({ ...l, url: safeUrl(l.url) })).filter((l) => l.url);
  const hasAside = profile.details.length > 0 || links.length > 0;
  return (
    <div className={hasAside ? "grid gap-12 lg:grid-cols-[1fr_20rem]" : ""}>
      <div>
        {profile.body ? (
          <div className="prose-ff" dangerouslySetInnerHTML={{ __html: renderMarkdown(profile.body) }} />
        ) : (
          <div className="bg-stripes flex min-h-56 flex-col justify-end rounded-[1.5rem] bg-mist p-8 ring-1 ring-line">
            <p className="font-display text-2xl font-bold">Cerita lengkapnya sedang ditulis.</p>
            <p className="mt-2 max-w-md text-ink-soft">Tim sedang menyiapkan isi halaman ini. Sementara itu, jelajahi bagian lain di bawah.</p>
          </div>
        )}
      </div>
      {(profile.details.length > 0 || links.length > 0) && (
        <aside className="space-y-6">
          {profile.details.length > 0 && (
            <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
              {profile.details.map((d) => (
                <div key={d.label} className="px-5 py-3.5">
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">{d.label}</dt>
                  <dd className="mt-1 text-ink">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {links.length > 0 && (
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.url}>
                  <a href={l.url!} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl bg-mist px-5 py-3.5 font-semibold text-plum-800 hover:bg-plum-50">
                    {l.label} <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </div>
  );
}
