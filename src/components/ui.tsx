import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ChevronLeft, ChevronRight, CloudOff, Inbox } from "lucide-react";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "inverse";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-plum-600 text-white hover:bg-plum-700 active:bg-plum-800 shadow-[0_1px_0_rgb(255_255_255/0.15)_inset]",
  secondary: "bg-white text-plum-800 border border-line-strong hover:border-plum-300 hover:bg-plum-50",
  ghost: "text-plum-700 hover:bg-plum-50",
  danger: "bg-white text-danger border border-[#f0c6cf] hover:bg-[#fdf2f4]",
  inverse: "bg-white text-plum-900 hover:bg-plum-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.95rem] gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cx(
    "inline-flex select-none items-center justify-center rounded-full font-semibold whitespace-nowrap",
    "transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-55",
    variants[variant],
    sizes[size],
    extra,
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Badge({ children, tone = "plum", className }: { children: ReactNode; tone?: "plum" | "neutral" | "danger" | "warning" | "success" | "solid"; className?: string }) {
  const tones = {
    plum: "bg-plum-50 text-plum-800 ring-plum-200",
    neutral: "bg-mist text-ink-soft ring-line",
    danger: "bg-[#fdf2f4] text-danger ring-[#f0c6cf]",
    warning: "bg-[#fff8e6] text-warning ring-[#f1dfb0]",
    success: "bg-[#eefaf3] text-success ring-[#bfe5cf]",
    solid: "bg-plum-600 text-white ring-plum-600",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  children,
}: {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-mist">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-plum-100/70" />
      <div aria-hidden className="pointer-events-none absolute right-24 top-20 size-24 rounded-full border border-plum-200" />
      <div className="shell relative py-12 sm:py-16">
        {kicker && <p className="kicker animate-fade">{kicker}</p>}
        <h1 className="mt-3 max-w-3xl animate-rise text-4xl font-bold leading-[1.05] text-ink sm:text-5xl">{title}</h1>
        {description && <div className="mt-4 max-w-2xl animate-rise text-lg leading-relaxed text-ink-soft [animation-delay:60ms]">{description}</div>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}

export function SectionHeading({
  kicker,
  title,
  action,
  description,
}: {
  kicker?: string;
  title: ReactNode;
  action?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {kicker && <p className="kicker">{kicker}</p>}
        <h2 className="mt-2 text-3xl font-bold leading-tight text-ink sm:text-[2.35rem]">{title}</h2>
        {description && <p className="mt-3 text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-mist px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-white text-plum-600 ring-1 ring-line">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-ink">{title}</p>
      {children && <div className="mt-1.5 max-w-md text-sm text-ink-soft">{children}</div>}
    </div>
  );
}

export function ErrorNotice({ children }: { children?: ReactNode }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-2xl border border-[#f0c6cf] bg-[#fdf2f4] px-4 py-3 text-sm text-danger">
      <CloudOff className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{children ?? "Data belum bisa dimuat saat ini. Coba muat ulang halaman sebentar lagi."}</p>
    </div>
  );
}

export function Pagination({
  page,
  total,
  perPage,
  href,
}: {
  page: number;
  total: number;
  perPage: number;
  href: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  const prev = page > 1 ? href(page - 1) : null;
  const next = page < pages ? href(page + 1) : null;
  const linkCls = "inline-flex h-10 items-center gap-1 rounded-full px-4 text-sm font-semibold";
  return (
    <nav aria-label="Navigasi halaman" className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
      {prev ? (
        <Link href={prev} className={cx(linkCls, "text-plum-700 hover:bg-plum-50")} rel="prev">
          <ChevronLeft className="size-4" aria-hidden /> Sebelumnya
        </Link>
      ) : (
        <span className={cx(linkCls, "text-ink-faint/60")} aria-hidden>
          <ChevronLeft className="size-4" /> Sebelumnya
        </span>
      )}
      <p className="text-sm text-ink-faint">
        Halaman <span className="font-semibold text-ink">{page}</span> dari {pages}
      </p>
      {next ? (
        <Link href={next} className={cx(linkCls, "text-plum-700 hover:bg-plum-50")} rel="next">
          Berikutnya <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={cx(linkCls, "text-ink-faint/60")} aria-hidden>
          Berikutnya <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}

export function FilterChips({
  items,
  active,
  label,
}: {
  items: { label: string; href: string; value: string }[];
  active: string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {items.map((item) => {
        const on = item.value === active;
        return (
          <Link
            key={item.value}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={cx(
              "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors",
              on ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-line hover:text-plum-800 hover:ring-plum-200",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Ambil angka halaman dari query string dengan aman. */
export function pageParam(value: string | string[] | undefined): number {
  const n = Number.parseInt(Array.isArray(value) ? value[0] : (value ?? "1"), 10);
  return Number.isFinite(n) && n > 0 && n < 10_000 ? n : 1;
}

export function strParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}
