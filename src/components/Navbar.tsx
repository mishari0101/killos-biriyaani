"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  logo,
  moreNavLinks,
  navLinks,
  primaryNavLinks,
  site,
} from "@/lib/content/site";
import { useLoading } from "@/components/ui/loading-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  PhoneIcon,
  SunIcon,
} from "@/components/ui/icons";

const SECTION_IDS = [
  "home",
  "about",
  "menu",
  "gallery",
  "reviews",
  "branches",
  "faq",
  "contact",
];

function useActiveSection(): string {
  const [active, setActive] = useState("");
  useEffect(() => {
    const onScroll = () => {
      const pos = window.scrollY + 160;
      let current = "";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= pos) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return active;
}

function MoreItem({ ready, activeHref }: { ready: boolean; activeHref: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const active = moreNavLinks.some((link) => link.href === activeHref);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <li
      ref={ref}
      className={`nav-more transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        open ? "nav-more-open" : ""
      }`}
      style={{
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(10px)",
        transitionDelay: ready ? "520ms" : "0ms",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`nav-link nav-more-trigger ${active ? "nav-link-active" : ""}`}
      >
        More
        <ChevronDownIcon size={13} className="nav-more-chevron" />
      </button>
      <div className="nav-dropdown" role="menu" aria-label="More sections">
        <div className="nav-dropdown-panel">
          {moreNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`nav-dropdown-item ${
                link.href === activeHref ? "nav-dropdown-item-active" : ""
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </li>
  );
}

export function Navbar() {
  const { ready } = useLoading();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const activeHref = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const iconBtn =
    "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--icon-border)] bg-[var(--icon-bg)] text-[var(--icon-fg)] backdrop-blur-md transition-all duration-400 hover:scale-105 hover:border-[var(--icon-border)] hover:bg-[var(--icon-bg-hover)] hover:text-[var(--fg)] hover:shadow-[0_0_24px_var(--icon-glow)]";

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 transition-all duration-1000 sm:px-6 sm:pt-5 lg:px-8"
        style={{
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(-140%)",
        }}
      >
        <nav
          className={`mx-auto flex h-[66px] w-full max-w-[1400px] items-center justify-between rounded-[22px] border border-[var(--nav-border)] px-5 backdrop-blur-[18px] backdrop-saturate-150 transition-all duration-700 sm:px-7 ${
            scrolled
              ? "bg-[var(--nav-bg-scrolled)] shadow-[0_24px_60px_-24px_var(--shadow-color)] backdrop-blur-[22px]"
              : "bg-[var(--nav-bg)] shadow-[0_18px_45px_-24px_var(--shadow-color)]"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          aria-label="Primary"
        >
          {/* ---- Logo ---- */}
          <a
            href="#home"
            className="group flex items-center gap-3"
            aria-label={`${site.name} — home`}
          >
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[12px] bg-white shadow-[0_10px_25px_-10px_var(--shadow-color)] ring-1 ring-white/20 transition-transform duration-500 ease-out group-hover:scale-105">
              {!imageFailed ? (
                <Image
                  src={logo.src}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="h-full w-full object-contain"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <span
                  className="text-lg font-semibold text-[#1a1a1a]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  K
                </span>
              )}
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span
                className="text-[1.05rem] tracking-wide text-[var(--fg)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Killo&rsquo;s
              </span>
              <span className="mt-1 text-[0.55rem] uppercase tracking-[0.42em] text-[var(--accent)]">
                Biriyani
              </span>
            </span>
          </a>

          {/* ---- Desktop links ---- */}
          <ul className="hidden items-center gap-9 lg:flex">
            {primaryNavLinks.map((link, i) => (
              <Fragment key={link.href}>
                  <li
                    className="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      opacity: ready ? 1 : 0,
                      transform: ready ? "translateY(0)" : "translateY(10px)",
                      transitionDelay: ready
                        ? `${
                            300 +
                            i * 55 +
                            (i === primaryNavLinks.length - 1 ? 55 : 0)
                          }ms`
                        : "0ms",
                    }}
                  >
                    <a
                      href={link.href}
                      className={`nav-link ${
                        link.href === activeHref ? "nav-link-active" : ""
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                {i === primaryNavLinks.length - 2 && (
                  <MoreItem ready={ready} activeHref={activeHref} />
                )}
              </Fragment>
            ))}
          </ul>

          {/* ---- Actions ---- */}
          <div className="flex items-center gap-3">
            {site.phoneHref && (
              <a
                href={site.phoneHref}
                className={iconBtn}
                aria-label={`Call ${site.phone}`}
              >
                <PhoneIcon size={16} />
              </a>
            )}
            <span className="hidden lg:block">
              <ThemeToggle />
            </span>
            <a href="#reservation" className="btn btn-brand h-10 px-6">
              Reserve
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`${iconBtn} lg:hidden`}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <MenuIcon size={18} />
            </button>
          </div>
        </nav>
      </header>

      {/* ---- Mobile full-screen glass menu ---- */}
      <div
        className={`fixed inset-0 z-[90] p-4 sm:p-6 lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 rounded-[28px] bg-[var(--menu-scrim)] backdrop-blur-md transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`relative flex h-full w-full flex-col rounded-[24px] border border-[var(--menu-border)] bg-[var(--menu-bg)] shadow-[0_30px_80px_-30px_var(--menu-shadow)] backdrop-blur-[24px] backdrop-saturate-150 transition-all duration-600 ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          {/* header row */}
          <div className="flex items-center justify-between px-6 py-5">
            <span className="flex items-center gap-3">
              {!imageFailed ? (
                <Image
                  src={logo.src}
                  alt=""
                  width={38}
                  height={38}
                  unoptimized
                  className="h-10 w-10 rounded-[12px] bg-white object-contain"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-base font-semibold text-[#1a1a1a]">
                  K
                </span>
              )}
              <span
                className="text-lg text-[var(--fg)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Killo&rsquo;s
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`${iconBtn} h-11 w-11`}
              aria-label="Close menu"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          {/* links */}
          <nav className="flex flex-1 flex-col justify-center gap-1 overflow-y-auto px-8" aria-label="Mobile">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between border-b border-[var(--hairline)] py-4 text-xl text-[var(--fg)] transition-colors duration-300 hover:text-[var(--accent)]"
                style={{
                  fontFamily: "var(--font-serif)",
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(16px)",
                  transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${140 + i * 60}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${140 + i * 60}ms, color 0.3s ease`,
                }}
              >
                {link.label}
                <span className="text-[var(--accent)] opacity-60 transition-all duration-300 group-hover:translate-x-1.5 group-hover:opacity-100">
                  →
                </span>
              </a>
            ))}
          </nav>

          {/* theme row */}
          <div className="px-8 pb-2 pt-4">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--hairline)] bg-[var(--icon-bg)] px-5 py-4">
              <span className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--fg)]">
                <SunIcon size={16} className="text-[var(--accent)]" />
                Theme
              </span>
              <ThemeToggle />
            </div>
          </div>

          {/* bottom actions */}
          <div className="px-6 pb-6 pt-3">
            <a
              href="#reservation"
              onClick={() => setOpen(false)}
              className="btn btn-brand h-12 w-full"
            >
              Reserve a Table
            </a>
            {site.phoneHref && (
              <a
                href={site.phoneHref}
                className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--icon-border)] bg-[var(--icon-bg)] text-sm uppercase tracking-[0.14em] text-[var(--fg)] backdrop-blur-md transition-colors duration-400 hover:border-[var(--icon-border)] hover:bg-[var(--icon-bg-hover)]"
              >
                <PhoneIcon size={16} /> Call Us
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
