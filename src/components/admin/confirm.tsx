"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { ActionState } from "@/lib/action";
import { Button } from "@/components/ui";

/** Tombol aksi berbahaya dengan dialog konfirmasi native (<dialog>). */
export function ConfirmButton({
  action,
  label = "Hapus",
  title = "Hapus item ini?",
  description = "Tindakan ini tidak bisa dibatalkan.",
  confirmLabel = "Ya, hapus",
  variant = "danger",
  icon = true,
  size = "sm",
}: {
  action: () => Promise<ActionState>;
  label?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  variant?: "danger" | "secondary";
  icon?: boolean;
  size?: "sm" | "md";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();

  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => ref.current?.showModal()}>
        {icon && <Trash2 className="size-4" aria-hidden />} {label}
      </Button>
      <dialog
        ref={ref}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-[1.25rem] bg-white p-0 shadow-[var(--shadow-lift)] backdrop:bg-plum-950/50 open:animate-rise"
        aria-labelledby="confirm-title"
      >
        <div className="p-6">
          <h2 id="confirm-title" className="text-xl font-bold text-ink">
            {title}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">{description}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => ref.current?.close()} autoFocus>
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              className={variant === "danger" ? "bg-danger hover:bg-[#951b37]" : undefined}
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await action();
                  ref.current?.close();
                  if (res.ok) toast.success(res.message);
                  else toast.error(res.message);
                })
              }
            >
              {pending ? "Memproses…" : confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}

/** Tombol aksi cepat tanpa konfirmasi (mis. setujui pesan). */
export function QuickAction({ action, children, variant = "secondary" }: { action: () => Promise<ActionState>; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await action();
          if (res.ok) toast.success(res.message);
          else toast.error(res.message);
        })
      }
    >
      {children}
    </Button>
  );
}
