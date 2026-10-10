import "server-only";
import { all, run } from "./db";
import type { LinkItem } from "./json";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  socials: LinkItem[];
  fanwallModeration: boolean;
  gameImageKey: string | null;
  exploreIntro: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Fritzy Force",
  tagline: "Fanbase untuk Fritzy JKT48",
  socials: [],
  fanwallModeration: true,
  gameImageKey: null,
  exploreIntro: "",
};

const KEYS: Record<string, keyof SiteSettings> = {
  site_name: "siteName",
  tagline: "tagline",
  socials: "socials",
  fanwall_moderation: "fanwallModeration",
  game_image_key: "gameImageKey",
  explore_intro: "exploreIntro",
};

/** Kunci yang disimpan di tabel settings tetapi tidak dipetakan ke SiteSettings. */
type RawKey = "recap_tabs";

export async function getSettings(): Promise<SiteSettings> {
  const out: SiteSettings = { ...DEFAULT_SETTINGS };
  try {
    const rows = await all<{ key: string; value: string }>("SELECT key, value FROM settings");
    for (const row of rows) {
      const field = KEYS[row.key];
      if (!field) continue;
      try {
        const v = JSON.parse(row.value);
        if (field === "fanwallModeration") out.fanwallModeration = v !== "off";
        else if (field === "socials") out.socials = Array.isArray(v) ? v : [];
        else (out as Record<string, unknown>)[field] = v;
      } catch {
        /* abaikan nilai rusak */
      }
    }
  } catch (err) {
    console.error("[settings] gagal membaca:", err instanceof Error ? err.message : err);
  }
  return out;
}

export async function setSetting(key: keyof typeof KEYS | RawKey, value: unknown): Promise<void> {
  await run(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    key,
    JSON.stringify(value),
    new Date().toISOString(),
  );
}
