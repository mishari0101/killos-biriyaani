"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { dishes, hero } from "@/lib/content/hero";
import { site } from "@/lib/content/site";
import { useLoading } from "@/components/ui/loading-provider";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
} from "@/components/ui/icons";

export function Hero() {
  const { ready } = useLoading();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const dishRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % dishes.length),
      hero.sliderIntervalMs
    );
    return () => window.clearInterval(id);
  }, [paused]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (dishRef.current) {
          dishRef.current.style.transform = `translate3d(0, ${window.scrollY * 0.1}px, 0)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (i: number) => {
    setIndex((i + dishes.length) % dishes.length);
  };

  const dish = dishes[index];

  return (
    <section
      id="home"
      ref={sectionRef}
      className={`relative flex min-h-[100svh] items-center overflow-hidden ${
        ready ? "hero-ready" : ""
      }`}
      aria-label={site.name}
    >
      {/* ---- Background image (fixed, full viewport) ---- */}
      <div aria-hidden className="fixed inset-0 -z-10">
        <Image
          src="/images/backgrounds/hero-bg.png"
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/45" />
        {/* subtle vignette around the edges */}
        <div
          className="absolute inset-0"
          style={{ boxShadow: "inset 0 0 200px 70px rgba(0,0,0,0.8)" }}
        />
        {/* top + bottom falloff for nav / scroll legibility */}
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* ---- Content ---- */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-14 px-6 pb-28 pt-32 lg:grid-cols-[1.04fr_0.96fr] lg:gap-8 lg:px-10 lg:pb-32 lg:pt-36">
        {/* ================= LEFT ================= */}
        <div className="flex flex-col items-start">
          <div
            className="hero-item flex items-center gap-4"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            <span className="h-px w-12 bg-gradient-to-r from-[var(--accent)] to-transparent" />
            <span className="text-[0.68rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]">
              {hero.eyebrow}
            </span>
          </div>

          <h1
            className="hero-item mt-7 text-[clamp(3.1rem,7.2vw,5.9rem)] leading-[0.98] text-white"
            style={{ fontFamily: "var(--font-serif)", "--d": "120ms" } as React.CSSProperties}
          >
            Killo&rsquo;s
            <span className="mt-1 flex items-center gap-5">
              <span>Biriyani</span>
              <span className="mb-4 h-[3px] w-14 shrink-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-transparent" />
            </span>
          </h1>

          <p
            className="hero-item mt-5 flex items-center gap-3 text-[0.85rem] uppercase tracking-[0.4em] text-[#b3b3b3]"
            style={{ fontFamily: "var(--font-serif)", "--d": "220ms" } as React.CSSProperties}
          >
            <CalendarIcon size={15} className="text-[var(--accent)]" />
            {hero.titleAccent}
          </p>

          <p
            className="hero-item mt-7 max-w-[30rem] text-[1.02rem] font-light leading-relaxed text-white/65"
            style={{ "--d": "320ms" } as React.CSSProperties}
          >
            {hero.headline}
          </p>

          <div
            className="hero-item mt-10 flex flex-wrap items-center gap-4"
            style={{ "--d": "430ms" } as React.CSSProperties}
          >
            <a href={hero.ctaPrimary.href} className="btn btn-brand h-[3.4rem] px-9">
              {hero.ctaPrimary.label}
              <ArrowRightIcon size={16} />
            </a>
            <a href={hero.ctaSecondary.href} className="btn btn-white h-[3.4rem] px-9">
              {hero.ctaSecondary.label}
            </a>
          </div>

          {/* ---- Google rating + avatars ---- */}
          <div
            className="hero-item mt-12 flex flex-wrap items-center gap-x-8 gap-y-5"
            style={{ "--d": "540ms" } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {hero.customers.map((c) => (
                  <span
                    key={c.name}
                    title={c.name}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#141414] bg-gradient-to-br from-[#3a3a3a] to-[#222222] text-[0.62rem] font-medium tracking-wide text-white/80"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {c.initials}
                  </span>
                ))}
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#141414] bg-[var(--accent)] text-[0.6rem] font-semibold text-white">
                  2.4k
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 text-[var(--accent)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} size={13} />
                  ))}
                  <span className="ml-1.5 text-sm font-semibold text-white">
                    {hero.rating.score}
                  </span>
                </div>
                <span className="text-[0.7rem] tracking-wide text-white/55">
                  {hero.rating.reviews} · {hero.rating.source}
                </span>
              </div>
            </div>

            <span className="hidden h-10 w-px bg-white/15 sm:block" />

            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              </span>
              <div className="flex flex-col">
                <span className="text-[0.72rem] uppercase tracking-[0.22em] text-white/85">
                  {site.hours.label}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[0.7rem] text-white/50">
                  <ClockIcon size={12} /> {site.hours.time}
                </span>
                <span className="mt-0.5 text-[0.7rem] text-white/50">
                  {site.hours.note}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div
          className="hero-item relative mx-auto w-full max-w-[540px]"
          style={{ "--d": "260ms" } as React.CSSProperties}
        >
          <div ref={dishRef} className="relative will-change-transform">
            {/* smoke behind */}
            <div
              className="smoke-blob left-1/2 top-[30%] h-[46%] w-[46%] -translate-x-1/2"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="smoke-blob left-[24%] top-[18%] h-[30%] w-[30%]"
              style={{ animationDelay: "3.2s" }}
            />
            <div
              className="smoke-blob left-[56%] top-[46%] h-[36%] w-[36%]"
              style={{ animationDelay: "6.1s" }}
            />

            {/* rotating accent rings */}
            <div className="pointer-events-none absolute inset-[7%]">
              <svg className="ring-spin-slow h-full w-full" viewBox="0 0 400 400" fill="none">
                <circle
                  cx="200"
                  cy="200"
                  r="198"
                  stroke="var(--accent)"
                  strokeOpacity="0.16"
                  strokeWidth="1"
                  strokeDasharray="3 12"
                  strokeLinecap="round"
                />
              </svg>
              <svg className="absolute inset-[9%] h-[82%] w-[82%]" viewBox="0 0 400 400" fill="none">
                <circle
                  cx="200"
                  cy="200"
                  r="198"
                  stroke="#FFFFFF"
                  strokeOpacity="0.07"
                  strokeWidth="1"
                />
              </svg>
            </div>

            {/* dish slider */}
            <div
              className="relative aspect-square"
              aria-roledescription="carousel"
              aria-label="Signature dishes"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {dishes.map((d, i) => {
                const active = i === index;
                const isFailed = failed[i];
                return (
                  <div
                    key={d.image}
                    aria-hidden={!active}
                    className={`absolute inset-0 transition-opacity duration-[1200ms] ${
                      active ? "z-10 opacity-100" : "z-0 opacity-0"
                    }`}
                    style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
                  >
                    <div
                      key={`frame-${index}`}
                      className={`relative h-full w-full ${active ? "kenburns" : ""}`}
                    >
                      {isFailed ? (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_42%,#333333,#1f1f1f_65%)] shadow-[inset_0_0_120px_rgba(0,0,0,0.55)]">
                          <span
                            className="text-7xl text-white/80"
                            style={{ fontFamily: "var(--font-serif)" }}
                          >
                            {d.name.charAt(0)}
                          </span>
                        </div>
                      ) : (
                        <Image
                          src={d.image}
                          alt={`${d.name} — ${d.tag}`}
                          fill
                          sizes="(min-width: 1024px) 46vw, 92vw"
                          className="object-contain [filter:drop-shadow(0_18px_30px_rgba(0,0,0,0.45))_drop-shadow(0_55px_85px_rgba(0,0,0,0.55))]"
                          onError={() => setFailed((p) => ({ ...p, [i]: true }))}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* prev / next arrows */}
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-[-8px] top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white/80 backdrop-blur-sm transition-all duration-400 hover:border-[var(--accent)] hover:text-white lg:-left-10"
              aria-label="Previous dish"
            >
              <ArrowLeftIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-[-8px] top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white/80 backdrop-blur-sm transition-all duration-400 hover:border-[var(--accent)] hover:text-white lg:-right-10"
              aria-label="Next dish"
            >
              <ArrowRightIcon size={18} />
            </button>
          </div>

          {/* dish title below the image */}
          <h2
            key={`name-${index}`}
            className="dish-title-in mt-8 text-center text-[clamp(1.9rem,4vw,2.8rem)] leading-tight text-white"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {dish.name}
          </h2>

          {/* dots with progress */}
          <div className="mt-8 flex items-center justify-center gap-2.5">
            {dishes.map((d, i) => {
              const active = i === index;
              return (
                <button
                  key={d.image}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${d.name}`}
                  aria-current={active}
                  className={`group relative h-1.5 overflow-hidden rounded-full transition-all duration-500 ${
                    active ? "w-14 bg-[var(--accent-soft)]" : "w-5 bg-white/15 hover:bg-white/30"
                  }`}
                >
                  {active && (
                    <span
                      key={`progress-${index}`}
                      className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)]"
                      style={{
                        animation: `progress-fill ${hero.sliderIntervalMs}ms linear both`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- Scroll indicator ---- */}
      <div
        className="hero-item absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        style={{ "--d": "900ms" } as React.CSSProperties}
        aria-hidden="true"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.42em] text-white/45">
          Scroll
        </span>
        <span className="relative h-12 w-px overflow-hidden bg-white/15">
          <span className="scroll-dot absolute left-0 top-0 h-4 w-px bg-gradient-to-b from-[var(--accent)] to-transparent" />
        </span>
      </div>
    </section>
  );
}
