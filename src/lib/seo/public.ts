import "server-only";

import type { Metadata } from "next";
import { cache } from "react";
import { site as siteContent } from "@/lib/content/site";
import { getSettings } from "@/lib/settings/service";
import { DEFAULT_SEO } from "./defaults";
import { resolveSiteUrl, toAbsoluteUrl, type SeoData } from "./types";

export const DEFAULT_TITLE = "Killo's Biriyani — Arabian Restaurant";
export const DEFAULT_DESCRIPTION =
  "The taste of Arabia — dum-cooked over open fire, served with a touch of luxury. Open daily 10:00 AM – 12:00 AM.";

/** Static SEO configuration — the public site no longer reads SEO from the dashboard. */
const safeGetSeo = (): SeoData => DEFAULT_SEO;

export const getSettingsSafe = cache(async () => {
  try {
    return await getSettings();
  } catch {
    return null;
  }
});

/** Analytics identifiers to inject (both optional, empty when unset). */
export async function getAnalyticsIds(): Promise<{ gaId: string; gtmId: string }> {
  const seo = await safeGetSeo();
  return {
    gaId: seo.googleAnalyticsId.trim(),
    gtmId: seo.googleTagManagerId.trim(),
  };
}

export async function getSiteSeo() {
  const [seo, settings] = await Promise.all([safeGetSeo(), getSettingsSafe()]);
  const baseUrl = resolveSiteUrl(seo);
  const name =
    seo.siteTitle.trim() || settings?.restaurantName.trim() || siteContent.name;
  return { seo, settings, baseUrl, name };
}

/**
 * Resolved default share-card (OG + Twitter) values for the site. Reused by the
 * homepage metadata and by child pages (blog index) so every page shares one
 * consistent brand card unless it provides its own image/text.
 */
export async function getSiteShareMeta() {
  const { seo, settings, baseUrl, name } = await getSiteSeo();

  const title = seo.metaTitle.trim() || DEFAULT_TITLE;
  const description = seo.metaDescription.trim() || DEFAULT_DESCRIPTION;
  const ogTitle = seo.ogTitle.trim() || title;
  const ogDescription = seo.ogDescription.trim() || description;
  const ogImage =
    toAbsoluteUrl(seo.ogImage, baseUrl) ||
    (settings?.ogImageUrl ? toAbsoluteUrl(settings.ogImageUrl, baseUrl) : "");
  const twitterTitle = seo.twitterTitle.trim() || ogTitle;
  const twitterDescription = seo.twitterDescription.trim() || ogDescription;
  const twitterImage = toAbsoluteUrl(seo.twitterImage, baseUrl) || ogImage;

  return {
    seo,
    settings,
    baseUrl,
    name,
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
  };
}

/** Compose the site-wide Metadata from SiteSEO + RestaurantSettings. */
export async function buildSiteMetadata(): Promise<Metadata> {
  const { seo, settings, baseUrl, name, title, description, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage } =
    await getSiteShareMeta();

  const siteName = name || title;
  const favicon = settings?.faviconUrl.trim();

  const keywords = seo.keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(baseUrl),
    title: { default: title, template: `%s | ${siteName}` },
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: baseUrl },
    robots: {
      index: seo.robotsIndex,
      follow: seo.robotsFollow,
      googleBot: {
        index: seo.robotsIndex,
        follow: seo.robotsFollow,
        "max-snippet": -1,
      },
    },
    verification: {
      google: seo.googleSiteVerification.trim() || undefined,
      other: seo.facebookDomainVerification.trim()
        ? { "facebook-domain-verification": seo.facebookDomainVerification.trim() }
        : undefined,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: baseUrl,
      siteName,
      type: "website",
      locale: "en_US",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: twitterImage ? [twitterImage] : undefined,
    },
    icons: favicon ? { icon: favicon, shortcut: favicon, apple: favicon } : undefined,
  };
}
