import { isValidImageUrl } from "@/lib/menu/validate";
import type { SeoData } from "./types";

export type SeoInput = Omit<SeoData, "updatedAt">;

export type SeoErrors = Partial<Record<keyof SeoInput, string>>;

const URL_RE = /^https?:\/\//i;

function isValidUrl(value: string): boolean {
  if (!value.trim()) return true;
  if (!URL_RE.test(value.trim())) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidId(value: string, pattern: RegExp): boolean {
  if (!value.trim()) return true;
  return pattern.test(value.trim());
}

/** Google Analytics (GA4) Measurement ID, e.g. G-ABC123XYZ. */
const GA_RE = /^G-[A-Z0-9]{6,12}$/i;

/** Google Tag Manager Container ID, e.g. GTM-ABC1234. */
const GTM_RE = /^GTM-[A-Z0-9]{4,9}$/i;

/** Validate the full SEO payload. Returns a map of field → error message. */
export function validateSeo(data: SeoInput): SeoErrors {
  const errors: SeoErrors = {};

  const max = (field: keyof SeoInput, value: string, limit: number, label?: string) => {
    if (value.trim().length > limit) {
      errors[field] = `${label ?? field} must be ${limit} characters or fewer.`;
    }
  };

  max("siteTitle", data.siteTitle, 200, "Site title");
  max("metaTitle", data.metaTitle, 200, "Meta title");
  max("metaDescription", data.metaDescription, 400, "Meta description");
  max("keywords", data.keywords, 400, "Keywords");
  max("canonicalUrl", data.canonicalUrl, 500, "Canonical URL");
  max("ogTitle", data.ogTitle, 200, "Open Graph title");
  max("ogDescription", data.ogDescription, 400, "Open Graph description");
  max("ogImage", data.ogImage, 500, "Open Graph image");
  max("twitterTitle", data.twitterTitle, 200, "Twitter title");
  max("twitterDescription", data.twitterDescription, 400, "Twitter description");
  max("twitterImage", data.twitterImage, 500, "Twitter image");
  max("googleAnalyticsId", data.googleAnalyticsId, 40, "Google Analytics ID");
  max("googleTagManagerId", data.googleTagManagerId, 40, "Google Tag Manager ID");
  max("googleSiteVerification", data.googleSiteVerification, 200, "Google verification");
  max("facebookDomainVerification", data.facebookDomainVerification, 200, "Facebook verification");

  if (!isValidUrl(data.canonicalUrl)) {
    errors.canonicalUrl = "Enter a valid http(s) URL.";
  }

  if (!isValidImageUrl(data.ogImage)) {
    errors.ogImage = "Enter a valid image URL.";
  }

  if (!isValidImageUrl(data.twitterImage)) {
    errors.twitterImage = "Enter a valid image URL.";
  }

  if (!isValidId(data.googleAnalyticsId, GA_RE)) {
    errors.googleAnalyticsId = "Use a GA4 Measurement ID like G-ABC123XYZ.";
  }

  if (!isValidId(data.googleTagManagerId, GTM_RE)) {
    errors.googleTagManagerId = "Use a Tag Manager ID like GTM-ABC1234.";
  }

  return errors;
}
