"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { failure, formObject, success, zodFailure, type ActionState } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { FANWALL_THEMES } from "@/lib/data";
import { run } from "@/lib/db";

function refresh() {
  revalidatePath("/", "layout");
}

export async function setMessageStatus(id: string, status: "approved" | "hidden" | "pending"): Promise<ActionState> {
  await requireAdmin();
  await run("UPDATE fanwall SET status = ? WHERE id = ?", status, id);
  refresh();
  return success(status === "approved" ? "Pesan ditampilkan." : status === "hidden" ? "Pesan disembunyikan." : "Pesan dikembalikan ke antrean.");
}

export async function togglePin(id: string, pinned: boolean): Promise<ActionState> {
  await requireAdmin();
  await run("UPDATE fanwall SET pinned = ? WHERE id = ?", pinned ? 1 : 0, id);
  refresh();
  return success(pinned ? "Pesan disematkan." : "Sematan dilepas.");
}

export async function deleteMessage(id: string): Promise<ActionState> {
  await requireAdmin();
  await run("DELETE FROM fanwall WHERE id = ?", id);
  refresh();
  return success("Pesan dihapus.");
}

const editSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(40),
  message: z.string().trim().min(1, "Pesan wajib diisi.").max(500),
  theme: z.enum(FANWALL_THEMES),
});

export async function editMessage(id: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = editSchema.safeParse(formObject(form));
  if (!parsed.success) return zodFailure(parsed.error);
  const d = parsed.data;
  try {
    if (id) await run("UPDATE fanwall SET name = ?, message = ?, theme = ? WHERE id = ?", d.name, d.message, d.theme, id);
    else await run("INSERT INTO fanwall (id, name, message, theme, status) VALUES (?, ?, ?, ?, 'approved')", crypto.randomUUID(), d.name, d.message, d.theme);
  } catch {
    return failure("Gagal menyimpan pesan.");
  }
  refresh();
  return success(id ? "Pesan diperbarui." : "Pesan ditambahkan.");
}
