"use client";

import { useActionState } from "react";
import { initialState } from "@/lib/action";
import { Button } from "@/components/ui";
import { login } from "../auth-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field-input" aria-invalid={Boolean(state.errors?.email)} />
        {state.errors?.email && <p className="field-error">{state.errors.email}</p>}
      </div>
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field-input" aria-invalid={Boolean(state.errors?.password)} />
        {state.errors?.password && <p className="field-error">{state.errors.password}</p>}
      </div>
      {state.at && !state.ok && (
        <p role="alert" className="rounded-xl bg-[#fdf2f4] px-4 py-3 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Memeriksa…" : "Masuk"}
      </Button>
    </form>
  );
}
