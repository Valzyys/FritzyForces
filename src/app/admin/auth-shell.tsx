import Link from "next/link";
import { LogoMark } from "@/components/logo";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh bg-mist lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-plum-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute -right-32 -bottom-32 size-[30rem] rounded-full border border-white/10" />
        <div aria-hidden className="absolute -right-10 -bottom-10 size-72 rounded-full border border-white/10" />
        <Link href="/" className="relative inline-flex items-center gap-3">
          <LogoMark className="size-10" />
          <span className="font-display text-xl font-bold">Fritzy Force</span>
        </Link>
        <p className="relative max-w-sm font-display text-4xl font-bold leading-tight">Ruang kerja admin Fritzy Force.</p>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 inline-flex items-center gap-2.5 lg:hidden">
            <LogoMark className="size-9" />
            <span className="font-display text-lg font-bold">Fritzy Force</span>
          </Link>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 mb-8 text-ink-soft">{description}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
