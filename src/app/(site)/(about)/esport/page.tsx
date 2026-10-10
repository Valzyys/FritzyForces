import type { Metadata } from "next";
import { getProfile } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { mediaUrl } from "@/lib/url";
import { ProfileBody } from "@/components/profile-sections";
import { ErrorNotice, PageHeader } from "@/components/ui";
import { ExploreGrid } from "@/components/explore-grid";

export const metadata: Metadata = {
  title: "Esport",
  description: "Tim esport Fritzy Force.",
  alternates: { canonical: "/esport" },
};

export default async function EsportPage() {
  const profile = await safeQuery(() => getProfile("esport"), null);
  const p = profile.data;
  const image = mediaUrl(p?.image_key);
  return (
    <>
      <PageHeader kicker="Esport" ghost="GG" title={p?.tagline || p?.name || "Fritzy Force Esport"} description={p?.summary || "Divisi esport Fritzy Force."} />
      {image && (
        <div className="shell -mt-px pt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={`Tim ${p?.name ?? "esport"}`} className="aspect-[21/9] w-full rounded-[1.5rem] object-cover" />
        </div>
      )}
      <div className="shell py-14">
        {profile.failed ? <ErrorNotice /> : p && <ProfileBody profile={p} />}
        <ExploreGrid keys={["tentang", "games", "fanwall", "galeri"]} />
      </div>
    </>
  );
}
