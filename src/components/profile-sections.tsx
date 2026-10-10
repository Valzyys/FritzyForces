import { ArrowUpRight } from "lucide-react";
import type { Profile } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";
import { safeUrl } from "@/lib/url";

/** Bagian isi profil (fanbase / esport): ringkasan, isi Markdown, rincian, dan tautan. */
export function ProfileBody({ profile }: { profile: Profile }) {
  const links = profile.links.map((l) => ({ ...l, url: safeUrl(l.url) })).filter((l) => l.url);
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
      <div>
        {profile.body ? (
          <div className="prose-ff" dangerouslySetInnerHTML={{ __html: renderMarkdown(profile.body) }} />
        ) : (
          <p className="text-ink-soft">Konten halaman ini sedang disiapkan oleh tim.</p>
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
