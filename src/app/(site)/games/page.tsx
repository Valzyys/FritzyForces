import type { Metadata } from "next";
import { getProfile } from "@/lib/data";
import { safeQuery } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { mediaUrl } from "@/lib/url";
import { PageHeader } from "@/components/ui";
import { SlidingPuzzle } from "./puzzle";

export const metadata: Metadata = {
  title: "Games",
  description: "Puzzle geser bertema Fritzy untuk ZyFriends.",
  alternates: { canonical: "/games" },
};

export default async function GamesPage() {
  const [settings, profile] = await Promise.all([getSettings(), safeQuery(() => getProfile("fritzy"), null)]);
  const image = mediaUrl(settings.gameImageKey) ?? mediaUrl(profile.data?.image_key);
  return (
    <>
      <PageHeader kicker="Games" title="Puzzle Fritzy" description="Susun kembali potongan foto Fritzy. Siapa yang paling sedikit langkahnya?" />
      <div className="shell py-12">
        <SlidingPuzzle image={image} />
      </div>
    </>
  );
}
