"use client";

import { createContext, useActionState, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { initialState, type ActionState } from "@/lib/action";
import { Button, cx } from "@/components/ui";

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

const ErrorsCtx = createContext<Record<string, string> | undefined>(undefined);

export function AdminForm({
  action,
  children,
  submitLabel = "Simpan",
  resetOnSuccess = false,
  className,
}: {
  action: Action;
  children: ReactNode;
  submitLabel?: string;
  resetOnSuccess?: boolean;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.at) return;
    if (state.ok) {
      toast.success(state.message);
      if (resetOnSuccess) ref.current?.reset();
    } else toast.error(state.message);
  }, [state, resetOnSuccess]);

  return (
    <ErrorsCtx.Provider value={state.errors}>
      <form ref={ref} action={formAction} className={cx("space-y-5", className)} noValidate>
        {children}
        <div className="flex items-center gap-3 border-t border-line pt-5">
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan…" : submitLabel}
          </Button>
          {state.at && !state.ok && state.message && (
            <p role="alert" className="text-sm font-medium text-danger">
              {state.message}
            </p>
          )}
        </div>
      </form>
    </ErrorsCtx.Provider>
  );
}

function useFieldError(name: string) {
  return useContext(ErrorsCtx)?.[name];
}

type BaseProps = { name: string; label: string; hint?: ReactNode; required?: boolean; className?: string };

export function TextField({
  name,
  label,
  hint,
  required,
  className,
  ...rest
}: BaseProps & Omit<React.ComponentProps<"input">, "name">) {
  const error = useFieldError(name);
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-danger" aria-hidden>*</span>}
      </label>
      <input id={id} name={name} required={required} className="field-input" aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-d` : undefined} {...rest} />
      {(error || hint) && (
        <p id={`${id}-d`} className={error ? "field-error" : "field-hint"}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  name,
  label,
  hint,
  required,
  className,
  ...rest
}: BaseProps & Omit<React.ComponentProps<"textarea">, "name">) {
  const error = useFieldError(name);
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-danger" aria-hidden>*</span>}
      </label>
      <textarea id={id} name={name} required={required} className="field-input resize-y" aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-d` : undefined} {...rest} />
      {(error || hint) && (
        <p id={`${id}-d`} className={error ? "field-error" : "field-hint"}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  name,
  label,
  hint,
  options,
  className,
  ...rest
}: BaseProps & { options: Record<string, string> } & Omit<React.ComponentProps<"select">, "name">) {
  const error = useFieldError(name);
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <select id={id} name={name} className="field-input" aria-invalid={Boolean(error)} {...rest}>
        {Object.entries(options).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {(error || hint) && <p className={error ? "field-error" : "field-hint"}>{error ?? hint}</p>}
    </div>
  );
}

export function CheckboxField({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-line p-4">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-plum-600" />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-ink-faint">{hint}</span>}
      </span>
    </label>
  );
}

export function ImageField({
  name,
  label,
  currentUrl,
  hint = "JPG, PNG, WebP, GIF, atau AVIF. Maksimal 8 MB.",
  multiple = false,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
  hint?: string;
  multiple?: boolean;
}) {
  const error = useFieldError(name);
  const [previews, setPreviews] = useState<string[]>([]);
  const [remove, setRemove] = useState(false);
  const id = `f-${name}`;

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p)), [previews]);

  const shown = previews.length ? previews : currentUrl && !remove ? [currentUrl] : [];

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="flex flex-wrap items-start gap-4">
        {shown.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {shown.slice(0, 8).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="Pratinjau" className="size-24 rounded-xl object-cover ring-1 ring-line" />
            ))}
            {shown.length > 8 && <span className="grid size-24 place-items-center rounded-xl bg-mist text-sm text-ink-soft">+{shown.length - 8}</span>}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <input
            id={id}
            type="file"
            name={name}
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple={multiple}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setPreviews(files.map((f) => URL.createObjectURL(f)));
            }}
            className="block w-full text-sm text-ink-soft file:mr-3 file:h-10 file:rounded-full file:border-0 file:bg-plum-50 file:px-4 file:font-semibold file:text-plum-800 hover:file:bg-plum-100"
            aria-invalid={Boolean(error)}
          />
          <p className={error ? "field-error" : "field-hint"}>{error ?? hint}</p>
          {currentUrl && !multiple && (
            <label className="mt-2 inline-flex items-center gap-2 text-sm text-ink-soft">
              <input type="checkbox" name={`${name}_remove`} checked={remove} onChange={(e) => setRemove(e.target.checked)} className="accent-plum-600" />
              Hapus gambar saat ini
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
