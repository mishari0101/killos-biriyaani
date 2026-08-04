"use client";

import { useEffect, useRef, useState } from "react";
import { location } from "@/lib/content/location";
import { type BranchItem } from "@/lib/content/branches";
import { directionsUrl, mapEmbedUrl } from "@/lib/branches";
import { MapPinIcon, RouteIcon } from "@/components/ui/icons";

const STAGGER_MS = 110;

export function Location({ items }: { items: BranchItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

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

  const current = items.find((b) => b.id === activeId) ?? items[0];
  if (!current) return null;

  return (
    <section
      id="location"
      ref={sectionRef}
      className={`relative scroll-mt-24 bg-[var(--location-bg)] py-24 lg:py-36 ${
        inView ? "location-in" : ""
      }`}
      aria-labelledby="location-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="text-center">
          <p
            className="location-item text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {location.eyebrow}
          </p>
          <h2
            id="location-heading"
            className="location-item mt-6 text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-[1.08] tracking-[0.01em] text-[var(--fg)]"
            style={
              { fontFamily: "var(--font-serif)", "--d": "120ms" } as React.CSSProperties
            }
          >
            {location.title}
          </h2>
          <p
            className="location-item mx-auto mt-6 max-w-[52ch] text-[1rem] font-normal leading-[1.8] text-[var(--fg-soft)]"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            {location.description}
          </p>
        </div>

        <div className="location-map mt-14 lg:mt-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] border border-[var(--location-map-border)] bg-[var(--location-card-bg)] shadow-[var(--location-map-shadow)] sm:aspect-[16/9] lg:aspect-[21/9]">
            {inView && (
              <iframe
                key={current.id}
                title={`${current.name} on Google Maps`}
                src={mapEmbedUrl(current)}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="location-map-frame absolute inset-0 h-full w-full border-0"
              />
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:gap-6">
          {items.map((branch, i) => {
            const active = branch.id === current.id;
            return (
              <div
                key={branch.id}
                className="location-card-item h-full"
                style={
                  {
                    "--d": `${Math.min(i, 4) * STAGGER_MS}ms`,
                  } as React.CSSProperties
                }
              >
                <article
                  className={`location-card flex h-full flex-col gap-4 p-5 sm:p-6 ${
                    active ? "location-card-active" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(branch.id)}
                    aria-pressed={active}
                    aria-label={`Show ${branch.name} on the map`}
                    className="group flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <span className="location-card-pin flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                      <MapPinIcon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.6rem] font-medium uppercase tracking-[0.26em] text-[var(--fg-muted)]">
                        Branch {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-1 block text-[1.02rem] font-medium leading-snug text-[var(--fg)]">
                        {branch.address}
                      </span>
                    </span>
                  </button>
                  <a
                    href={directionsUrl(branch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="location-card-cta flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-6"
                  >
                    <RouteIcon size={14} />
                    Get Directions
                  </a>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
