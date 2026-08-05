/** Wire shape returned by the API and used by the SEO manager. */
export interface SeoData {
  siteTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  googleSiteVerification: string;
  facebookDomainVerification: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  // meta
  updatedAt: string | null;
}

/** Raw row as stored in Firestore. */
export interface SeoRow {
  siteTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  googleSiteVerification: string;
  facebookDomainVerification: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resolve the site's base URL in this order:
 * 1. SiteSEO.canonicalUrl origin (the admin-controlled domain)
 * 2. NEXT_PUBLIC_SITE_URL
 * 3. NEXT_PUBLIC_VERCEL_URL
 * 4. localhost fallback for development
 */
export function resolveSiteUrl(seo?: Pick<SeoData, "canonicalUrl"> | null): string {
  if (seo?.canonicalUrl) {
    try {
      const parsed = new URL(seo.canonicalUrl);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.origin;
      }
    } catch {
      // fall through
    }
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      return new URL(process.env.NEXT_PUBLIC_SITE_URL).origin;
    } catch {
      // fall through
    }
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  return "http://localhost:3131";
}

/** Make a path or relative URL absolute against the site's base URL. */
export function toAbsoluteUrl(value: string, baseUrl: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return `${baseUrl}${trimmed}`;
  return `${baseUrl}/${trimmed}`;
}
