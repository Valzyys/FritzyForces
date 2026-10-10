/** Semua tampilan waktu memakai zona Asia/Jakarta (WIB). */
export const TZ = "Asia/Jakarta";
const WIB_OFFSET = "+07:00";

const dateFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, day: "numeric", month: "long", year: "numeric" });
const dayFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, weekday: "long" });
const shortFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const partsFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = parseDateish(iso);
  return d ? dateFmt.format(d) : "";
}

export function formatShortDate(iso: string): string {
  const d = parseDateish(iso);
  return d ? shortFmt.format(d) : "";
}

export function formatWeekday(iso: string): string {
  const d = parseDateish(iso);
  return d ? dayFmt.format(d) : "";
}

export function formatTime(iso: string): string {
  const d = parseDateish(iso);
  return d ? `${timeFmt.format(d).replace(".", ":")} WIB` : "";
}

/** "YYYY-MM-DD" dibaca sebagai tengah hari WIB agar tidak bergeser tanggal. */
function parseDateish(value: string): Date | null {
  const v = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00${WIB_OFFSET}` : value;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Nilai input datetime-local ("YYYY-MM-DDTHH:mm") yang diisi dalam WIB → ISO UTC. */
export function wibLocalToIso(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const d = new Date(`${local}:00${WIB_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO UTC → nilai untuk input datetime-local dalam WIB. */
export function isoToWibLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = Object.fromEntries(partsFmt.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Tanggal kalender hari ini di WIB, "YYYY-MM-DD". */
export function todayWib(now = new Date()): string {
  return isoToWibLocal(now.toISOString()).slice(0, 10);
}

const MONTHS: Record<string, number> = {
  january: 1, februari: 2, february: 2, januari: 1, march: 3, maret: 3, april: 4, may: 5, mei: 5,
  june: 6, juni: 6, july: 7, juli: 7, august: 8, agustus: 8, september: 9, october: 10, oktober: 10,
  november: 11, december: 12, desember: 12,
};

export function monthNumber(name: string): number | null {
  return MONTHS[name.trim().toLowerCase()] ?? null;
}

export function toIsoDate(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCMonth() !== month - 1) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Tanggal + jam dari API teater → ISO UTC. Menerima ISO lengkap, atau tanggal
 * "YYYY-MM-DD" ditambah jam "HH:mm" yang diasumsikan WIB.
 */
export function combineWib(date: string, time?: string | null): string | null {
  if (!date) return null;
  if (/T\d{2}:\d{2}/.test(date)) {
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(date);
    const d = new Date(hasZone ? date : `${date}${WIB_OFFSET}`);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const day = date.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const hm = time?.match(/(\d{1,2})[:.](\d{2})/);
  const hh = hm ? hm[1].padStart(2, "0") : "00";
  const mm = hm ? hm[2] : "00";
  return wibLocalToIso(`${day}T${hh}:${mm}`);
}
