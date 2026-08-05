import "server-only";

import { getSingleton, setSingleton } from "@/lib/firebase/repo";
import { DEFAULT_SEO } from "./defaults";
import type { SeoData, SeoRow } from "./types";

/** Map a stored row to the API shape. */
export function rowToSeo(row: SeoRow): SeoData {
  return {
    siteTitle: row.siteTitle,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    keywords: row.keywords,
    canonicalUrl: row.canonicalUrl,
    ogTitle: row.ogTitle,
    ogDescription: row.ogDescription,
    ogImage: row.ogImage,
    twitterTitle: row.twitterTitle,
    twitterDescription: row.twitterDescription,
    twitterImage: row.twitterImage,
    googleAnalyticsId: row.googleAnalyticsId,
    googleTagManagerId: row.googleTagManagerId,
    googleSiteVerification: row.googleSiteVerification,
    facebookDomainVerification: row.facebookDomainVerification,
    robotsIndex: row.robotsIndex,
    robotsFollow: row.robotsFollow,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Map validated SEO data into a Firestore payload (no meta fields). */
function toStoreInput(data: Omit<SeoData, "updatedAt">): Record<string, unknown> {
  return {
    siteTitle: data.siteTitle,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    keywords: data.keywords,
    canonicalUrl: data.canonicalUrl,
    ogTitle: data.ogTitle,
    ogDescription: data.ogDescription,
    ogImage: data.ogImage,
    twitterTitle: data.twitterTitle,
    twitterDescription: data.twitterDescription,
    twitterImage: data.twitterImage,
    googleAnalyticsId: data.googleAnalyticsId,
    googleTagManagerId: data.googleTagManagerId,
    googleSiteVerification: data.googleSiteVerification,
    facebookDomainVerification: data.facebookDomainVerification,
    robotsIndex: data.robotsIndex,
    robotsFollow: data.robotsFollow,
  };
}

/** Fetch the SiteSEO singleton. If none exists yet, seeds it with defaults and returns those. */
export async function getSeo(): Promise<SeoData> {
  const row = await getSingleton<SeoRow>("siteSeo");
  if (row) return rowToSeo(row);
  await setSingleton("siteSeo", toStoreInput(DEFAULT_SEO));
  const seeded = await getSingleton<SeoRow>("siteSeo");
  return rowToSeo(seeded ?? (toStoreInput(DEFAULT_SEO) as unknown as SeoRow));
}

/** Upsert the SEO singleton with validated settings. */
export async function saveSeo(data: Omit<SeoData, "updatedAt">): Promise<SeoData> {
  await setSingleton("siteSeo", toStoreInput(data));
  const row = await getSingleton<SeoRow>("siteSeo");
  return rowToSeo(row ?? (toStoreInput(data) as unknown as SeoRow));
}
