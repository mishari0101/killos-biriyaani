"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { about, highlights, type AboutHighlightIcon } from "@/lib/content/about";
import {
  CookingPotIcon,
  FlameIcon,
  HeartIcon,
  LeafIcon,
} from "@/components/ui/icons";

const ICONS: Record<
  AboutHighlightIcon,
  (p: { size?: number }) => React.ReactNode
> = {
  pot: (p) => <CookingPotIcon {...p} />,
  leaf: (p) => <LeafIcon {...p} />,
  flame: (p) => <FlameIcon {...p} />,
  heart: (p) => <HeartIcon {...p} />,
};

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
      className={`relative bg-[var(--about-bg)] py-24 lg:py-36 ${
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
            <div className="group relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-32px_var(--shadow-color)] lg:aspect-[4/5]">
              <Image
                src={about.image}
                alt={about.imageAlt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:scale-[1.04]"
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
              className="about-item mt-9 text-[clamp(2.3rem,4.6vw,3.9rem)] font-bold leading-[1.07] tracking-[0.01em] text-[var(--fg)]"
              style={{ fontFamily: "var(--font-serif)", "--d": "120ms" } as React.CSSProperties}
            >
              {about.titleA}
              <em className="mt-1 block italic text-[var(--accent)]">
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

            <div className="mt-14 grid gap-x-12 gap-y-11 sm:grid-cols-2">
              {highlights.map((h, i) => {
                const Icon = ICONS[h.icon];
                return (
                  <div
                    key={h.title}
                    className="about-item flex items-start gap-5"
                    style={{ "--d": `${380 + i * 110}ms` } as React.CSSProperties}
                  >
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3
                        className="text-[1.1rem] leading-snug tracking-[0.01em] text-[var(--fg)]"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {h.title}
                      </h3>
                      <p className="mt-2 text-[0.85rem] font-normal leading-relaxed text-[var(--fg-soft)]">
                        {h.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="about-item mt-14"
              style={{ "--d": "820ms" } as React.CSSProperties}
            >
              <a href={about.cta.href} className="btn btn-brand h-[3.4rem] px-9">
                {about.cta.label}
              </a>
            </div>
          </div>
        </div>

        {/* ================= Bottom signature quote ================= */}
        <div
          className="about-item mx-auto mt-24 max-w-3xl text-center lg:mt-36"
          style={{ "--d": "980ms" } as React.CSSProperties}
        >
          <span
            aria-hidden
            className="block text-7xl leading-[0.6] text-[var(--accent)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            &ldquo;
          </span>
          <p
            className="text-[clamp(1.35rem,2.7vw,1.9rem)] leading-snug text-[var(--fg)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {about.quote}
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
