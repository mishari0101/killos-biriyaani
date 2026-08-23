"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gallery } from "@/lib/content/gallery";
import { isManagedImageUrl } from "@/lib/uploads/client";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  CloseIcon,
  ExpandIcon,
  ImageIcon,
} from "@/components/ui/icons";

const VISIBLE_COUNT = 8;
const STAGGER_MS = 55;
const MAX_STAGGER = 8;

export interface SectionGalleryItem {
  id: string;
  label: string;
  caption: string;
  aspect: string;
  image: string;
}

interface GalleryProps {
  items: SectionGalleryItem[];
}

function Tile({ item, onOpen }: { item: SectionGalleryItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${item.label}`}
      className="group relative block w-full overflow-hidden rounded-[20px] bg-[var(--gallery-tile-bg)] ring-1 ring-[var(--gallery-tile-border)] shadow-[var(--gallery-tile-shadow)] transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[var(--gallery-tile-shadow-hover)]"
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: item.aspect }}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.caption}
            fill
            unoptimized={isManagedImageUrl(item.image)}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#242424] via-[#1d1d1d] to-[#171717]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/25">
              <ImageIcon size={22} />
            </span>
          </div>
        )}

        {/* Caption gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-left sm:p-5">
          <span
            className="block truncate text-[0.95rem] font-bold leading-snug text-white sm:text-[1.02rem]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {item.label}
          </span>
          <span className="mt-1.5 block text-[0.72rem] font-normal leading-snug text-white/70">
            {item.caption}
          </span>
        </div>

        {/* Expand chip on hover */}
        <span className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/10 text-white opacity-0 ring-1 ring-white/20 backdrop-blur-md transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <ExpandIcon size={16} />
        </span>
      </div>
    </button>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: SectionGalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const touchX = useRef<number | null>(null);
  const item = items[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      className="lb-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-[var(--lb-bg)] p-4 backdrop-blur-xl sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.label} — full view`}
      onClick={onClose}
    >
      <div
        className="lb-panel relative flex max-h-full w-full max-w-5xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="text-[0.72rem] font-light uppercase tracking-[0.32em] text-[var(--lb-muted)]">
            {index + 1}
            <span className="mx-1 opacity-50">/</span>
            {items.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--lb-control-bg)] text-[var(--lb-fg)] ring-1 ring-[var(--lb-control-border)] transition-all duration-300 hover:bg-white/15 active:scale-95"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Media + arrows */}
        <div className="relative">
          <div
            className="lb-media relative mx-auto flex w-full max-w-4xl items-center justify-center"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const delta = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (delta > 50) onPrev();
              else if (delta < -50) onNext();
            }}
          >
            {item.image ? (
              <Image
                src={item.image}
                alt={item.caption}
                width={1600}
                height={1067}
                unoptimized={isManagedImageUrl(item.image)}
                sizes="(min-width: 1024px) 60rem, 100vw"
                className="h-auto max-h-[68vh] w-auto max-w-full object-contain"
              />
            ) : (
              <div className="flex h-[42vh] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#262626] via-[#1e1e1e] to-[#171717] ring-1 ring-[var(--lb-control-border)] sm:h-[58vh]">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/25">
                  <ImageIcon size={26} />
                </span>
                <span className="text-[0.7rem] uppercase tracking-[0.3em] text-white/30">
                  Photo coming soon
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--lb-control-bg)] text-[var(--lb-fg)] ring-1 ring-[var(--lb-control-border)] transition-all duration-300 hover:bg-white/15 active:scale-95 sm:left-4 sm:h-12 sm:w-12 lg:-left-4"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--lb-control-bg)] text-[var(--lb-fg)] ring-1 ring-[var(--lb-control-border)] transition-all duration-300 hover:bg-white/15 active:scale-95 sm:right-4 sm:h-12 sm:w-12 lg:-right-4"
          >
            <ArrowRightIcon size={20} />
          </button>
        </div>

        {/* Caption */}
        <div className="mt-6 text-center">
          <h3
            className="text-[1.35rem] font-bold text-[var(--lb-fg)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {item.label}
          </h3>
          <p className="mx-auto mt-2 max-w-[52ch] text-[0.88rem] leading-relaxed text-[var(--lb-muted)]">
            {item.caption}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Gallery({ items }: GalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

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

  const hasMore = items.length > VISIBLE_COUNT;
  const visibleItems = expanded ? items : items.slice(0, VISIBLE_COUNT);
  const hiddenItems = items.slice(VISIBLE_COUNT);

  const openAt = (i: number) => setLightbox(i);
  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(
    () =>
      setLightbox((i) => (i === null ? i : (i - 1 + items.length) % items.length)),
    [items.length]
  );
  const next = useCallback(
    () => setLightbox((i) => (i === null ? i : (i + 1) % items.length)),
    [items.length]
  );

  const toggleMore = () => {
    if (expanded) {
      setExpanded(false);
      const header = headerRef.current;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (header && header.getBoundingClientRect().top < 0) {
        header.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      }
    } else {
      setExpanded(true);
    }
  };

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className={`relative scroll-mt-24 bg-[var(--gallery-bg)] py-24 lg:py-36 ${
        inView ? "gallery-in" : ""
      }`}
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        {/* ---- Header ---- */}
        <div ref={headerRef} className="text-center">
          <p
            className="gallery-item text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {gallery.eyebrow}
          </p>
          <h2
            id="gallery-heading"
            className="gallery-item mt-6 text-[clamp(2.4rem,4.8vw,4.1rem)] font-bold uppercase leading-[1.02] tracking-[-0.01em] text-[var(--fg)]"
            style={
              { fontFamily: "var(--font-display)", "--d": "120ms" } as React.CSSProperties
            }
          >
            {gallery.titleA}
            <em className="mt-1 block not-italic text-[var(--accent)]">
              {gallery.titleB}
            </em>
          </h2>
          <p
            className="gallery-item mx-auto mt-6 max-w-[52ch] text-[1rem] font-normal leading-[1.8] text-[var(--fg-soft)]"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            {gallery.description}
          </p>
        </div>

        {/* ---- Masonry grid ---- */}
        <div className="mt-16 lg:mt-24">
          <div className="columns-2 gap-4 sm:columns-3 sm:gap-6 lg:columns-4">
            {visibleItems.map((item, i) => (
              <figure
                key={item.id}
                className="gallery-item mb-4 break-inside-avoid sm:mb-6"
                style={
                  {
                    "--d": `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`,
                  } as React.CSSProperties
                }
              >
                <Tile item={item} onOpen={() => openAt(i)} />
              </figure>
            ))}
          </div>

          {/* ---- Collapsible region for remaining tiles ---- */}
          {hasMore && (
            <div
              className="grid"
              style={{
                gridTemplateRows: expanded ? "1fr" : "0fr",
                transition: "grid-template-rows 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="columns-2 gap-4 pt-4 sm:columns-3 sm:gap-6 lg:columns-4">
                  {hiddenItems.map((item, i) => (
                    <figure
                      key={item.id}
                      className={`gallery-expand-card mb-4 break-inside-avoid sm:mb-6 ${
                        expanded ? "is-expanded" : ""
                      }`}
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      <Tile item={item} onOpen={() => openAt(i + VISIBLE_COUNT)} />
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- View More / View Less toggle ---- */}
          {hasMore && (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                onClick={toggleMore}
                aria-expanded={expanded}
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[var(--brand-cta)] text-white shadow-[0_18px_50px_-18px_rgba(192,57,43,0.55)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[var(--brand-cta-strong)] hover:shadow-[0_26px_60px_-18px_rgba(192,57,43,0.65)] active:scale-[0.97] sm:w-auto sm:px-12"
              >
                <span className="text-[0.78rem] font-medium uppercase tracking-[0.18em]">
                  {expanded ? "View Less" : "View More"}
                </span>
                <span className="inline-flex transition-transform duration-300 ease-in-out group-hover:-rotate-12">
                  <span
                    className={`inline-flex transition-transform duration-300 ease-in-out ${
                      expanded ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDownIcon size={16} />
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- Lightbox ---- */}
      {lightbox !== null && (
        <Lightbox
          items={items}
          index={lightbox}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </section>
  );
}
