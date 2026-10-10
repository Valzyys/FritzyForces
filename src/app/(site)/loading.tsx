export default function Loading() {
  return (
    <div className="shell py-16" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat…</span>
      <div className="h-4 w-28 animate-pulse rounded-full bg-plum-100" />
      <div className="mt-4 h-12 w-2/3 animate-pulse rounded-2xl bg-plum-50" />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-[var(--radius-card)] bg-mist" />
        ))}
      </div>
    </div>
  );
}
