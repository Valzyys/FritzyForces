/** Logo resmi Fritzy Force (lambang emas di latar ungu). */
export function LogoMark({ className = "size-9", alt = "" }: { className?: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.webp" alt={alt} width={256} height={256} decoding="async" className={`shrink-0 rounded-xl object-cover ring-1 ring-plum-900/10 ${className}`} />
  );
}

export function Wordmark({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className="size-10" />
      <span className="font-display text-lg font-bold leading-none tracking-tight text-ink">{name}</span>
    </span>
  );
}
