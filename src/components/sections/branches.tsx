"use client";

import { useEffect, useRef, useState } from "react";
import {
  branches,
  seedBranches,
  type BranchItem,
} from "@/lib/content/branches";
import {
  fetchBranches,
  BRANCHES_POLL_MS,
  telHref,
  directionsUrl,
} from "@/lib/branches";
import {
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  RouteIcon,
} from "@/components/ui/icons";

const STAGGER_MS = 110;

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--branch-chip-border)] bg-[var(--branch-chip-bg)] text-[var(--accent)]">
        <Icon size={17} />
      </span>
      <div className="min-w-0 pt-1">
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-[var(--fg-muted)]">
          {label}
        </p>
        <div className="mt-1.5 text-[0.95rem] font-medium leading-relaxed text-[var(--fg)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function BranchCard({ branch, index }: { branch: BranchItem; index: number }) {
  const phones = branch.phones.length ? branch.phones : ["076 66 36 37 3"];

  return (
    <article className="branch-item flex h-full flex-col rounded-[24px] border border-[var(--branch-card-border)] bg-[var(--branch-card-bg)] p-6 shadow-[var(--branch-card-shadow)] transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-[var(--branch-card-shadow-hover)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--branch-chip-border)] bg-[var(--branch-chip-bg)] px-3.5 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-[var(--fg-muted)]">
          <MapPinIcon size={12} />
          Branch {String(index + 1).padStart(2, "0")}
        </span>
        {branch.primary && (
          <span className="inline-flex items-center rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
            Head Branch
          </span>
        )}
      </div>

      <h3
        className="mt-6 text-[1.45rem] font-bold leading-snug tracking-[0.01em] text-[var(--fg)]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {branch.name}
      </h3>

      <div className="mt-7 space-y-5">
        <InfoRow icon={MapPinIcon} label="Address">
          {branch.address}
        </InfoRow>
        <InfoRow icon={ClockIcon} label="Opening Hours">
          {branch.hours}
        </InfoRow>
        <InfoRow icon={PhoneIcon} label="Phone Numbers">
          {phones.map((phone) => (
            <a
              key={phone}
              href={telHref(phone)}
              className="block transition-colors duration-300 ease-in-out hover:text-[var(--accent)]"
            >
              {phone}
            </a>
          ))}
        </InfoRow>
      </div>

      <div className="mt-auto space-y-3 pt-8">
        <a
          href={telHref(phones[0])}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[var(--brand-cta)] text-[0.78rem] font-medium uppercase tracking-[0.16em] text-white shadow-[var(--brand-cta-shadow)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[var(--brand-cta-strong)] hover:shadow-[0_22px_54px_-18px_rgba(192,57,43,0.6)] active:scale-[0.98]"
        >
          <PhoneIcon size={15} />
          Call Now
        </a>
        <a
          href={directionsUrl(branch)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-[var(--branch-chip-border)] bg-[var(--branch-chip-bg)] text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--fg)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[var(--branch-chip-border)] hover:bg-[var(--branch-chip-bg-hover)] active:scale-[0.98]"
        >
          <RouteIcon size={15} />
          Get Directions
        </a>
      </div>
    </article>
  );
}

export function Branches() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [items, setItems] = useState<BranchItem[]>(seedBranches);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const next = await fetchBranches();
      if (alive) setItems(next);
    };
    load();
    if (BRANCHES_POLL_MS > 0) {
      const id = setInterval(load, BRANCHES_POLL_MS);
      return () => {
        alive = false;
        clearInterval(id);
      };
    }
    return () => {
      alive = false;
    };
  }, []);

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
      id="branches"
      ref={sectionRef}
      className={`relative scroll-mt-24 bg-[var(--branch-bg)] py-24 lg:py-36 ${
        inView ? "branch-in" : ""
      }`}
      aria-labelledby="branches-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="text-center">
          <p
            className="branch-item text-[0.7rem] font-light uppercase tracking-[0.42em] text-[var(--accent)]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {branches.eyebrow}
          </p>
          <h2
            id="branches-heading"
            className="branch-item mt-6 text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-[1.08] tracking-[0.01em] text-[var(--fg)]"
            style={
              { fontFamily: "var(--font-serif)", "--d": "120ms" } as React.CSSProperties
            }
          >
            {branches.titleA}
            <em className="mt-1 block italic text-[var(--accent)]">
              {branches.titleB}
            </em>
          </h2>
          <p
            className="branch-item mx-auto mt-6 max-w-[52ch] text-[1rem] font-normal leading-[1.8] text-[var(--fg-soft)]"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            {branches.description}
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:gap-7">
          {items.map((branch, i) => (
            <div
              key={branch.id}
              className="h-full"
              style={
                {
                  "--d": `${Math.min(i, 4) * STAGGER_MS}ms`,
                } as React.CSSProperties
              }
            >
              <BranchCard branch={branch} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
