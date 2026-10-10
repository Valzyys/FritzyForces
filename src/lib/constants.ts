// Konstanta yang aman dipakai di komponen klien maupun server.

export const EVENT_CATEGORIES: Record<string, string> = {
  theater: "Teater",
  "video-call": "Video Call",
  offair: "Off-Air",
  event: "Event",
  live: "Live (admin)",
  lainnya: "Lainnya",
};

/** Kategori yang tidak ditampilkan di jadwal publik (sesuai spesifikasi: live hanya untuk admin). */
export const PRIVATE_EVENT_CATEGORIES = ["live"];

export const EVENT_STATUS: Record<string, string> = {
  scheduled: "Terjadwal",
  postponed: "Ditunda",
  cancelled: "Dibatalkan",
};

export const DISCO_TYPES: Record<string, string> = {
  setlist: "Setlist",
  single: "Single",
  coupling: "Coupling",
  mv: "Music Video",
  "special-mv": "Special MV",
  performance: "Performance",
  offair: "Off-Air",
  notable: "Notable",
};

export const POST_CATEGORIES: Record<string, string> = {
  berita: "Berita",
  artikel: "Artikel",
  pengumuman: "Pengumuman",
};

export const FANWALL_THEMES = ["lilac", "plum", "cream", "ink"] as const;
export type FanwallTheme = (typeof FANWALL_THEMES)[number];

