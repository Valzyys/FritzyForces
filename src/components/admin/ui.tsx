import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export function AdminPageHeader({ title, description, action, back }: { title: string; description?: ReactNode; action?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-plum-700 hover:text-plum-900">
          <ArrowLeft className="size-4" aria-hidden /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-ink-soft">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Panel({ title, children, description, action }: { title?: string; description?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-6">
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-bold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Flash({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return (
    <p role="status" className="mb-6 flex items-center gap-2 rounded-2xl border border-[#bfe5cf] bg-[#eefaf3] px-4 py-3 text-sm font-medium text-success">
      <CheckCircle2 className="size-4" aria-hidden /> {children}
    </p>
  );
}

/** Tabel responsif: menggulir horizontal di layar kecil tanpa memecah tata letak halaman. */
export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="-mx-5 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-[0.08em] text-ink-faint">
            {head.map((h) => (
              <th key={h} scope="col" className="px-5 py-3 font-semibold sm:px-3 first:sm:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-5 py-3 align-middle sm:px-3 first:sm:pl-0 ${className}`}>{children}</td>;
}
