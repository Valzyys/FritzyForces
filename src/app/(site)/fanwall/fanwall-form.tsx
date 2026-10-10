"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { initialState } from "@/lib/action";
import { NOTE_THEMES } from "@/components/fan-note";
import { Button, cx } from "@/components/ui";
import { submitFanMessage } from "./actions";

export function FanwallForm() {
  const [state, action, pending] = useActionState(submitFanMessage, initialState);
  // Setelah berhasil, key berubah sehingga isian form dipasang ulang (kosong).
  const resetKey = state.ok ? state.at : 0;

  useEffect(() => {
    if (!state.at) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form key={resetKey} action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="fw-name" className="field-label">Nama panggilan</label>
        <input id="fw-name" name="name" maxLength={40} required autoComplete="nickname" className="field-input" aria-invalid={Boolean(state.errors?.name)} aria-describedby={state.errors?.name ? "fw-name-err" : undefined} />
        {state.errors?.name && <p id="fw-name-err" className="field-error">{state.errors.name}</p>}
      </div>
      <div>
        <label htmlFor="fw-message" className="field-label">Pesan untuk Fritzy</label>
        <MessageArea error={state.errors?.message} />
      </div>
      <fieldset>
        <legend className="field-label">Warna kartu</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(NOTE_THEMES).map(([value, t], i) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="theme" value={value} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-ink-soft ring-1 ring-line peer-checked:text-plum-800 peer-checked:ring-2 peer-checked:ring-plum-500 peer-focus-visible:outline-2 peer-focus-visible:outline-plum-600">
                <span className={cx("size-4 rounded-full ring-1 ring-black/10", t.swatch)} aria-hidden />
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {/* Honeypot anti-spam: disembunyikan dari pengguna */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        <Send className="size-4" aria-hidden /> {pending ? "Mengirim…" : "Kirim pesan"}
      </Button>
    </form>
  );
}

function MessageArea({ error }: { error?: string }) {
  const [length, setLength] = useState(0);
  return (
    <>
      <textarea
        id="fw-message"
        name="message"
        rows={5}
        maxLength={500}
        required
        onChange={(e) => setLength(e.target.value.length)}
        className="field-input resize-y"
        aria-invalid={Boolean(error)}
        aria-describedby="fw-message-hint"
      />
      <p id="fw-message-hint" className={cx("field-hint flex justify-between", error && "text-danger")}>
        <span>{error ?? "Tulis dengan sopan, ya. Pesan bersifat publik."}</span>
        <span className="tabular-nums">{length}/500</span>
      </p>
    </>
  );
}
