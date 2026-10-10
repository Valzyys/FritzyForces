import Link from "next/link";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-mist px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-[7rem] font-extrabold leading-none text-plum-200">404</p>
        <h1 className="mt-2 text-3xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-ink-soft">Mungkin tautannya sudah berubah, atau halamannya memang belum ada.</p>
        <Link href="/" className={buttonClass("primary", "md", "mt-8")}>
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
