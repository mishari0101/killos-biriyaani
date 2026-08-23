"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { about } from "@/lib/content/about";

const QUOTE_WORDS: Array<{ t: string; gold?: boolean }> = [
  { t: "Every" },
  { t: "plate" },
  { t: "tells" },
  { t: "a" },
  { t: "story" },
  { t: "of" },
  { t: "authentic", gold: true },
  { t: "Arabian", gold: true },
  { t: "flavours,", gold: true },
  { t: "premium", gold: true },
  { t: "ingredients,", gold: true },
  { t: "and" },
  { t: "heartfelt" },
  { t: "hospitality." },
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`relative overflow-x-clip bg-[var(--about-bg)] py-24 lg:py-36 ${
        inView ? "about-in" : ""
      }`}
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* ================= LEFT — cinematic image ================= */}
          <div
            className="about-img relative"
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            <div className="group relative aspect-video overflow-hidden rounded-[28px] shadow-[0_40px_80px_-32px_var(--shadow-color)]">
              <Image
                src={about.image}
                alt={about.imageAlt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-center transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:scale-[1.04]"
              />
              <div className="absolute bottom-7 left-7 flex flex-col">
                <span
                  className="text-[1.5rem] leading-none text-white"
                  style={{
                    fontFamily: "var(--font-serif)",
                    textShadow: "0 2px 18px rgba(0,0,0,0.55)",
                  }}
                >
                  Killo&rsquo;s
                </span>
                <span
                  className="mt-2.5 text-[0.6rem] uppercase tracking-[0.34em] text-white"
                  style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
                >
                  Arabian Restaurant
                </span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT — story ================= */}
          <div>
            <p
              className="about-item flex items-center gap-4 text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]"
              style={{ "--d": "0ms" } as React.CSSProperties}
            >
              <span className="h-px w-12 bg-gradient-to-r from-[var(--accent)] to-transparent" />
              {about.eyebrow}
            </p>

            <h2
              id="about-heading"
              className="about-item mt-9 text-[clamp(2.4rem,4.8vw,4.1rem)] font-bold uppercase leading-[1.02] tracking-[-0.01em] text-[var(--fg)]"
              style={{ fontFamily: "var(--font-display)", "--d": "120ms" } as React.CSSProperties}
            >
              {about.titleA}
              <em className="mt-1 block not-italic text-[var(--accent)]">
                {about.titleB}
              </em>
              <span className="mt-1 block">{about.titleC}</span>
            </h2>

            <p
              className="about-item mt-8 max-w-[62ch] text-[1.02rem] font-normal leading-[1.8] text-[var(--fg-soft)]"
              style={{ "--d": "260ms" } as React.CSSProperties}
            >
              {about.description}
            </p>
          </div>
        </div>

        {/* ================= Bottom signature quote ================= */}
        <div
          className="about-item mx-auto mt-24 max-w-3xl text-center lg:mt-36"
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          <span
            aria-hidden
            className="block text-7xl leading-[0.6] text-[var(--accent)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            &ldquo;
          </span>
          <p
            className="mx-auto w-full max-w-[46ch] text-[clamp(1.4rem,2.9vw,2rem)] font-semibold leading-[1.12] tracking-[0.01em] [word-spacing:0.16em] text-white/95"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {QUOTE_WORDS.map((w, i) => (
              <span key={`${w.t}-${i}`}>
                <span
                  className={`quote-word ${w.gold ? "uppercase text-[var(--accent)]" : ""}`}
                  style={{ "--wd": `${180 + i * 55}ms` } as React.CSSProperties}
                >
                  {w.t}
                </span>
                {i < QUOTE_WORDS.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
          <span
            aria-hidden
            className="mx-auto mt-9 block h-px w-16 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
