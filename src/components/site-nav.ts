export const MAIN_NAV = [
  { href: "/fritzy", label: "Fritzy", match: ["/fritzy", "/diskografi", "/timeline", "/kegiatan"] },
  { href: "/jadwal", label: "Jadwal", match: ["/jadwal"] },
  { href: "/berita", label: "Berita", match: ["/berita"] },
  { href: "/galeri", label: "Galeri", match: ["/galeri"] },
  { href: "/fanwall", label: "Fanwall", match: ["/fanwall"] },
  { href: "/games", label: "Games", match: ["/games"] },
  { href: "/tentang", label: "Tentang Kami", match: ["/tentang", "/esport"] },
] as const;

export const FRITZY_TABS = [
  { href: "/fritzy", label: "Profil" },
  { href: "/diskografi", label: "Diskografi" },
  { href: "/timeline", label: "Timeline" },
  { href: "/kegiatan", label: "Kegiatan" },
];

export const ABOUT_TABS = [
  { href: "/tentang", label: "Fritzy Force" },
  { href: "/esport", label: "Esport" },
];
