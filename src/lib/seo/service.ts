import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { DEFAULT_SEO } from "./defaults";
import type { SeoData, SeoRow } from "./types";

const SINGLETON_ID = 1;

/** Map a Prisma row to the API shape. */
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

/** Map validated SEO data into a Prisma create/update payload (no meta fields). */
function toPrismaInput(data: Omit<SeoData, "updatedAt">): Prisma.SiteSEOCreateInput {
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

/** Fetch the single SiteSEO row. If none exists yet, seeds it with defaults and returns those. */
export async function getSeo(): Promise<SeoData> {
  let row = await db.siteSEO.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) {
    row = await db.siteSEO.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: toPrismaInput(DEFAULT_SEO),
    });
  }
  return rowToSeo(row);
}

/** Upsert the singleton row with validated SEO settings. */
export async function saveSeo(data: Omit<SeoData, "updatedAt">): Promise<SeoData> {
  const input = toPrismaInput(data);
  const row = await db.siteSEO.upsert({
    where: { id: SINGLETON_ID },
    update: input,
    create: input,
  });
  return rowToSeo(row);
}
