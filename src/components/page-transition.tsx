"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MAIN_NAV } from "./site-nav";

type Gsap = typeof import("gsap").gsap;

const PLEATS = 7;
const SUB_LABELS: Record<string, string> = {
  "/diskografi": "Diskografi",
  "/timeline": "Timeline",
  "/kegiatan": "Kegiatan",
  "/esport": "Esport",
};

/** Nomor setlist & nama halaman tujuan, mengikuti penomoran M01–M08 di footer/menu. */
function describe(pathname: string): { no: string; label: string } {
  const nav = [{ href: "/", label: "Beranda", match: ["/"] as readonly string[] }, ...MAIN_NAV];
  const idx = nav.findIndex((n) => (n.href === "/" ? pathname === "/" : n.match.some((m) => pathname === m || pathname.startsWith(`${m}/`))));
  const sub = Object.entries(SUB_LABELS).find(([p]) => pathname === p || pathname.startsWith(`${p}/`));
  return {
    no: `M${String((idx < 0 ? 0 : idx) + 1).padStart(2, "0")}`,
    label: sub ? sub[1] : idx < 0 ? "Fritzy Force" : nav[idx].label,
  };
}

function motionReduced() {
  return document.documentElement.dataset.motion === "reduced";
}

let gsapPromise: Promise<Gsap> | null = null;
function loadGsap(): Promise<Gsap> {
  gsapPromise ??= import("gsap").then((m) => m.gsap);
  return gsapPromise;
}

/** Status navigasi (satu instance komponen per halaman). */
const navState = { covered: false, busy: false, failsafe: 0 };

async function cover(el: HTMLDivElement | null, gsap: Gsap, target: string) {
  if (!el) return;
  const { no, label } = describe(target);
  el.querySelector<HTMLElement>("[data-pt-no]")!.textContent = no;
  el.querySelector<HTMLElement>("[data-pt-label]")!.textContent = label;
  const pleats = el.querySelectorAll<HTMLElement>(".pt-pleat");
  const chars = el.querySelector<HTMLElement>("[data-pt-label]")!;
  gsap.killTweensOf([pleats, el]);
  gsap.set(el, { autoAlpha: 1 });
  gsap.set(pleats, { y: 0, yPercent: -101, transformOrigin: "50% 0%" });
  gsap.set(el.querySelectorAll(".pt-text > *"), { autoAlpha: 0, y: 24 });
  gsap.set(el.querySelector(".pt-hem"), { scaleX: 0 });
  const tl = gsap.timeline();
  tl.to(pleats, { yPercent: 0, duration: 0.55, ease: "expo.inOut", stagger: { each: 0.045, from: "center" } })
    .to(el.querySelector(".pt-hem"), { scaleX: 1, duration: 0.45, ease: "power3.out" }, 0.35)
    .to(el.querySelectorAll(".pt-text > *"), { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out", stagger: 0.06 }, 0.4)
    .fromTo(chars, { letterSpacing: "0.12em" }, { letterSpacing: "-0.04em", duration: 0.7, ease: "expo.out" }, 0.45);
  await tl.then();
}

async function reveal(el: HTMLDivElement | null) {
  if (navState.failsafe) window.clearTimeout(navState.failsafe);
  navState.covered = false;
  navState.busy = false;
  if (!el) return;
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  const gsap = await loadGsap();
  const pleats = el.querySelectorAll<HTMLElement>(".pt-pleat");
  const tl = gsap.timeline({ onComplete: () => void gsap.set(el, { autoAlpha: 0 }) });
  tl.to(el.querySelectorAll(".pt-text > *"), { autoAlpha: 0, y: -20, duration: 0.3, ease: "power2.in", stagger: 0.03 }, 0.05)
    .to(el.querySelector(".pt-hem"), { scaleX: 0, transformOrigin: "100% 50%", duration: 0.3, ease: "power2.in" }, 0.1)
    .set(pleats, { transformOrigin: "50% 0%" }, 0.25)
    .to(pleats, { yPercent: -101, duration: 0.6, ease: "expo.inOut", stagger: { each: 0.045, from: "edges" } }, 0.25);
  void enterContent(0.55);
}

async function enterContent(delay = 0) {
  if (motionReduced()) return;
  const main = document.getElementById("konten");
  if (!main) return;
  const gsap = await loadGsap();
  const blocks = Array.from(main.children).flatMap((c) => (c.tagName === "HEADER" || c.tagName === "SECTION" || c.tagName === "DIV" || c.tagName === "NAV" ? [c] : []));
  gsap.fromTo(
    blocks.slice(0, 6),
    { y: 36, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", stagger: 0.08, delay, clearProps: "transform,opacity,visibility" },
  );
}


/**
 * Transisi halaman "Lagu berikutnya" (GSAP): lipatan tirai turun bergantian, pengumuman
 * nomor setlist & nama halaman tujuan, lalu tirai naik dan konten baru masuk bertahap.
 * Klik link internal dicegat (fase capture) sebelum next/link menavigasi.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const firstPath = useRef(pathname);

  // Muat GSAP saat browser senggang agar klik pertama langsung beranimasi.
  useEffect(() => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) idle(() => void loadGsap());
    else window.setTimeout(() => void loadGsap(), 1200);
  }, []);

  // Cegat klik link internal → tutup tirai → navigasi.
  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // filter/hash di halaman yang sama: tanpa transisi
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/media") || url.pathname.startsWith("/api")) return;
      if (motionReduced() || navState.busy || document.documentElement.dataset.intro !== "seen") return;

      e.preventDefault();
      navState.busy = true;
      const href = url.pathname + url.search + url.hash;
      router.prefetch(href);
      try {
        const gsap = await loadGsap();
        await cover(root.current, gsap, url.pathname);
      } catch {
        /* animasi gagal: tetap navigasi */
      }
      navState.covered = true;
      // Pengaman: bila navigasi tak kunjung selesai, buka tirai sendiri.
      navState.failsafe = window.setTimeout(() => void reveal(root.current), 7000);
      router.push(href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // Halaman baru sudah dirender → buka tirai & animasikan konten masuk.
  useEffect(() => {
    if (pathname === firstPath.current && !navState.covered) return;
    firstPath.current = "";
    if (navState.covered) void reveal(root.current);
    else void enterContent(); // back/forward browser: versi ringan
  }, [pathname]);

  return (
    <div ref={root} className="pt" aria-hidden="true">
      <div className="pt-pleats">
        {Array.from({ length: PLEATS }, (_, i) => (
          <span key={i} className="pt-pleat" />
        ))}
      </div>
      <div className="pt-text">
        <p className="pt-kicker">Lagu berikutnya</p>
        <p className="pt-no" data-pt-no>
          M01
        </p>
        <p className="pt-label" data-pt-label>
          Beranda
        </p>
      </div>
      <span className="pt-hem" />
    </div>
  );
}
