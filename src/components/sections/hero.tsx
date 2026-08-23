"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { editorialHero } from "@/lib/content/hero";
import { useLoading } from "@/components/ui/loading-provider";
import { ArrowRightIcon } from "@/components/ui/icons";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function Word({
  children,
  tone = "ink",
  delay,
}: {
  children: ReactNode;
  tone?: "ink" | "gold";
  delay: number;
}) {
  return (
    // Mask wrapper carries extra padding so descenders (e.g. the "p" in
    // Experience) stay inside the clip region; matching negative margins
    // keep the tight vertical rhythm unchanged.
    <span className="-mb-[0.16em] -mt-[0.05em] block overflow-hidden pb-[0.16em] pt-[0.05em]">
      <span
        className={`he-word block ${tone === "gold" ? "text-[var(--he-gold)]" : "text-white"}`}
        style={d(delay)}
      >
        {children}
      </span>
    </span>
  );
}

export function Hero() {
  const { ready } = useLoading();
  const { brand, tagline, ctaPrimary, ctaSecondary } = editorialHero;

  return (
    <section
      id="home"
      className={`hero-editorial relative overflow-hidden ${ready ? "hero-ready" : ""}`}
      aria-label={`${brand.name} — ${brand.tagline}`}
    >
      {/* full-bleed freshly-prepared visual — edge-to-edge cover under the type,
          shown at full native clarity with no overlay.
          Mobile serves a dedicated portrait crop (mblres.webp);
          md+ keeps the landscape original. */}
      <div className="he-bg-fade absolute inset-0" style={d(150)} aria-hidden="true">
        <Image
          src="/images/hero/freshly-prepared.webp"
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="hidden object-cover md:block"
        />
        <Image
          src="/images/hero/mblres.webp"
          alt=""
          fill
          loading="eager"
          quality={90}
          sizes="100vw"
          className="object-cover object-center md:hidden"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1440px] flex-col justify-center px-5 pb-20 pt-28 sm:px-8 lg:px-12 lg:pb-24 lg:pt-32">
        <h1 className="sr-only">
          Authentic Arabian Flavours Experience — {brand.name}, {brand.tagline}
        </h1>

        {/* pure typographic composition — three stacked lines,
            held to the left column so the right side stays empty */}
        <div className="max-w-full lg:max-w-[62%]">
          <p className="he-headline" aria-hidden="true">
            <Word delay={140}>Authentic</Word>
            <Word delay={300}>Flavours</Word>
            <Word delay={460} tone="gold">
              Experience
            </Word>
          </p>

            {/* tagline — generous clearance below the Experience descender */}
          <p
            className="he-fade he-tshadow mt-12 max-w-md text-[0.66rem] font-medium uppercase leading-loose tracking-[0.34em] text-[rgba(248,244,236,0.95)] sm:text-[0.7rem] lg:mt-16"
            style={d(680)}
          >
            {tagline}
          </p>

          {/* CTAs */}
          <div className="he-fade mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-12" style={d(800)}>
            <a href={ctaPrimary.href} className="he-btn he-btn-primary">
              {ctaPrimary.label}
              <ArrowRightIcon size={14} />
            </a>
            <a href={ctaSecondary.href} className="he-btn he-btn-gold">
              {ctaSecondary.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
