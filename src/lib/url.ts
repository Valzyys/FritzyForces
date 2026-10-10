/** Hanya izinkan URL http(s) agar tautan dari CMS tidak bisa berupa javascript: dsb. */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const u = new URL(value.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  return `/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** ID video YouTube dari berbagai bentuk URL, untuk embed youtube-nocookie. */
export function youtubeId(url: string | null | undefined): string | null {
  const safe = safeUrl(url);
  if (!safe) return null;
  const u = new URL(safe);
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
  if (host === "youtube.com" || host === "music.youtube.com") {
    if (u.pathname === "/watch") return u.searchParams.get("v");
    const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/);
    if (m) return m[1];
  }
  return null;
}
