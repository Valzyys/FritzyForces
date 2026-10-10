/**
 * Wordmark sementara FritzyForce. Bila admin mengunggah logo resmi (Pengaturan → Logo),
 * file itu bisa menggantikan komponen ini.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="12" fill="var(--color-plum-600)" />
      <path d="M12 11h13v4.2h-8.4v3.3h7.4v4.1h-7.4V29H12z" fill="#fff" />
      <circle cx="28.5" cy="27" r="2.6" fill="var(--color-plum-200)" />
    </svg>
  );
}

export function Wordmark({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className="size-9" />
      <span className="font-display text-lg font-bold leading-none tracking-tight text-ink">{name}</span>
    </span>
  );
}
