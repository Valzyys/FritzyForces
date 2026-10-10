import { describe, expect, it } from "vitest";
import { combineWib, isoToWibLocal, toIsoDate, wibLocalToIso, monthNumber } from "@/lib/time";
import { parseCsv } from "@/lib/csv";
import { parseShowRecapTab, parseTabConfig, parseYearTab } from "@/lib/sync/recap";
import { sniffImage } from "@/lib/images";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { safeUrl, youtubeId, mediaUrl } from "@/lib/url";
import { slugify } from "@/lib/slug";
import { renderMarkdown } from "@/lib/markdown";
import { parsePairs } from "@/lib/json";

describe("waktu WIB", () => {
  it("mengonversi datetime-local WIB ke UTC dan kembali", () => {
    expect(wibLocalToIso("2026-10-14T19:00")).toBe("2026-10-14T12:00:00.000Z");
    expect(isoToWibLocal("2026-10-14T12:00:00.000Z")).toBe("2026-10-14T19:00");
    expect(wibLocalToIso("bukan tanggal")).toBeNull();
  });
  it("menggabungkan tanggal + jam API teater", () => {
    expect(combineWib("2026-10-14", "19:00")).toBe("2026-10-14T12:00:00.000Z");
    expect(combineWib("2026-10-14T19:00:00+07:00")).toBe("2026-10-14T12:00:00.000Z");
    expect(combineWib("", "19:00")).toBeNull();
  });
  it("memvalidasi tanggal kalender", () => {
    expect(toIsoDate(2026, 2, 30)).toBeNull();
    expect(toIsoDate(2024, 2, 29)).toBe("2024-02-29");
    expect(monthNumber("Desember")).toBe(12);
    expect(monthNumber("May")).toBe(5);
  });
});

describe("parser rekap Google Sheets", () => {
  it("parseCsv menangani kutip, koma, dan baris baru", () => {
    expect(parseCsv('a,"b, c","d ""e"""\n1,"x\ny",3')).toEqual([
      ["a", "b, c", 'd "e"'],
      ["1", "x\ny", "3"],
    ]);
  });
  it("membaca tab tahunan & mengambil URL tautan", () => {
    const csv = [
      "Month,Date,Activity,Description,Total,Location,Notes,Link Attachment",
      'December,17,Concert,JKT48 12th Anniversary Concert,1,Surabaya,Debut,Video,https://youtu.be/abc',
      "Februari,30,Other,Tanggal tidak valid,,,,",
      ",,,,,,,",
    ].join("\n");
    const rows = parseYearTab(csv, 2023);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ date: "2023-12-17", type: "Concert", linkLabel: "Video", linkUrl: "https://youtu.be/abc" });
  });
  it("menolak header yang tidak dikenali", () => {
    expect(() => parseYearTab("A,B\n1,2", 2024)).toThrow();
  });
  it("membaca tab Show Recap", () => {
    const csv = "Year,Month,Date,Show,Total,Total Show,Unit Song 1,Unit Song 2,Line Up\n2024,March,1,Aitakatta,1,1,Nageki no Figure (1),,\"Fritzy, Lily\"";
    expect(parseShowRecapTab(csv)[0]).toEqual({
      date: "2024-03-01", show: "Aitakatta", showCount: 1, totalShow: 1, unitSongs: ["Nageki no Figure (1)"], lineup: "Fritzy, Lily",
    });
  });
  it("membaca konfigurasi tab", () => {
    expect(parseTabConfig("2026:112, Show Recap:9, rusak")).toEqual([
      { name: "2026", gid: "112" },
      { name: "Show Recap", gid: "9" },
    ]);
  });
});

describe("validasi gambar dari byte", () => {
  it("mengenali PNG beserta ukurannya", () => {
    const png = new Uint8Array(32);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    new DataView(png.buffer).setUint32(16, 640);
    new DataView(png.buffer).setUint32(20, 480);
    expect(sniffImage(png)).toMatchObject({ mime: "image/png", width: 640, height: 480 });
  });
  it("menolak file non-gambar walau bernama .jpg", () => {
    expect(sniffImage(new TextEncoder().encode("<script>alert(1)</script>"))).toBeNull();
  });
});

describe("keamanan", () => {
  it("hash password PBKDF2 dapat diverifikasi", async () => {
    const h = await hashPassword("kata-sandi-panjang");
    expect(h.startsWith("pbkdf2$100000$")).toBe(true);
    expect(await verifyPassword("kata-sandi-panjang", h)).toBe(true);
    expect(await verifyPassword("salah", h)).toBe(false);
    expect(await verifyPassword("x", "rusak")).toBe(false);
  });
  it("hanya mengizinkan URL http(s)", () => {
    expect(safeUrl("javascript:alert(1)")).toBeNull();
    expect(safeUrl("https://jkt48.com")).toBe("https://jkt48.com/");
  });
  it("Markdown tidak meloloskan HTML mentah", () => {
    const html = renderMarkdown("<img src=x onerror=alert(1)> [a](javascript:alert(1))");
    expect(html).not.toContain("<img");
    expect(html).not.toContain('href="javascript');
  });
});

describe("utilitas", () => {
  it("slugify", () => expect(slugify("Cara Meminum Ramune! (Gen 12)")).toBe("cara-meminum-ramune-gen-12"));
  it("youtubeId", () => {
    expect(youtubeId("https://youtu.be/MTbhA6TjxWU?si=x")).toBe("MTbhA6TjxWU");
    expect(youtubeId("https://www.youtube.com/watch?v=abc123")).toBe("abc123");
    expect(youtubeId("https://example.com/watch?v=abc")).toBeNull();
  });
  it("mediaUrl meng-encode setiap segmen", () => expect(mediaUrl("u/a b/c.png")).toBe("/media/u/a%20b/c.png"));
  it("parsePairs", () => expect(parsePairs("Generasi | 12\nrusak\n")).toEqual([{ label: "Generasi", value: "12" }]));
});
