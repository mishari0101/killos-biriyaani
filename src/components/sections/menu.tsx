"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { menu } from "@/lib/content/menu";
import { ArrowRightIcon, ChevronDownIcon, ImageIcon } from "@/components/ui/icons";

export interface SectionMenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
}

export interface SectionCategory {
  id: string;
  label: string;
}

const STAGGER_MS = 55;
const MAX_STAGGER = 8;
const VISIBLE_COUNT = 6;

function DishCard({ item, index }: { item: SectionMenuItem; index: number }) {
  const delay = Math.min(index, MAX_STAGGER) * STAGGER_MS;
  return (
    <article
      className="menu-card-in group relative flex flex-col rounded-[28px] border border-[var(--menu-card-border)] bg-[var(--menu-card-bg)] shadow-[var(--menu-card-shadow)] transition-all duration-300 ease-in-out hover:-translate-y-2.5 hover:border-[var(--menu-card-border-hover)] hover:shadow-[var(--menu-card-shadow-hover)]"
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      {/* ---- Floating food image (placeholder until real photos are added) ---- */}
      <div className="relative pt-[50%]">
        <div className="absolute left-1/2 top-0 aspect-square w-[64%] -translate-x-1/2 -translate-y-[21%] overflow-hidden rounded-[24px] bg-[#191919] shadow-[0_18px_34px_-16px_var(--shadow-color)] ring-1 ring-[var(--menu-card-border)]">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 42vw"
              className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#232323] via-[#1c1c1c] to-[#171717]">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/25">
                <ImageIcon size={20} />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ---- Body ---- */}
      <div className="relative z-10 flex flex-1 flex-col px-3 pb-5 pt-1 text-center sm:px-6 sm:pb-6 lg:px-7 lg:pb-7">
        <h3
          className="text-[1.3rem] font-bold leading-snug text-[var(--fg)] sm:text-[1.35rem]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {item.name}
        </h3>
        <p className="mx-auto mt-2.5 max-w-[26ch] text-[0.88rem] font-medium leading-relaxed text-[var(--fg-soft)]">
          {item.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-7 sm:gap-3">
          <span className="whitespace-nowrap text-[1rem] font-bold leading-none text-[var(--brand-cta)] sm:text-[1.15rem] lg:text-[1.35rem]">
            {item.price}
          </span>
          <button
            type="button"
            aria-label={`Order ${item.name}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--brand-cta)] text-[var(--brand-cta)] transition-all duration-300 ease-in-out group-hover:bg-[var(--brand-cta)] group-hover:text-white group-hover:shadow-[0_10px_24px_-10px_rgba(192,57,43,0.6)] hover:bg-[var(--brand-cta-strong)] hover:text-white sm:h-10 sm:w-10 sm:rounded-[12px] lg:h-11 lg:w-11"
          >
            <ArrowRightIcon size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function Menu({
  items,
  categories,
}: {
  items: SectionMenuItem[];
  categories: SectionCategory[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState<string>("all");
  const [expanded, setExpanded] = useState(false);

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

  const filtered = useMemo(
    () =>
      active === "all"
        ? items
        : items.filter((m) => m.category === active),
    [active, items]
  );

  const visibleItems = expanded ? filtered : filtered.slice(0, VISIBLE_COUNT);
  const hiddenItems = filtered.slice(VISIBLE_COUNT);
  const hasMore = filtered.length > VISIBLE_COUNT;

  const handleCategory = (id: string) => {
    setActive(id);
    setExpanded(false);
  };

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
      id="menu"
      ref={sectionRef}
      className={`relative scroll-mt-24 bg-[var(--menu-bg)] py-24 lg:py-36 ${
        inView ? "menu-in" : ""
      }`}
      aria-labelledby="menu-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* ---- Header ---- */}
        <div ref={headerRef} className="text-center">
          <p
            className="menu-item text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {menu.eyebrow}
          </p>
          <h2
            id="menu-heading"
            className="menu-item mt-6 text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-[1.08] tracking-[0.01em] text-[var(--fg)]"
            style={{ fontFamily: "var(--font-serif)", "--d": "120ms" } as React.CSSProperties}
          >
            {menu.titleA}
            <em className="mt-1 block italic text-[var(--accent)]">
              {menu.titleB}
            </em>
          </h2>
          <p
            className="menu-item mx-auto mt-6 max-w-[52ch] text-[1rem] font-normal leading-[1.8] text-[var(--fg-soft)]"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            {menu.description}
          </p>
        </div>

        {/* ---- Category filter ---- */}
        <div
          className="menu-item mt-12 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0"
          style={{ "--d": "360ms" } as React.CSSProperties}
        >
          {[{ id: "all", label: "All" }, ...categories].map((cat) => {
            const isActive = cat.id === active;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategory(cat.id)}
                aria-pressed={isActive}
                className={`h-11 shrink-0 rounded-full border px-6 text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-out ${
                  isActive
                    ? "border-transparent bg-[var(--brand-cta)] text-white shadow-[0_14px_30px_-12px_rgba(192,57,43,0.6)]"
                    : "border-[var(--menu-pill-border)] bg-[var(--menu-pill-bg)] text-[var(--fg-soft)] hover:border-[var(--menu-pill-hover-border)] hover:text-[var(--fg)]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ---- Menu grid ---- */}
        {inView && (
          <div className="mt-16 lg:mt-24">
            <div
              id="menu-grid"
              key={active}
              className="grid grid-cols-2 gap-x-3 gap-y-20 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-7"
            >
              {visibleItems.map((item, i) => (
                <DishCard key={item.id} item={item} index={i} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-[var(--menu-pill-border)] bg-[var(--menu-pill-bg)] px-6 py-16 text-center">
                <p
                  className="text-[1.05rem] font-semibold text-[var(--fg)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  No dishes here yet
                </p>
                <p className="mx-auto mt-2 max-w-[38ch] text-[0.88rem] leading-relaxed text-[var(--fg-soft)]">
                  We are still cooking up this category — check back soon or explore
                  everything we have under All.
                </p>
              </div>
            )}

            {/* ---- Collapsible region for the remaining dishes ---- */}
            {hasMore && (
              <div
                className="grid"
                style={{
                  gridTemplateRows: expanded ? "1fr" : "0fr",
                  transition:
                    "grid-template-rows 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-20 pt-20 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-7">
                    {hiddenItems.map((item, i) => (
                      <div
                        key={item.id}
                        className={`menu-expand-card ${
                          expanded ? "is-expanded" : ""
                        }`}
                        style={{ "--i": i } as React.CSSProperties}
                      >
                        <DishCard item={item} index={i + VISIBLE_COUNT} />
                      </div>
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
                  aria-controls="menu-grid"
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
        )}
      </div>
    </section>
  );
}
