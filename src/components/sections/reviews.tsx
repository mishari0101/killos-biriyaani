"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { reviews } from "@/lib/content/reviews";
import { GoogleIcon, StarIcon } from "@/components/ui/icons";

const STAGGER_MS = 60;
const MAX_STAGGER = 8;
const MOBILE_GAP = 16;
const INITIAL_VISIBLE = 6;

export interface SectionReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  image?: string;
  pinned?: boolean;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const filled = Math.round(rating);
  return (
    <div
      className="flex gap-1 text-[var(--review-star)]"
      aria-label={`${rating} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} size={size} className={i < filled ? "" : "opacity-25"} />
      ))}
    </div>
  );
}

function Avatar({ name, image }: { name: string; image?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={44}
        height={44}
        sizes="44px"
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-[var(--review-border)]"
      />
    );
  }
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[0.85rem] font-bold tracking-[0.02em] text-[var(--accent)]">
      {initials}
    </span>
  );
}

function ReviewCard({ review }: { review: SectionReviewItem }) {
  return (
    <article className="group flex h-full flex-col rounded-[24px] border border-[var(--review-border)] bg-[var(--review-card-bg)] p-6 shadow-[var(--review-card-shadow)] transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-[var(--review-card-shadow-hover)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <Avatar name={review.name} image={review.image} />
          <div className="min-w-0">
            <h3
              className="truncate text-[1.02rem] font-bold leading-snug text-[var(--fg)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {review.name}
            </h3>
            <p className="mt-0.5 text-[0.72rem] font-normal tracking-[0.02em] text-[var(--fg-muted)]">
              {review.date}
            </p>
          </div>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--review-chip-border)] bg-[var(--review-chip-bg)]">
          <GoogleIcon size={15} />
        </span>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <Stars rating={review.rating} />
        <span className="ml-1 text-[0.78rem] font-medium text-[var(--fg-muted)]">
          {review.rating.toFixed(1)}
        </span>
      </div>

      <p className="mt-4 line-clamp-5 text-[0.92rem] font-normal leading-[1.75] text-[var(--fg-soft)]">
        {review.text}
      </p>

      {review.pinned && (
        <span className="mt-auto pt-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
            <StarIcon size={11} />
            Featured
          </span>
        </span>
      )}
    </article>
  );
}

export function Reviews({ items }: { items: SectionReviewItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false)
      ),
    [items]
  );

  const visible = sorted;

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.children[0] as HTMLElement | undefined;
    if (!first) return;
    const step = first.offsetWidth + MOBILE_GAP;
    const target = Math.max(0, Math.min(index, visible.length - 1));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: target * step, behavior: reduce ? "auto" : "smooth" });
  };

  const handleScroll = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const track = trackRef.current;
      if (!track) return;
      const first = track.children[0] as HTMLElement | undefined;
      if (!first) return;
      const trackW = track.clientWidth;
      const step = first.offsetWidth + MOBILE_GAP;
      const offset = Math.max(0, (trackW - first.offsetWidth) / 2);
      const maxIndex = Math.max(0, visible.length - 1);
      const next = Math.max(
        0,
        Math.min(
          maxIndex,
          Math.round((track.scrollLeft - offset) / step)
        )
      );
      setActiveIndex((prev) => (prev === next ? prev : next));
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      goTo(activeIndex + (e.key === "ArrowRight" ? 1 : -1));
    }
  };

  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const marqueeDrag = useRef<{ startX: number; startScroll: number } | null>(null);
  const marqueeMoved = useRef(false);

  const handleMarqueePointerDown = (e: React.PointerEvent) => {
    const el = marqueeRef.current;
    if (!el) return;
    marqueeMoved.current = false;
    marqueeDrag.current = { startX: e.clientX, startScroll: el.scrollLeft };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleMarqueePointerMove = (e: React.PointerEvent) => {
    const el = marqueeRef.current;
    const state = marqueeDrag.current;
    if (!el || !state) return;
    const dx = e.clientX - state.startX;
    if (Math.abs(dx) > 4) marqueeMoved.current = true;
    el.scrollLeft = state.startScroll - dx;
  };

  const handleMarqueePointerEnd = () => {
    marqueeDrag.current = null;
  };

  const handleMarqueeClickCapture = (e: React.MouseEvent) => {
    if (marqueeMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      marqueeMoved.current = false;
    }
  };

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className={`relative scroll-mt-24 bg-[var(--review-bg)] py-24 lg:py-36 ${
        inView ? "review-in" : ""
      }`}
      aria-labelledby="reviews-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* ---- Header ---- */}
        <div className="text-center">
          <p
            className="review-item text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {reviews.eyebrow}
          </p>
          <h2
            id="reviews-heading"
            className="review-item mt-6 text-[clamp(2.4rem,4.8vw,4.1rem)] font-bold uppercase leading-[1.02] tracking-[-0.01em] text-[var(--fg)]"
            style={
              { fontFamily: "var(--font-display)", "--d": "120ms" } as React.CSSProperties
            }
          >
            {reviews.titleA}
            <em className="mt-1 block not-italic text-[var(--accent)]">
              {reviews.titleB}
            </em>
          </h2>
          <p
            className="review-item mx-auto mt-6 max-w-[52ch] text-[1rem] font-normal leading-[1.8] text-[var(--fg-soft)]"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            {reviews.description}
          </p>
        </div>

        {/* ---- Google summary ---- */}
        <div
          className="review-item mx-auto mt-14 max-w-xl text-center"
          style={{ "--d": "360ms" } as React.CSSProperties}
        >
          <div className="flex items-center justify-center gap-1 text-[var(--review-star)]">
            {[0, 1, 2, 3, 4].map((i) => (
              <StarIcon key={i} size={20} />
            ))}
          </div>
          <p
            className="mt-4 text-[clamp(1.6rem,3vw,2.1rem)] font-bold leading-none text-[var(--fg)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {reviews.rating.toFixed(1)}
            <span
              className="ml-2 align-middle text-[0.72em] font-normal text-[var(--fg-muted)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {reviews.ratingSuffix}
            </span>
          </p>
          <p className="mt-2.5 text-[0.85rem] font-normal tracking-[0.02em] text-[var(--fg-soft)]">
            {reviews.reviewCount}
          </p>
          <span className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--review-chip-border)] bg-[var(--review-chip-bg)] px-4 py-2">
            <GoogleIcon size={16} />
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[var(--fg-soft)]">
              Google Reviews
            </span>
          </span>
        </div>

        {/* ---- Review cards: mobile carousel / tablet+desktop grid ---- */}
        <div
          ref={trackRef}
          role={isMobile ? "group" : undefined}
          aria-roledescription={isMobile ? "carousel" : undefined}
          aria-label={isMobile ? "Customer reviews" : undefined}
          tabIndex={isMobile ? 0 : undefined}
          onScroll={isMobile ? handleScroll : undefined}
          onKeyDown={isMobile ? handleKeyDown : undefined}
          className="reviews-track -mx-6 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 md:snap-none lg:hidden"
        >
          {visible.map((review, i) => (
            <div
              key={review.id}
              className={`reviews-slide w-[88%] shrink-0 snap-center snap-always md:w-auto ${
                i < INITIAL_VISIBLE ? "review-item" : "review-card-in"
              }`}
              style={
                {
                  "--d": `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`,
                } as React.CSSProperties
              }
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>

        {/* ---- Desktop: seamless infinite auto-scrolling marquee ---- */}
        <div
          ref={marqueeRef}
          onPointerDown={handleMarqueePointerDown}
          onPointerMove={handleMarqueePointerMove}
          onPointerUp={handleMarqueePointerEnd}
          onPointerCancel={handleMarqueePointerEnd}
          onClickCapture={handleMarqueeClickCapture}
          className="marquee-viewport mt-14 hidden select-none touch-pan-x overflow-x-auto overscroll-x-contain pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:block"
        >
          <div className="marquee-track flex w-max">
            <div className="flex shrink-0 gap-6 pr-6">
              {visible.map((review) => (
                <div key={review.id} className="w-[400px] shrink-0">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
            <div className="flex shrink-0 gap-6" aria-hidden="true">
              {visible.map((review) => (
                <div key={`clone-${review.id}`} className="w-[400px] shrink-0">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Pagination dots (mobile only) ---- */}
        {isMobile && visible.length > 1 && (
          <div className="mt-12 flex justify-center md:hidden">
            <div
              className="flex items-center gap-2.5"
              role="group"
              aria-label="Carousel pagination"
            >
              {visible.map((review, i) => {
                const active = i === Math.min(activeIndex, visible.length - 1);
                return (
                  <button
                    key={review.id}
                    type="button"
                    className={`reviews-dot h-2 rounded-full transition-all duration-300 ease-in-out ${
                      active
                        ? "w-6 bg-[var(--accent)]"
                        : "w-2 bg-[var(--fg-muted)] opacity-40 hover:opacity-70"
                    }`}
                    aria-label={`Go to review ${i + 1} of ${visible.length}`}
                    aria-current={active ? "true" : undefined}
                    onClick={() => goTo(i)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
