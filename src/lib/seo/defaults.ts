import type { SeoData } from "./types";

/**
 * Used when no SiteSEO row exists yet — seeds the singleton with the values
 * that match the current static metadata, so the public site is unchanged
 * until the owner actively edits SEO settings.
 */
export const DEFAULT_SEO: SeoData = {
  siteTitle: "Killo's Biriyani",
  metaTitle: "Killo's Biriyani — Arabian Restaurant",
  metaDescription:
    "The taste of Arabia — dum-cooked over open fire, served with a touch of luxury. Open daily 10:00 AM – 12:00 AM.",
  keywords: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  googleSiteVerification: "",
  facebookDomainVerification: "",
  robotsIndex: true,
  robotsFollow: true,
  updatedAt: null,
};
