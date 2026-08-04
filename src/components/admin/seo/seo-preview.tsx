"use client";

import { useMemo } from "react";
import { LinkIcon } from "@/components/ui/icons";

export interface PreviewValues {
  siteTitle: string;
  title: string;
  description: string;
  url: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

function clamp(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function displayUrl(value: string): string {
  const t = value.trim();
  if (!t) return "your-site.com";
  try {
    const url = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    return `${url.host}${url.pathname === "/" ? "" : url.pathname}${url.search}`;
  } catch {
    return t;
  }
}

function domainOnly(value: string): string {
  return displayUrl(value).split(/[/?]/)[0];
}

function ImagePreview({
  src,
  label,
  className,
}: {
  src: string;
  label: string;
  className?: string;
}) {
  return src.trim() ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} />
  ) : (
    <div className={`flex items-center justify-center bg-[#eef1f4] text-[#8b949e] ${className ?? ""}`}>
      <LinkIcon size={18} />
      <span className="ml-1.5 text-[0.65rem] font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function SeoPreview({ values }: { values: PreviewValues }) {
  const googleTitle = clamp(values.title || values.siteTitle, 58);
  const googleDescription = clamp(values.description, 155);
  const googleUrl = displayUrl(values.url);

  const socialTitle = clamp(values.ogTitle || values.title || values.siteTitle, 88);
  const socialDescription = clamp(values.ogDescription || values.description, 200);
  const socialImage = values.ogImage.trim();

  const twitterTitle = clamp(values.twitterTitle || socialTitle, 70);
  const twitterDescription = clamp(values.twitterDescription || socialDescription, 200);
  const twitterImage = values.twitterImage.trim() || socialImage;

  const siteLabel = clamp(values.siteTitle || "Your Restaurant", 40);

  return (
    <div className="space-y-4">
      {/* Desktop Google */}
      <div className="rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm">
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--admin-fg-muted)]">
          Google Search — Desktop
        </p>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-[1.1rem] leading-snug text-[#1a0dab]">
            {googleTitle || <span className="text-gray-300">Meta title preview</span>}
          </div>
          <div className="mt-0.5 text-[0.82rem] leading-snug text-[#202124]">
            {googleUrl || <span className="text-gray-300">your-site.com</span>}
          </div>
          <div className="mt-1 text-[0.82rem] leading-[1.4] text-[#4d5156]">
            {googleDescription || <span className="text-gray-300">Meta description preview</span>}
          </div>
        </div>
      </div>

      {/* Mobile Google */}
      <div className="rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm">
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--admin-fg-muted)]">
          Google Search — Mobile
        </p>
        <div className="mx-auto w-full max-w-[22rem] overflow-hidden rounded-2xl border border-gray-200">
          <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f2b7b0]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f6dc9f]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#b7e2b3]" />
            <span className="ml-1 truncate rounded bg-white px-2 py-0.5 text-[0.6rem] text-gray-500">
              {googleUrl || "your-site.com"}
            </span>
          </div>
          <div className="bg-white px-4 py-3">
            <div className="text-[1.05rem] leading-snug text-[#1a0dab]">
              {googleTitle || <span className="text-gray-300">Meta title preview</span>}
            </div>
            <div className="mt-0.5 text-[0.72rem] text-[#202124]">
              {googleUrl || <span className="text-gray-300">your-site.com</span>}
            </div>
            <div className="mt-1 text-[0.78rem] leading-[1.45] text-[#4d5156]">
              {googleDescription || <span className="text-gray-300">Meta description preview</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Social preview */}
      <div className="rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm">
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--admin-fg-muted)]">
          Social Share — Open Graph
        </p>
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="relative h-40 w-full">
              <ImagePreview src={socialImage} label="OG image" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-[rgba(0,0,0,0.72)] px-4 py-2.5">
                <p className="truncate text-[0.78rem] font-semibold text-white">{siteLabel}</p>
                <p className="truncate text-[0.68rem] text-white/70">{domainOnly(values.url)}</p>
              </div>
            </div>
            <div className="bg-[#f0f2f5] px-4 py-3">
              <p className="truncate text-[0.95rem] font-semibold text-[#050505]">
                {socialTitle || <span className="text-gray-400">OG title preview</span>}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[0.78rem] leading-[1.4] text-[#65676b]">
                {socialDescription || (
                  <span className="text-gray-400">OG description preview</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-3 overflow-hidden rounded-xl border border-gray-200 bg-[#f7f9f9] p-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
              <ImagePreview src={twitterImage} label="Card" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.8rem] font-semibold text-[#0f1419]">
                {twitterTitle || <span className="text-gray-400">Twitter title preview</span>}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[0.7rem] leading-[1.4] text-[#536471]">
                {twitterDescription || (
                  <span className="text-gray-400">Twitter description preview</span>
                )}
              </p>
              <p className="mt-1 truncate text-[0.65rem] uppercase tracking-wide text-[#8b98a5]">
                {domainOnly(values.url)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function usePreviewValues(
  form: {
    siteTitle: string;
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
  }
): PreviewValues {
  return useMemo(
    () => ({
      siteTitle: form.siteTitle,
      title: form.metaTitle,
      description: form.metaDescription,
      url: form.canonicalUrl,
      ogTitle: form.ogTitle,
      ogDescription: form.ogDescription,
      ogImage: form.ogImage,
      twitterTitle: form.twitterTitle,
      twitterDescription: form.twitterDescription,
      twitterImage: form.twitterImage,
    }),
    [form]
  );
}
