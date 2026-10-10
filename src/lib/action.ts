import type { z } from "zod";

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  /** Penanda unik agar klien bisa mendeteksi hasil baru walau pesannya sama. */
  at?: number;
};

export const initialState: ActionState = { ok: false, message: "" };

export function success(message: string): ActionState {
  return { ok: true, message, at: Date.now() };
}

export function failure(message: string, errors?: Record<string, string>): ActionState {
  return { ok: false, message, errors, at: Date.now() };
}

export function zodFailure(error: z.ZodError): ActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return failure("Periksa kembali isian yang ditandai.", errors);
}

/** FormData → objek string biasa (field file diabaikan). */
export function formObject(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") out[k] = v;
  return out;
}

export function uploadFailure(err: unknown, field: string): ActionState | null {
  if (err instanceof Error && err.name === "UploadError") return failure(err.message, { [field]: err.message });
  return null;
}
