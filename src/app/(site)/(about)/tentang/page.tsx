import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getProfile, listCommunities, type Community } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { mediaUrl, safeUrl } from "@/lib/url";
import { ProfileBody } from "@/components/profile-sections";
import { ErrorNotice, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Mengenal Fritzy Force, komunitas yang tergabung, serta aliansi tempat kami bernaung.",
  alternates: { canonical: "/tentang" },
};

export default async function AboutPage() {
  const [profile, communities] = await Promise.all([
    safeQuery(() => getProfile("fanbase"), null),
    safeQuery(() => listCommunities(), []),
  ]);
  const p = profile.data;
  const alliances = communities.data.filter((c) => c.kind === "aliansi");
  const groups = communities.data.filter((c) => c.kind !== "aliansi");
  const logo = mediaUrl(p?.image_key);

  return (
    <>
      <PageHeader kicker="Tentang Kami" title={p?.tagline || p?.name || "Fritzy Force"} description={p?.summary || undefined}>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={`Logo ${p?.name ?? "Fritzy Force"}`} className="size-20 rounded-2xl object-cover ring-1 ring-line" />
        )}
      </PageHeader>
      <div className="shell py-14">
        {profile.failed ? <ErrorNotice /> : p && <ProfileBody profile={p} />}

        {groups.length > 0 && (
          <section aria-labelledby="komunitas" className="mt-20">
            <p className="kicker">Komunitas</p>
            <h2 id="komunitas" className="mt-2 text-3xl font-bold">Komunitas di Fritzy Force</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((c) => (
                <CommunityCard key={c.id} c={c} />
              ))}
            </ul>
          </section>
        )}

        {alliances.length > 0 && (
          <section aria-labelledby="aliansi" className="mt-20 rounded-[2rem] bg-plum-950 p-6 text-white sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum-300">Aliansi</p>
            <h2 id="aliansi" className="mt-2 text-3xl font-bold">Bagian dari</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {alliances.map((c) => {
                const url = safeUrl(c.url);
                const logoUrl = mediaUrl(c.logo_key);
                const inner = (
                  <>
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="" className="size-14 rounded-xl bg-white object-contain p-1" />
                    ) : (
                      <span className="grid size-14 place-items-center rounded-xl bg-white/10 font-display text-xl font-bold">{c.name.slice(0, 1)}</span>
                    )}
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-display text-xl font-semibold">
                        {c.name} {url && <ArrowUpRight className="size-4 text-plum-300" aria-hidden />}
                      </span>
                      {c.description && <span className="mt-1 block text-sm text-plum-200">{c.description}</span>}
                    </span>
                  </>
                );
                return (
                  <li key={c.id}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 hover:bg-white/10">
                        {inner}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function CommunityCard({ c }: { c: Community }) {
  const url = safeUrl(c.url);
  const logo = mediaUrl(c.logo_key);
  return (
    <li className="card flex flex-col p-5">
      <div className="flex items-center gap-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="size-12 rounded-xl object-cover ring-1 ring-line" />
        ) : (
          <span className="grid size-12 place-items-center rounded-xl bg-plum-50 font-display text-lg font-bold text-plum-700">{c.name.slice(0, 1)}</span>
        )}
        <h3 className="font-display text-lg font-semibold text-ink">{c.name}</h3>
      </div>
      {c.description && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.description}</p>}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-plum-700 hover:text-plum-900">
          Kunjungi <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
      )}
    </li>
  );
}
