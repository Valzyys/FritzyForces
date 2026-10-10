"use client";

import { useEffect, useRef } from "react";

const SESSION_KEY = "ff-intro-seen";

/**
 * Skrip inline (dijalankan sebelum render pertama): pasang preferensi animasi pengunjung
 * (`ff-motion` di localStorage) dan tandai intro sudah tampil di sesi ini agar tidak berkedip.
 */
export const INTRO_BOOT_SCRIPT = `try{var d=document.documentElement;if(localStorage.getItem("ff-motion")==="reduced")d.dataset.motion="reduced";if(sessionStorage.getItem("${SESSION_KEY}")||d.dataset.motion==="reduced")d.dataset.intro="seen"}catch(e){}`;

function finish() {
  document.documentElement.dataset.intro = "seen";
}

const TZ = "Asia/Jakarta";
const clockFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
const dateFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, weekday: "short", day: "2-digit", month: "short", year: "numeric" });

export type IntroShow = { title: string; time: string } | null;

const BARS = [3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 1, 2, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2];

/**
 * Intro "tiket teater" (GSAP): tiket naik dari bawah, kolom terisi seperti dicetak,
 * barcode tergambar, cap "HADIR" dihentakkan, sobekan robek di garis perforasi,
 * lalu kertas latar tergulung naik menampilkan situs. Sekali per sesi, bisa dilewati,
 * dan tidak tampil bila pengunjung memilih "Kurangi animasi". Bila GSAP gagal dimuat,
 * CSS menutup intro otomatis.
 */
export function Intro({ name, show, setlists }: { name: string; show: IntroShow; setlists: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => finish());

  useEffect(() => {
    const el = root.current;
    if (!el || document.documentElement.dataset.intro === "seen") return;
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* sessionStorage tidak tersedia: intro tetap tampil di halaman ini saja */
    }

    // Jam & tanggal WIB yang berdetak sungguhan.
    const clock = el.querySelector<HTMLElement>("[data-clock]");
    const today = el.querySelector<HTMLElement>("[data-today]");
    const tick = () => {
      const now = new Date();
      if (clock) clock.textContent = `${clockFmt.format(now).replace(/\./g, ":")} WIB`;
      if (today) today.textContent = dateFmt.format(now);
    };
    tick();
    const clockId = window.setInterval(tick, 1000);

    let killed = false;
    let cleanup = () => {};

    (async () => {
      const { gsap } = await import("gsap");
      if (killed) return;
      el.classList.add("intro-js");
      const q = gsap.utils.selector(el);

      const ctx = gsap.context(() => {
        const percent = { v: 0 };
        const pctEl = q("[data-pct]")[0] as HTMLElement | undefined;
        const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: finish });

        tl.from(q(".it-meta > *"), { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.06 }, 0)
          .from(q(".it-crop"), { scale: 0, autoAlpha: 0, duration: 0.4, stagger: 0.05, ease: "back.out(2)" }, 0)
          .from(q(".it-reg"), { rotate: -180, scale: 0, autoAlpha: 0, duration: 0.7 }, 0.1)
          .from(q(".it-swatch"), { scaleY: 0, duration: 0.35, stagger: 0.04, transformOrigin: "bottom" }, 0.2)
          .from(q(".it-ghost"), { xPercent: -8, autoAlpha: 0, duration: 1.2, ease: "expo.out" }, 0.1)
          .from(q(".it-queue li"), { x: (i) => (i % 2 ? 30 : -30), autoAlpha: 0, duration: 0.5, stagger: 0.05 }, 0.3)
          .to(percent, { v: 100, duration: 2.1, ease: "power1.inOut", onUpdate: () => void (pctEl && (pctEl.textContent = `${Math.round(percent.v)}%`)) }, 0.1)
          .from(q(".it-ticket"), { yPercent: 140, rotate: -9, duration: 0.85, ease: "back.out(1.25)" }, 0.15)
          .from(q(".it-name span"), { yPercent: 105, duration: 0.6, ease: "expo.out", stagger: 0.04 }, 0.7)
          .from(q(".it-row"), { autoAlpha: 0, x: -10, duration: 0.3, stagger: 0.07 }, 0.75)
          .from(q(".it-type"), { clipPath: "inset(0 100% 0 0)", duration: 0.5, ease: "steps(14)", stagger: 0.12 }, 0.85)
          .from(q(".it-bar"), { scaleY: 0, duration: 0.25, stagger: 0.012, ease: "power2.out" }, 1.0)
          .fromTo(q(".it-stamp"), { scale: 2.4, rotate: -28, autoAlpha: 0 }, { scale: 1, rotate: -12, autoAlpha: 1, duration: 0.32, ease: "power4.in" }, 1.75)
          .to(q(".it-ticket"), { x: 4, duration: 0.05, yoyo: true, repeat: 3, ease: "none" }, 2.07)
          .addLabel("tear", 2.45)
          .to(q(".it-stub"), { x: 60, y: 280, rotate: 24, autoAlpha: 0, duration: 0.8, ease: "power2.in" }, "tear")
          .to(q(".it-main"), { x: -40, rotate: -2, duration: 0.3, ease: "power2.out" }, "tear")
          .to(q(".it-ticket"), { yPercent: -170, rotate: -6, duration: 0.6, ease: "power3.in" }, "tear+=0.3")
          .to(q(".it-meta, .it-print"), { autoAlpha: 0, duration: 0.25 }, "tear+=0.3")
          .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "expo.inOut" }, "tear+=0.6");

        skipRef.current = () => {
          if (tl.time() < tl.labels.tear) tl.seek("tear");
          tl.timeScale(1.8);
        };
      }, el);
      cleanup = () => ctx.revert();
    })().catch(() => finish());

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skipRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      killed = true;
      window.clearInterval(clockId);
      window.removeEventListener("keydown", onKey);
      cleanup();
    };
  }, []);

  const first = name.split(" ")[0] || "Fritzy";
  const queue = (setlists.length > 0 ? setlists : ["Fritzy Force", "ZyFriends"]).slice(0, 6);

  return (
    <div ref={root} className="intro" aria-hidden="true">
      {/* Elemen percetakan: tanda potong, target registrasi, strip warna, antrean setlist */}
      <div className="it-print">
        <span className="it-ghost">TIKET·48</span>
        <span className="it-crop it-crop-tl" />
        <span className="it-crop it-crop-tr" />
        <span className="it-crop it-crop-bl" />
        <span className="it-crop it-crop-br" />
        <span className="it-reg" />
        <span className="it-swatches">
          {["#1d0e40", "#331a66", "#5a29b3", "#6d36d6", "#a07dfa", "#ddd1ff", "#e8c77d"].map((c) => (
            <i key={c} className="it-swatch" style={{ background: c }} />
          ))}
        </span>
        <ul className="it-queue it-queue-l">
          {queue.map((s, i) => (
            <li key={`l${i}`}>
              <b>M{String(i + 1).padStart(2, "0")}</b> {s}
            </li>
          ))}
        </ul>
        <ul className="it-queue it-queue-r">
          {[...queue].reverse().map((s, i) => (
            <li key={`r${i}`}>
              {s} <b>✦</b>
            </li>
          ))}
        </ul>
      </div>
      <div className="it-meta">
        <span className="it-meta-tl">Fritzy Force — fanbase untuk Fritzy JKT48</span>
        <span className="it-meta-tr" data-clock>
          --:--:-- WIB
        </span>
        <span className="it-meta-bl">
          Mencetak tiket… <b data-pct>0%</b>
        </span>
        <span className="it-meta-br">ZyFriends · Edisi web</span>
      </div>

      <div className="it-ticket">
        <div className="it-main">
          <div className="it-head">
            <span>JKT48 Theater · Fanbase pass</span>
            <span>Edisi web</span>
          </div>
          <p className="it-name">
            {Array.from(first).map((c, i) => (
              <span key={i}>{c}</span>
            ))}
            <span className="it-name-dot">.</span>
          </p>
          <dl className="it-fields">
            <div className="it-row">
              <dt>Dicetak</dt>
              <dd className="it-type" data-today>
                —
              </dd>
            </div>
            <div className="it-row">
              <dt>{show ? "Show berikutnya" : "Show"}</dt>
              <dd className="it-type">{show ? `${show.title} · ${show.time}` : name}</dd>
            </div>
            <div className="it-row">
              <dt>Kursi</dt>
              <dd className="it-type">ZyFriends</dd>
            </div>
          </dl>
          <span className="it-stamp">
            Hadir
            <small>Fritzy Force</small>
          </span>
        </div>
        <div className="it-stub">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="" width={256} height={256} />
          <span className="it-admit">Admit one</span>
          <span className="it-barcode">
            {BARS.map((w, i) => (
              <i key={i} className="it-bar" style={{ width: `${w}px` }} />
            ))}
          </span>
        </div>
      </div>

      <button type="button" className="it-skip" onClick={() => skipRef.current()} tabIndex={-1}>
        Lewati →
      </button>
    </div>
  );
}
