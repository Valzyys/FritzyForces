export type LabelValue = { label: string; value: string };
export type LinkItem = { label: string; url: string };

export function parseJsonArray<T>(raw: string | null | undefined): T[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

/** Baris "Label | Nilai" dari textarea admin → array pasangan. */
export function parsePairs(text: string): LabelValue[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: label.trim(), value: rest.join("|").trim() };
    })
    .filter((p) => p.label && p.value)
    .slice(0, 40);
}

export function pairsToText(items: { label: string; value?: string; url?: string }[]): string {
  return items.map((i) => `${i.label} | ${i.value ?? i.url ?? ""}`).join("\n");
}
