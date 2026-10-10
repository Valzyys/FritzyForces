import { parseCsv } from "../csv";
import { monthNumber, toIsoDate } from "../time";

/**
 * Parser untuk sheet "Fritzy Rosmerian − Recap".
 * Tab tahunan (2023, 2024, …) berkolom: Month | Date | Activity | Description | Total | Location | Notes | Link Attachment
 * Tab "Show Recap" berkolom: Year | Month | Date | Show | Total | Total Show | Unit Song 1..4 | Line Up
 */

export type ActivityRow = {
  date: string;
  type: string;
  title: string;
  total: string;
  location: string;
  notes: string;
  linkLabel: string;
  linkUrl: string;
};

export type ShowRecapRow = {
  date: string;
  show: string;
  showCount: number | null;
  totalShow: number | null;
  unitSongs: string[];
  lineup: string;
};

const clean = (v: string | undefined) => (v ?? "").replace(/\s+/g, " ").trim();
const int = (v: string | undefined) => {
  const n = Number.parseInt(clean(v), 10);
  return Number.isFinite(n) ? n : null;
};

function headerIndex(header: string[], name: string): number {
  return header.findIndex((h) => clean(h).toLowerCase() === name.toLowerCase());
}

export function parseYearTab(csv: string, year: number): ActivityRow[] {
  const rows = parseCsv(csv);
  if (rows.length === 0) return [];
  const header = rows[0];
  const col = {
    month: headerIndex(header, "Month"),
    date: headerIndex(header, "Date"),
    activity: headerIndex(header, "Activity"),
    description: headerIndex(header, "Description"),
    total: headerIndex(header, "Total"),
    location: headerIndex(header, "Location"),
    notes: headerIndex(header, "Notes"),
    link: headerIndex(header, "Link Attachment"),
  };
  if (col.month < 0 || col.date < 0 || col.activity < 0 || col.description < 0) {
    throw new Error(`Header tab ${year} tidak dikenali (butuh kolom Month, Date, Activity, Description).`);
  }

  const out: ActivityRow[] = [];
  for (const r of rows.slice(1)) {
    const month = monthNumber(clean(r[col.month]));
    const day = int(r[col.date]);
    const title = clean(r[col.description]);
    if (!month || !day || !title) continue;
    const date = toIsoDate(year, month, day);
    if (!date) continue;
    const linkCells = col.link >= 0 ? r.slice(col.link) : [];
    const url = linkCells.map(clean).find((c) => /^https?:\/\//i.test(c)) ?? "";
    const label = col.link >= 0 ? clean(r[col.link]) : "";
    out.push({
      date,
      type: clean(r[col.activity]) || "Other",
      title,
      total: col.total >= 0 ? clean(r[col.total]) : "",
      location: col.location >= 0 ? clean(r[col.location]) : "",
      notes: col.notes >= 0 ? clean(r[col.notes]) : "",
      linkLabel: /^https?:\/\//i.test(label) ? "" : label,
      linkUrl: url,
    });
  }
  return out;
}

export function parseShowRecapTab(csv: string): ShowRecapRow[] {
  const rows = parseCsv(csv);
  if (rows.length === 0) return [];
  const header = rows[0];
  const col = {
    year: headerIndex(header, "Year"),
    month: headerIndex(header, "Month"),
    date: headerIndex(header, "Date"),
    show: headerIndex(header, "Show"),
    total: headerIndex(header, "Total"),
    totalShow: headerIndex(header, "Total Show"),
    lineup: headerIndex(header, "Line Up"),
  };
  if (col.year < 0 || col.month < 0 || col.date < 0 || col.show < 0) {
    throw new Error("Header tab Show Recap tidak dikenali (butuh kolom Year, Month, Date, Show).");
  }
  const unitCols = header
    .map((h, i) => (/^unit song/i.test(clean(h)) ? i : -1))
    .filter((i) => i >= 0);

  const out: ShowRecapRow[] = [];
  for (const r of rows.slice(1)) {
    const year = int(r[col.year]);
    const month = monthNumber(clean(r[col.month]));
    const day = int(r[col.date]);
    const show = clean(r[col.show]);
    if (!year || !month || !day || !show) continue;
    const date = toIsoDate(year, month, day);
    if (!date) continue;
    out.push({
      date,
      show,
      showCount: col.total >= 0 ? int(r[col.total]) : null,
      totalShow: col.totalShow >= 0 ? int(r[col.totalShow]) : null,
      unitSongs: unitCols.map((i) => clean(r[i])).filter(Boolean),
      lineup: col.lineup >= 0 ? clean(r[col.lineup]) : "",
    });
  }
  return out;
}

export type RecapTab = { name: string; gid: string };

/** Format pengaturan: "2023:0, 2024:669588543, Show Recap:1688586017" */
export function parseTabConfig(value: string): RecapTab[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const idx = part.lastIndexOf(":");
      return { name: part.slice(0, idx).trim(), gid: part.slice(idx + 1).trim() };
    })
    .filter((t) => t.name && /^\d+$/.test(t.gid));
}

export const DEFAULT_RECAP_TABS = "2023:0, 2024:669588543, 2025:1721165265, 2026:1122575285, Show Recap:1688586017";

export function isShowRecapTab(name: string): boolean {
  return /show\s*recap/i.test(name);
}
