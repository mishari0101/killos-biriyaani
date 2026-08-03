"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { logo, site } from "@/lib/content/site";
import { useLoading } from "@/components/ui/loading-provider";

export function LoadingScreen() {
  const { phase } = useLoading();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = phase === "done" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "done") return null;

  const exiting = phase === "exiting";

  return (
    <div
      aria-hidden={exiting}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        transform: exiting ? "translateY(-100%)" : "translateY(0)",
        transition: exiting
          ? "transform 0.8s cubic-bezier(0.83, 0, 0.17, 1)"
          : "none",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,var(--loader-g1)_0%,var(--loader-g2)_55%,var(--loader-g3)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.05), transparent 45%)",
        }}
      />

      <div className="relative flex flex-col items-center px-6">
        <div className="relative" style={{ animation: "loader-logo 1.1s cubic-bezier(0.22,1,0.36,1) both" }}>
          {!imageFailed ? (
            <Image
              src={logo.src}
              alt={logo.alt}
              width={132}
              height={132}
              unoptimized
              className="relative z-10 h-[132px] w-[132px] rounded-[28px] object-contain bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/20"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="relative z-10 flex h-[132px] w-[132px] items-center justify-center rounded-[28px] bg-white text-5xl font-semibold text-[#1a1a1a]" style={{ fontFamily: "var(--font-serif)" }}>
              {site.shortName.replace(/[^A-Za-z]/g, "").slice(0, 1)}
            </div>
          )}
          <svg
            className="absolute -inset-3 h-[156px] w-[156px]"
            viewBox="0 0 156 156"
            fill="none"
          >
            <circle
              cx="78"
              cy="78"
              r="74"
              stroke="var(--accent)"
              strokeWidth="1.25"
              strokeDasharray="566"
              strokeLinecap="round"
              style={{
                animation: "loader-ring 1.6s cubic-bezier(0.22,1,0.36,1) 0.15s both",
              }}
            />
          </svg>
        </div>

        <p
          className="mt-10 text-sm font-light uppercase text-[var(--fg)]"
          style={{ fontFamily: "var(--font-serif)", animation: "loader-text 1s cubic-bezier(0.22,1,0.36,1) 0.45s both" }}
        >
          Killo&rsquo;s Biriyani
        </p>
        <p
          className="mt-2 text-[0.65rem] uppercase tracking-[0.5em] text-[var(--fg-muted)]"
          style={{ animation: "loader-text 1s cubic-bezier(0.22,1,0.36,1) 0.65s both" }}
        >
          Arabian Restaurant
        </p>

        <div className="mt-8 h-px w-40 origin-left bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" style={{ animation: "loader-line 1s cubic-bezier(0.22,1,0.36,1) 0.9s both" }} />
      </div>

      <div className="absolute inset-x-0 bottom-10 flex items-center justify-center gap-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        <span className="text-[0.6rem] uppercase tracking-[0.35em] text-[var(--fg-muted)]">
          Preparing an experience
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      </div>
    </div>
  );
}
