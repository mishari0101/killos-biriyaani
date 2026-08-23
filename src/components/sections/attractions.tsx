"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { attractions } from "@/lib/content/attractions";
import { isManagedImageUrl } from "@/lib/uploads/client";
import {
  ArrowRightIcon,
  ImageIcon,
  RouteIcon,
  StarIcon,
} from "@/components/ui/icons";

const STAGGER_MS = 90;
const MAX_STAGGER = 8;

export interface SectionAttractionItem {
  id: string;
  name: string;
  description: string;
  rating: number;
  travelTime: string;
  image: string;
  mapUrl: string;
  featured?: boolean;
  imagePosition?: string;
}

function RatingChip({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[var(--attraction-star)]"
      aria-label={`Rated ${rating} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon
          key={i}
          size={9}
          className={i < filled ? "" : "opacity-30"}
        />
      ))}
      <span className="ml-1.5 text-[0.72rem] font-semibold tracking-normal text-white">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

function AttractionCard({ item, sizes }: { item: SectionAttractionItem; sizes: string }) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (e: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expanded]);

  return (
    <article
      ref={cardRef}
      onClick={() => setExpanded((v) => !v)}
      className={`attraction-card group relative aspect-[4/3] h-full w-full cursor-pointer overflow-hidden rounded-[28px] border border-[var(--attraction-card-border)] bg-[var(--attraction-card-bg)] shadow-[var(--attraction-card-shadow)] transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:border-[var(--attraction-card-border-hover)] hover:shadow-[var(--attraction-card-shadow-hover)] ${
        expanded ? "attraction-open" : ""
      }`}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          fill
          unoptimized={isManagedImageUrl(item.image)}
          sizes={sizes}
          style={{ objectPosition: item.imagePosition || "center center" }}
          className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#262626] via-[#1d1d1d] to-[#151515]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/30">
            <ImageIcon size={20} />
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 from-0% via-black/30 via-25% to-transparent to-50%" />

      <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
        {item.featured && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_10px_26px_-10px_rgba(201,162,39,0.8)]">
            <StarIcon size={9} />
            Featured
          </span>
        )}
        <span className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-2.5 py-1 backdrop-blur-md">
          <RatingChip rating={item.rating} />
        </span>
      </div>

      <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[0.64rem] font-medium uppercase tracking-[0.14em] text-white/90 backdrop-blur-md">
        <RouteIcon size={11} className="text-white/70" />
        {item.travelTime}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 [text-shadow:0_1px_12px_rgba(0,0,0,0.45)]">
        <p className="attraction-desc line-clamp-2 text-[0.8rem] font-light leading-relaxed text-white/85">
          {item.description}
        </p>
        <div className="flex items-end justify-between gap-4">
          <h3
            className="text-[1.12rem] font-bold leading-snug text-white sm:text-[1.22rem]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {item.name}
          </h3>
          <a
            href={item.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="group/link inline-flex shrink-0 items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-white/90 transition-colors duration-300 hover:text-white"
          >
            View on Google Maps
            <ArrowRightIcon
              size={13}
              className="text-[var(--attraction-star)] transition-transform duration-300 group-hover/link:translate-x-1"
            />
          </a>
        </div>
      </div>
    </article>
  );
}

export function Attractions({ items }: { items: SectionAttractionItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.06 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="attractions"
      ref={sectionRef}
      className={`relative scroll-mt-24 bg-[var(--attraction-bg)] py-24 lg:py-36 ${
        inView ? "attraction-in" : ""
      }`}
      aria-labelledby="attractions-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="text-center">
          <p
            className="attraction-item text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {attractions.eyebrow}
          </p>
          <h2
            id="attractions-heading"
            className="attraction-item mt-6 text-[clamp(2.4rem,4.8vw,4.1rem)] font-bold uppercase leading-[1.02] tracking-[-0.01em] text-[var(--fg)]"
            style={
              { fontFamily: "var(--font-display)", "--d": "120ms" } as React.CSSProperties
            }
          >
            {attractions.titleA}
            <em className="mt-1 block not-italic text-[var(--accent)]">
              {attractions.titleB}
            </em>
          </h2>
          <p
            className="attraction-item mx-auto mt-6 max-w-[52ch] text-[1rem] font-normal leading-[1.8] text-[var(--fg-soft)]"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            {attractions.description}
          </p>
        </div>

        <div className="-mx-6 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:mt-16 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 md:snap-none lg:mt-20 lg:grid-cols-3 lg:gap-7">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`attraction-card-item w-[84vw] max-w-[400px] shrink-0 snap-start md:w-auto md:max-w-none ${
                item.featured ? "md:col-span-2" : ""
              }`}
              style={
                {
                  "--d": `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`,
                } as React.CSSProperties
              }
            >
              <AttractionCard
                item={item}
                sizes={
                  item.featured
                    ? "(min-width: 1024px) 67vw, (min-width: 640px) 100vw, 85vw"
                    : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
