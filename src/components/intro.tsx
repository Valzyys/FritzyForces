"use client";

import { useEffect, useRef } from "react";

const SESSION_KEY = "ff-intro-seen";
const SETLIST_LABELS = ["M01", "M02", "M03", "M04", "M05", "M06", "M07", "M08"];

/**
 * Skrip inline (dijalankan sebelum render pertama): pasang preferensi animasi pengunjung
 * (`ff-motion` di localStorage) dan tandai intro sudah tampil di sesi ini agar tidak berkedip.
 */
export const INTRO_BOOT_SCRIPT = `try{var d=document.documentElement;if(localStorage.getItem("ff-motion")==="reduced")d.dataset.motion="reduced";if(sessionStorage.getItem("${SESSION_KEY}")||d.dataset.motion==="reduced")d.dataset.intro="seen"}catch(e){}`;

function finish() {
  document.documentElement.dataset.intro = "seen";
}

/**
 * Intro "tirai panggung" (GSAP): segel logo di tirai → tirai beludru tersibak →
 * lampu sorot menyapu, debu emas melayang, logo & judul muncul, bar setlist M01–M08 →
 * panggung terangkat menampilkan situs. Sekali per sesi, bisa dilewati, dan tidak tampil
 * bila pengunjung memilih "Kurangi animasi". Bila GSAP gagal dimuat, CSS menutup intro otomatis.
 */
export function Intro({ name, setlists }: { name: string; setlists: string[] }) {
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

    let killed = false;
    let cleanup = () => {};

    (async () => {
      const [{ gsap }, { CustomEase }] = await Promise.all([import("gsap"), import("gsap/CustomEase")]);
      if (killed) return;
      gsap.registerPlugin(CustomEase);
      CustomEase.create("ffCurtain", "M0,0 C0.62,0 0.18,1 1,1");
      CustomEase.create("ffLift", "M0,0 C0.76,0 0.24,1 1,1");
      el.classList.add("intro-js");

      const q = gsap.utils.selector(el);
      const ctx = gsap.context(() => {
        // Debu emas: melayang naik terus-menerus di panggung.
        q(".intro-dust i").forEach((dot) => {
          gsap.set(dot, {
            xPercent: -50,
            left: `${gsap.utils.random(2, 98)}%`,
            top: `${gsap.utils.random(40, 105)}%`,
            scale: gsap.utils.random(0.4, 1.3),
            opacity: 0,
          });
          gsap.to(dot, {
            y: () => -gsap.utils.random(160, 420),
            x: () => gsap.utils.random(-40, 40),
            opacity: () => gsap.utils.random(0.35, 0.95),
            duration: () => gsap.utils.random(2.2, 4.2),
            delay: () => gsap.utils.random(0.4, 1.6),
            ease: "sine.out",
            repeat: -1,
            repeatRefresh: true,
          });
        });

        // Pita setlist berjalan.
        gsap.to(q(".intro-ribbon-track"), { xPercent: -50, duration: 14, ease: "none", repeat: -1 });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: finish });

        tl.from(q(".intro-seal"), { scale: 0.2, rotate: -40, opacity: 0, duration: 0.7, ease: "back.out(2)" })
          .to(q(".intro-seal"), { scale: 1.6, opacity: 0, duration: 0.45, ease: "power2.in" }, 0.75)
          .to(q(".intro-curtain-l"), { xPercent: -101, skewX: 4, duration: 1.15, ease: "ffCurtain" }, 0.8)
          .to(q(".intro-curtain-r"), { xPercent: 101, skewX: -4, duration: 1.15, ease: "ffCurtain" }, 0.8)
          .fromTo(q(".intro-beam-l"), { rotate: -38, opacity: 0 }, { rotate: 10, opacity: 1, duration: 1.6, ease: "power2.inOut" }, 1.0)
          .fromTo(q(".intro-beam-r"), { rotate: 38, opacity: 0 }, { rotate: -10, opacity: 1, duration: 1.6, ease: "power2.inOut" }, 1.05)
          .fromTo(q(".intro-halo"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1 }, 1.15)
          .fromTo(
            q(".intro-logo"),
            { scale: 0.3, rotate: -24, opacity: 0, filter: "blur(10px)" },
            { scale: 1, rotate: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "back.out(1.6)" },
            1.2,
          )
          .fromTo(q(".intro-kicker"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power3.inOut" }, 1.45)
          .fromTo(q(".intro-char"), { yPercent: 120, rotate: 10, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 0.9, stagger: 0.055 }, 1.5)
          .fromTo(q(".intro-sub"), { letterSpacing: "0.9em", opacity: 0 }, { letterSpacing: "0.32em", opacity: 1, duration: 1.1 }, 1.8)
          .fromTo(q(".intro-progress"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 1.85)
          .fromTo(q(".intro-progress-bar"), { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "power1.inOut" }, 1.9)
          .fromTo(q(".intro-progress-labels span"), { opacity: 0.25 }, { opacity: 1, color: "#e8c77d", duration: 0.2, stagger: 0.18, ease: "none" }, 1.9)
          .fromTo(q(".intro-ribbon"), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8 }, 1.6)
          .to(q(".intro-logo-wrap"), { y: -6, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, 2.4)
          .addLabel("exit", 3.55)
          .to(q(".intro-center"), { yPercent: -18, opacity: 0, duration: 0.55, ease: "power2.in" }, "exit")
          .to(el, { yPercent: -100, duration: 0.95, ease: "ffLift" }, "exit+=0.15");

        skipRef.current = () => {
          if (tl.time() < tl.labels.exit) tl.seek("exit");
          tl.timeScale(1.6);
        };
      }, el);

      cleanup = () => ctx.revert();
    })().catch(() => finish());

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skipRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      killed = true;
      window.removeEventListener("keydown", onKey);
      cleanup();
    };
  }, []);

  const [first, ...rest] = name.split(" ");
  const ribbon = setlists.length > 0 ? setlists : ["ZyFriends", "Fritzy Force", "JKT48"];

  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro-stage">
        <div className="intro-dots" />
        <div className="intro-beam intro-beam-l" />
        <div className="intro-beam intro-beam-r" />
        <div className="intro-floor" />
        <div className="intro-dust">
          {Array.from({ length: 28 }, (_, i) => (
            <i key={i} />
          ))}
        </div>

        <div className="intro-center">
          <div className="intro-logo-wrap">
            <span className="intro-halo" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" width={256} height={256} className="intro-logo" />
          </div>
          <p className="intro-kicker">Fanbase untuk Fritzy JKT48</p>
          <p className="intro-title">
            {Array.from(first).map((ch, i) => (
              <span key={i} className="intro-char">
                {ch}
              </span>
            ))}
            <span className="intro-char intro-dot">.</span>
          </p>
          <p className="intro-sub">{rest.length > 0 ? rest.join(" ") : "Force"}</p>
          <div className="intro-progress">
            <span className="intro-progress-track">
              <span className="intro-progress-bar" />
            </span>
            <span className="intro-progress-labels">
              {SETLIST_LABELS.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </span>
          </div>
        </div>

        <div className="intro-ribbon">
          <div className="intro-ribbon-track">
            {[0, 1].map((dup) => (
              <div key={dup} className="intro-ribbon-row">
                {[...ribbon, ...ribbon, ...ribbon].map((s, i) => (
                  <span key={i}>
                    {s}
                    <b>✦</b>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="intro-hem" />
      </div>

      <div className="intro-curtain intro-curtain-l" />
      <div className="intro-curtain intro-curtain-r" />
      <div className="intro-seal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" alt="" width={256} height={256} />
      </div>

      <button type="button" className="intro-skip-btn" onClick={() => skipRef.current()} tabIndex={-1}>
        Lewati intro →
      </button>
    </div>
  );
}
