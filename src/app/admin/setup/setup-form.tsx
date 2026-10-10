"use client";

import { useActionState } from "react";
import { initialState } from "@/lib/action";
import { Button } from "@/components/ui";
import { setupFirstAdmin } from "../auth-actions";

const FIELDS = [
  { name: "token", label: "Token setup", type: "password", auto: "off", hint: "Nilai secret ADMIN_SETUP_TOKEN di Cloudflare." },
  { name: "name", label: "Nama", type: "text", auto: "name" },
  { name: "email", label: "Email", type: "email", auto: "username" },
  { name: "password", label: "Password", type: "password", auto: "new-password", hint: "Minimal 12 karakter." },
  { name: "confirm", label: "Ulangi password", type: "password", auto: "new-password" },
];

export function SetupForm() {
  const [state, action, pending] = useActionState(setupFirstAdmin, initialState);
  return (
    <form action={action} className="space-y-5" noValidate>
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="field-label">{f.label}</label>
          <input id={f.name} name={f.name} type={f.type} autoComplete={f.auto} required className="field-input" aria-invalid={Boolean(state.errors?.[f.name])} />
          {state.errors?.[f.name] ? <p className="field-error">{state.errors[f.name]}</p> : f.hint && <p className="field-hint">{f.hint}</p>}
        </div>
      ))}
      {state.at && !state.ok && (
        <p role="alert" className="rounded-xl bg-[#fdf2f4] px-4 py-3 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Membuat akun…" : "Buat admin"}
      </Button>
    </form>
  );
}
