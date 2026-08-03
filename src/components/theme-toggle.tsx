"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

const MORPH_MS = 600;

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [shown, setShown] = useState<"dark" | "light">(theme);
  const [incoming, setIncoming] = useState<"dark" | "light" | null>(null);
  const reducedRef = useRef(false);
  const firstResolveRef = useRef(true);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (theme === shown) return;

    if (firstResolveRef.current) {
      firstResolveRef.current = false;
      setShown(theme);
      return;
    }

    if (reducedRef.current) {
      setShown(theme);
      return;
    }

    setIncoming(theme);
    const id = window.setTimeout(() => {
      setShown(theme);
      setIncoming(null);
    }, MORPH_MS);
    return () => window.clearTimeout(id);
  }, [theme, shown]);

  const morphing = incoming !== null;

  const moonClass = morphing
    ? shown === "dark" && incoming === "light"
      ? "theme-morph-icon anim-out"
      : incoming === "dark"
        ? "theme-morph-icon anim-in"
        : "theme-morph-icon is-hidden"
    : shown === "dark"
      ? "theme-morph-icon is-active"
      : "theme-morph-icon is-hidden";

  const sunClass = morphing
    ? shown === "light" && incoming === "dark"
      ? "theme-morph-icon anim-out"
      : incoming === "light"
        ? "theme-morph-icon anim-in"
        : "theme-morph-icon is-hidden"
    : shown === "light"
      ? "theme-morph-icon is-active"
      : "theme-morph-icon is-hidden";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
      className="relative flex h-[46px] w-[46px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--hairline-strong)] bg-[var(--glass-bg)] shadow-[0_8px_24px_-12px_var(--shadow-color)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-[2px] hover:border-[var(--accent)] hover:bg-[var(--glass-bg)] hover:shadow-[0_16px_34px_-14px_var(--shadow-color),0_0_22px_-4px_var(--shadow-accent)] active:translate-y-0 active:scale-[0.94] active:shadow-[0_4px_14px_-10px_var(--shadow-color)]"
    >
      <span
        className="relative flex h-[22px] w-[22px] items-center justify-center"
        aria-hidden="true"
      >
        <span className={moonClass}>
          <MoonIcon size={21} className="text-white" />
        </span>
        <span className={sunClass}>
          <SunIcon size={21} className="text-[#C9A227]" />
        </span>
      </span>
    </button>
  );
}
