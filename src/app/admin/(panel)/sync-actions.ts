"use server";

import { revalidatePath } from "next/cache";
import { failure, success, type ActionState } from "@/lib/action";
import { requireAdmin } from "@/lib/auth";
import { syncRecap, syncTheater } from "@/lib/sync/run";

export async function runTheaterSync(): Promise<ActionState> {
  await requireAdmin();
  const r = await syncTheater();
  revalidatePath("/", "layout");
  return r.ok ? success(r.message) : failure(r.message);
}

export async function runRecapSync(): Promise<ActionState> {
  await requireAdmin();
  const r = await syncRecap();
  revalidatePath("/", "layout");
  return r.ok ? success(r.message) : failure(r.message);
}
