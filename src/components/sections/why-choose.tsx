"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { features, whyChoose, type WhyChooseIcon } from "@/lib/content/why-choose";
import {
  ChefHatIcon,
  ClockIcon,
  FlameIcon,
  HeartIcon,
  LeafIcon,
  UsersIcon,
} from "@/components/ui/icons";

const ICONS: Record<WhyChooseIcon, (p: { size?: number }) => React.ReactNode> = {
  flame: (p) => <FlameIcon {...p} />,
  leaf: (p) => <LeafIcon {...p} />,
  chef: (p) => <ChefHatIcon {...p} />,
  users: (p) => <UsersIcon {...p} />,
  clock: (p) => <ClockIcon {...p} />,
  heart: (p) => <HeartIcon {...p} />,
};

const CARD_W = 0.84;
const STEP = CARD_W;
const SPRING = "cubic-bezier(0.16,1,0.3,1)";
const POP = "cubic-bezier(0.34,1.3,0.64,1)";
const EASE = "cubic-bezier(0.22,1,0.36,1)";

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function MosaicTile({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const Icon = ICONS[feature.icon];
  return (
    <div
      className="wcu-item group relative aspect-[4/5] overflow-hidden sm:aspect-[4/3]"
      style={{ "--d": `${index * 120}ms` } as React.CSSProperties}
    >
      <Image
        src={feature.image}
        alt=""
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover object-center transition-transform duration-[350ms] ease-in-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-[var(--tile-overlay)] transition-colors duration-[350ms] ease-in-out group-hover:bg-[var(--tile-overlay-hover)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="relative z-10 flex h-full flex-col items-start justify-end p-8 sm:p-10">
        <div className="flex flex-col items-start transition-transform duration-[350ms] ease-in-out group-hover:-translate-y-1.5">
          <span className="text-[var(--accent)] transition-transform duration-[350ms] ease-in-out group-hover:scale-110">
            <Icon size={26} />
          </span>
          <h3
            className="mt-4 text-2xl leading-tight text-white sm:text-[1.7rem]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {feature.title}
          </h3>
          {feature.note && (
            <p className="mt-1.5 text-sm font-semibold tracking-[0.08em] text-[var(--accent)]">
              {feature.note}
            </p>
          )}
          <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-white/75">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function DesktopGalleryTile({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const Icon = ICONS[feature.icon];
  return (
    <div className="wcu-item" style={{ "--d": `${index * 120}ms` } as React.CSSProperties}>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-[24px] transition-[box-shadow] duration-[350ms] ease-in-out hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.45)]">
        <Image
          src={feature.image}
          alt=""
          fill
          sizes="(min-width: 1280px) 33vw, 50vw"
          className="object-cover transition-transform duration-[350ms] ease-in-out group-hover:scale-[1.03]"
          style={{ objectPosition: feature.objectPosition ?? "50% 50%" }}
        />
        <div className="absolute inset-0 bg-[var(--tile-overlay)] transition-colors duration-[350ms] ease-in-out group-hover:bg-[var(--tile-overlay-hover)]" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-8 pb-12 lg:p-10 lg:pb-14">
          <div className="flex w-full max-w-[88%] flex-col items-start transition-transform duration-[350ms] ease-in-out group-hover:-translate-y-1">
            <span className="text-[var(--accent)] transition-transform duration-[350ms] ease-in-out group-hover:scale-110">
              <Icon size={22} />
            </span>
            <h3
              className="mt-5 text-[1.6rem] leading-tight text-white"
              style={{
                fontFamily: "var(--font-serif)",
                textShadow: "0 2px 18px rgba(0,0,0,0.55)",
              }}
            >
              {feature.title}
            </h3>
            {feature.note && (
              <p
                className="mt-2 text-sm font-semibold tracking-[0.08em] text-[var(--accent)]"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
              >
                {feature.note}
              </p>
            )}
            <p
              className="mt-3 max-w-[25ch] text-[0.92rem] font-light leading-relaxed text-white/80"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
            >
              {feature.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileCard({
  feature,
  active = false,
}: {
  feature: (typeof features)[number];
  active?: boolean;
}) {
  const Icon = ICONS[feature.icon];
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-[24px] transition-[box-shadow] duration-500 ease-out ${
        active
          ? "shadow-[0_35px_80px_-32px_rgba(0,0,0,0.7)]"
          : "shadow-[0_14px_38px_-34px_rgba(0,0,0,0.4)]"
      }`}
    >
      <Image
        src={feature.image}
        alt=""
        fill
        sizes="84vw"
        className="object-cover"
        style={{ objectPosition: feature.objectPosition ?? "50% 50%" }}
      />
      <div className="absolute inset-0 bg-[var(--overlay)]" />
      <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
        <span className="text-[var(--accent)]">
          <Icon size={22} />
        </span>
        <h3
          className="mt-3 text-2xl font-bold leading-tight text-white"
          style={{
            fontFamily: "var(--font-serif)",
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
          }}
        >
          {feature.title}
        </h3>
        {feature.note && (
          <p
            className="mt-1.5 text-xs font-semibold tracking-[0.08em] text-[var(--accent)]"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
          >
            {feature.note}
          </p>
        )}
        <p
          className="mt-2 text-sm font-medium leading-relaxed text-white/80"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
        >
          {feature.description}
        </p>
      </div>
    </div>
  );
}

function MobileCarousel() {
  const TOTAL = features.length + 1;
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [width, setWidth] = useState(0);
  const [noTrans, setNoTrans] = useState(false);

  const startX = useRef(0);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth || 1);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const step = width * STEP;
  const startOffset = width * (1 - CARD_W) / 2;

  const goTo = useCallback((target: number) => {
    if (target >= TOTAL) {
      setNoTrans(true);
      setIndex(0);
      requestAnimationFrame(() => setNoTrans(false));
    } else if (target < 0) {
      setNoTrans(true);
      setIndex(TOTAL - 1);
      requestAnimationFrame(() => {
        setNoTrans(false);
        setIndex(TOTAL - 2);
      });
    } else {
      setIndex(target);
    }
  }, [TOTAL]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setDragX(0);
    startX.current = e.clientX;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    velocity.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX.current;
    const dt = now - lastT.current;
    if (dt > 0) velocity.current = dx / dt;
    lastX.current = e.clientX;
    lastT.current = now;
    setDragX(e.clientX - startX.current);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const threshold = width * 0.1;
    let target = index;
    if (dragX < -threshold || velocity.current < -0.3) target = index + 1;
    else if (dragX > threshold || velocity.current > 0.3) target = index - 1;
    setDragX(0);
    goTo(target);
  };

  const activeIdx = index % features.length;
  const trackX = -(index * step) + startOffset + dragX;
  const trackTransition =
    dragging || noTrans ? "none" : `transform 0.6s ${SPRING}`;
  const slideTransition = dragging
    ? "none"
    : `opacity 0.6s ${EASE}, transform 0.6s ${POP}, filter 0.6s ${EASE}`;

  return (
    <div className="wcu-item sm:hidden" style={{ "--d": "400ms" } as React.CSSProperties}>
      <div
        ref={viewportRef}
        className="select-none overflow-hidden py-6"
        style={{
          touchAction: "pan-y",
          cursor: dragging ? "grabbing" : "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="flex w-full will-change-transform"
          style={{ transform: `translate3d(${trackX}px,0,0)`, transition: trackTransition }}
        >
          {[...features, features[0]].map((feature, k) => {
            const off = (k - index) + (width ? dragX / step : 0);
            const s = smoothstep(Math.abs(off));
            const isActive = k === index;
            return (
              <div
                key={`${feature.image}-${k}`}
                className="w-[84%] shrink-0"
                style={{
                  paddingRight: k === TOTAL - 1 ? 0 : 12,
                  opacity: 1 - 0.25 * s,
                  transform: `scale(${1 - 0.08 * s})`,
                  filter: s > 0.02 ? `blur(${2 * s}px)` : "none",
                  transition: slideTransition,
                  zIndex: isActive ? 10 : 0,
                }}
                aria-hidden={!isActive}
              >
                <div className="aspect-[4/5] w-full">
                  <MobileCard feature={feature} active={isActive} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* premium progress indicator */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          {features.map((feature, i) => (
            <button
              key={feature.image}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${feature.title}`}
              aria-current={activeIdx === i}
              className={`h-1 rounded-full transition-all duration-500 ease-out ${
                activeIdx === i
                  ? "w-8 bg-[var(--accent)]"
                  : "w-4 bg-[var(--dot)]"
              }`}
            />
          ))}
        </div>
        <span className="text-[0.7rem] font-light tracking-[0.3em] text-[var(--fg-muted)]">
          {String(activeIdx + 1).padStart(2, "0")} /{" "}
          {String(features.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

export function WhyChoose() {
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
      id="why-choose"
      ref={sectionRef}
      className={`relative bg-[var(--section-bg)] py-20 lg:py-32 ${
        inView ? "wcu-in" : ""
      }`}
      aria-labelledby="why-choose-heading"
    >
      {/* ---- Heading ---- */}
      <div className="mx-auto max-w-[1200px] px-6 text-center lg:px-10">
        <p
          className="wcu-item text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]"
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          {whyChoose.eyebrow}
        </p>
        <h2
          id="why-choose-heading"
          className="wcu-item mt-5 text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.05] text-[var(--fg)]"
          style={{ fontFamily: "var(--font-serif)", "--d": "120ms" } as React.CSSProperties}
        >
          {whyChoose.titleA}
          <span className="block">{whyChoose.titleB}</span>
        </h2>
        <p
          className="wcu-item mx-auto mt-6 max-w-2xl text-[1.02rem] font-light leading-relaxed text-[var(--fg-soft)]"
          style={{ "--d": "240ms" } as React.CSSProperties}
        >
          {whyChoose.description}
        </p>
      </div>

      {/* ---- Editorial image mosaic (tablet only, zero gap) ---- */}
      <div className="mx-auto mt-16 hidden max-w-[1600px] grid-cols-1 gap-0 sm:grid sm:grid-cols-2 lg:hidden">
        {features.map((feature, i) => (
          <MosaicTile key={feature.title} feature={feature} index={i} />
        ))}
      </div>

      {/* ---- Desktop image gallery (3 cols × 2 rows, 4:3 cards, 24px gap) ---- */}
      <div className="mx-auto mt-16 hidden max-w-[1600px] grid-cols-1 gap-6 lg:grid lg:grid-cols-3 lg:px-20">
        {features.map((feature, i) => (
          <DesktopGalleryTile key={feature.title} feature={feature} index={i} />
        ))}
      </div>

      {/* ---- Mobile center-focus carousel ---- */}
      <MobileCarousel />

      {/* ---- Statement ---- */}
      <div className="wcu-item mx-auto mt-16 max-w-[1200px] px-6 text-center lg:mt-28 lg:px-10">
        <span className="mx-auto mb-7 block h-px w-16 bg-[var(--accent)]" />
        <p
          className="text-[clamp(1.3rem,2.6vw,1.85rem)] leading-snug text-[var(--fg)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {whyChoose.statement}
        </p>
      </div>
    </section>
  );
}
