"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./ui";

export function SubNav({ items, label }: { items: { href: string; label: string }[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="border-b border-line bg-white">
      <ul className="shell flex gap-1 overflow-x-auto [scrollbar-width:none]">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "relative inline-flex h-12 items-center px-3 text-sm font-semibold whitespace-nowrap transition-colors",
                  active ? "text-plum-800" : "text-ink-faint hover:text-ink",
                )}
              >
                {item.label}
                {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-plum-600" aria-hidden />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
