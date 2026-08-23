"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { menu } from "@/lib/content/menu";
import { isManagedImageUrl } from "@/lib/uploads/client";
import { waHref } from "@/lib/contact";
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
/* Initial batch size per breakpoint: mobile / tablet / desktop */
const PAGE_SIZES = { mobile: 4, tablet: 6, desktop: 8 } as const;

/** Pre-filled WhatsApp order message for a dish (null when no number is configured). */
function orderHref(waPhone: string | undefined, itemName: string): string | undefined {
  if (!waPhone?.trim()) return undefined;
  return waHref(waPhone.trim(), `Hi Killo's Biriyani, I'd like to order ${itemName}.`);
}

function DishCard({ item, index, waPhone }: { item: SectionMenuItem; index: number; waPhone?: string }) {
  const delay = Math.min(index, MAX_STAGGER) * STAGGER_MS;
  const href = orderHref(waPhone, item.name);
  return (
    <a
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      aria-label={`Order ${item.name} on WhatsApp`}
      className="menu-card-in group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[16px] border border-[#C9A15C]/10 bg-[#231C17] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.65)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#C9A15C]/35 hover:shadow-[0_20px_44px_-20px_rgba(0,0,0,0.75)]"
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      {/* ---- Full-bleed food image, 4:3, cropped uniformly ---- */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            unoptimized={isManagedImageUrl(item.image)}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2A211A] via-[#231C17] to-[#1A1410]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A15C]/25 bg-[#C9A15C]/[0.06] text-[#C9A15C]/50">
              <ImageIcon size={20} />
            </span>
          </div>
        )}
      </div>

      {/* ---- Body ---- */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          className="truncate text-[20px] font-bold leading-[1.35] text-white"
          style={{ fontFamily: "var(--font-serif)" }}
          title={item.name}
        >
          {item.name}
        </h3>
        <p
          className="mt-1.5 h-[21px] truncate text-[14px] leading-[21px] text-white/55"
          title={item.description || undefined}
        >
          {item.description || "\u00A0"}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="whitespace-nowrap text-[18px] font-bold leading-none text-[#C9A15C]">
            {item.price}
          </span>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C9A15C]/70 bg-transparent text-[#C9A15C] transition-colors duration-300 ease-out group-hover:border-[#C9A15C] group-hover:bg-[#C9A15C] group-hover:text-[#1A1410]"
          >
            <ArrowRightIcon size={16} />
          </span>
        </div>
      </div>
    </a>
  );
}

function MobileDishCard({ item, index, waPhone }: { item: SectionMenuItem; index: number; waPhone?: string }) {
  const delay = Math.min(index, MAX_STAGGER) * STAGGER_MS;
  const href = orderHref(waPhone, item.name);
  return (
    <a
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      aria-label={`Order ${item.name} on WhatsApp`}
      className="menu-card-in relative flex touch-manipulation cursor-pointer items-stretch gap-3.5 rounded-[16px] border border-[#C9A15C]/10 bg-[#231C17] p-4 shadow-[0_10px_28px_-18px_rgba(0,0,0,0.7)] transition-transform duration-200 ease-out active:scale-[0.98]"
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      {/* ---- Square food image, 40% width ---- */}
      <div className="relative aspect-square w-[40%] shrink-0 overflow-hidden rounded-[12px]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            unoptimized={isManagedImageUrl(item.image)}
            sizes="(max-width: 639px) 42vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2A211A] via-[#231C17] to-[#1A1410]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A15C]/25 bg-[#C9A15C]/[0.06] text-[#C9A15C]/50">
              <ImageIcon size={18} />
            </span>
          </div>
        )}
      </div>

      {/* ---- Content right, name/desc/price on a uniform rhythm ---- */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="min-w-0">
          <h3
            className="truncate text-[17px] font-bold leading-[1.3] text-white"
            style={{ fontFamily: "var(--font-serif)" }}
            title={item.name}
          >
            {item.name}
          </h3>
          <p
            className="mt-1 truncate text-[13px] leading-[18px] text-white/55"
            title={item.description || undefined}
          >
            {item.description || "\u00A0"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="whitespace-nowrap text-[18px] font-bold leading-none text-[#C9A15C]">
            {item.price}
          </span>
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C9A15C]/70 bg-transparent text-[#C9A15C] transition-colors duration-300 ease-out group-active:border-[#C9A15C] group-active:bg-[#C9A15C] group-active:text-[#1A1410]"
          >
            <ArrowRightIcon size={16} />
          </span>
        </div>
      </div>
    </a>
  );
}

export function Menu({
  items,
  categories,
  waPhone,
}: {
  items: SectionMenuItem[];
  categories: SectionCategory[];
  waPhone?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState<string>("all");
  const initialPage =
    typeof window === "undefined"
      ? PAGE_SIZES.mobile
      : window.innerWidth >= 1024
        ? PAGE_SIZES.desktop
        : window.innerWidth >= 640
          ? PAGE_SIZES.tablet
          : PAGE_SIZES.mobile;
  const [pageSize, setPageSize] = useState<number>(initialPage);
  const [shown, setShown] = useState<number>(initialPage);
  const [loading, setLoading] = useState(false);
  const [barStuck, setBarStuck] = useState(false);
  const filterSentinelRef = useRef<HTMLDivElement>(null);
  const loadTimerRef = useRef<number | null>(null);

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
    const sentinel = filterSentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => setBarStuck(!entry.isIntersecting),
      // Viewport top boundary sits just below the fixed navbar (16px pad + 66px bar)
      { rootMargin: "-88px 0px 0px 0px", threshold: 0 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setPageSize(
        w >= 1024 ? PAGE_SIZES.desktop : w >= 640 ? PAGE_SIZES.tablet : PAGE_SIZES.mobile
      );
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(
    () => () => {
      if (loadTimerRef.current != null) window.clearTimeout(loadTimerRef.current);
    },
    []
  );

  const filtered = useMemo(
    () =>
      active === "all"
        ? items
        : items.filter((m) => m.category === active),
    [active, items]
  );

  const paged = useMemo(() => filtered.slice(0, shown), [filtered, shown]);

  const handleCategory = (id: string) => {
    if (loadTimerRef.current != null) {
      window.clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
    setLoading(false);
    setActive(id);
    setShown(pageSize);
  };

  const handleViewMore = () => {
    if (loading || shown >= filtered.length) return;
    setLoading(true);
    loadTimerRef.current = window.setTimeout(() => {
      setShown((c) => Math.min(c + pageSize, filtered.length));
      setLoading(false);
    }, 420);
  };

  const handleShowLess = () => {
    setShown(pageSize);
    const header = headerRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (header && header.getBoundingClientRect().top < 0) {
      header.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  return (
    <section
      id="menu"
      ref={sectionRef}
      className={`relative scroll-mt-24 bg-[#1A1410] py-24 lg:py-36 ${
        inView ? "menu-in" : ""
      }`}
      aria-labelledby="menu-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* ---- Header ---- */}
        <div ref={headerRef} className="text-center">
          <p
            className="menu-item text-[0.7rem] font-light uppercase tracking-[0.42em] text-[#C9A15C]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {menu.eyebrow}
          </p>
          <h2
            id="menu-heading"
            className="menu-item mt-6 text-[clamp(2.4rem,4.8vw,4.1rem)] font-bold uppercase leading-[1.02] tracking-[-0.01em] text-white"
            style={{ fontFamily: "var(--font-display)", "--d": "120ms" } as React.CSSProperties}
          >
            {menu.titleA}
            <em className="mt-1 block not-italic text-[#C9A15C]">
              {menu.titleB}
            </em>
          </h2>
          <p
            className="menu-item mx-auto mt-6 max-w-[52ch] text-[1rem] font-normal leading-[1.8] text-white/60"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            {menu.description}
          </p>
        </div>

        {/* ---- Category filter (sticky below navbar on mobile) ----
            Direct child of the tall container so the sticky bar has
            travel room all the way down to the View More toggle. */}
        <div
          className={`menu-item sticky top-[88px] z-30 -mx-6 mt-12 bg-[#1A1410]/95 px-6 py-2.5 backdrop-blur-md transition-shadow duration-300 sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none ${
            barStuck
              ? "shadow-[0_14px_30px_-14px_rgba(0,0,0,0.85)]"
              : "shadow-none"
          }`}
          style={{ "--d": "360ms" } as React.CSSProperties}
        >
          <div
            ref={filterSentinelRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-4 h-4"
          />
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
            {[{ id: "all", label: "All" }, ...categories].map((cat) => {
              const isActive = cat.id === active;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategory(cat.id)}
                  aria-pressed={isActive}
                  className={`h-11 shrink-0 cursor-pointer rounded-full border px-6 text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-out ${
                    isActive
                      ? "border-[#C9A15C] bg-[#C9A15C] text-[#1A1410]"
                      : "border-[#C9A15C]/45 bg-transparent text-[#C9A15C] hover:border-[#C9A15C] hover:bg-[#C9A15C]/10"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- Menu cards ---- */}
        {inView && (
          <div className="mt-8 sm:mt-16 lg:mt-24">
            {/* ---- Mobile: stacked horizontal cards, 12px gap, 18px side margins ---- */}
            <div
              id="menu-grid-mobile"
              key={`m-${active}`}
              className="-mx-1.5 flex flex-col gap-3 sm:hidden"
            >
              {paged.map((item, i) => (
                <MobileDishCard key={item.id} item={item} index={i} waPhone={waPhone} />
              ))}
            </div>

            {/* ---- Tablet/desktop grid ---- */}
            <div
              id="menu-grid"
              key={`d-${active}`}
              className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3"
            >
              {paged.map((item, i) => (
                <DishCard key={item.id} item={item} index={i} waPhone={waPhone} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="rounded-[16px] border border-dashed border-[#C9A15C]/25 bg-white/[0.02] px-6 py-16 text-center">
                <p
                  className="text-[1.05rem] font-semibold text-white"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  No dishes here yet
                </p>
                <p className="mx-auto mt-2 max-w-[38ch] text-[0.88rem] leading-relaxed text-white/55">
                  We are still cooking up this category — check back soon or explore
                  everything we have under All.
                </p>
              </div>
            )}

            {/* ---- Pagination: View More / Show Less ---- */}
            {filtered.length > pageSize && (
              <div className="-mx-1.5 mt-10 flex justify-center sm:mx-0">
                <button
                  type="button"
                  onClick={shown < filtered.length ? handleViewMore : handleShowLess}
                  aria-busy={loading}
                  aria-live="polite"
                  disabled={loading}
                  className="group flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-[#C9A15C] bg-[#C9A15C] text-[#1A1410] shadow-[0_16px_40px_-16px_rgba(201,161,92,0.45)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98] disabled:cursor-wait disabled:opacity-85 sm:w-auto sm:px-12"
                >
                  {loading ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      />
                      <span className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">
                        Loading…
                      </span>
                    </>
                  ) : shown < filtered.length ? (
                    <>
                      <span className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">
                        View More
                      </span>
                      <ChevronDownIcon
                        size={16}
                        className="transition-transform duration-300 ease-out group-hover:translate-y-0.5"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">
                        Show Less
                      </span>
                      <ChevronDownIcon
                        size={16}
                        className="rotate-180 transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
                      />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
