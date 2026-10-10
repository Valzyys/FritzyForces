"use server";

import { revalidatePath } from "next/cache";
import { failure, success, type ActionState } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { importRecapCsv } from "@/lib/sync/run";
import { parseTabConfig } from "@/lib/sync/recap";

const MAX_CSV = 2 * 1024 * 1024;

export async function importCsv(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const tab = String(form.get("tab") ?? "").trim();
  const file = form.get("file");
  if (!tab) return failure("Isi nama tab.", { tab: "Contoh: 2026 atau Show Recap" });
  if (!file || typeof file === "string" || file.size === 0) return failure("Pilih file CSV.", { file: "File CSV wajib dipilih." });
  if (file.size > MAX_CSV) return failure("File terlalu besar (maks. 2 MB).", { file: "Maksimal 2 MB." });
  const text = await file.text();
  if (text.includes("\u0000")) return failure("File bukan CSV teks.", { file: "File tidak valid." });
  try {
    const n = await importRecapCsv(tab, text);
    revalidatePath("/", "layout");
    return success(`${n} baris dari tab "${tab}" diimpor.`);
  } catch (err) {
    return failure(err instanceof Error ? err.message : "Impor gagal.");
  }
}

export async function saveTabConfig(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const value = String(form.get("tabs") ?? "").trim();
  const tabs = parseTabConfig(value);
  if (tabs.length === 0) return failure("Format tidak valid.", { tabs: "Contoh: 2026:1122575285, Show Recap:1688586017" });
  await setSetting("recap_tabs", tabs.map((t) => `${t.name}:${t.gid}`).join(", "));
  return success(`${tabs.length} tab disimpan.`);
}
