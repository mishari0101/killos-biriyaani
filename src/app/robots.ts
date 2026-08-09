import type { MetadataRoute } from "next";
import { DEFAULT_SEO } from "@/lib/seo/defaults";
import { resolveSiteUrl } from "@/lib/seo/types";

export const dynamic = "force-dynamic";

/**
 * robots.txt driven by the static SEO configuration (DEFAULT_SEO). Admin and
 * API areas are always excluded from crawling.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = DEFAULT_SEO;
  const base = resolveSiteUrl(seo);

  return {
    rules: {
      userAgent: "*",
      allow: seo.robotsIndex ? "/" : undefined,
      disallow: seo.robotsIndex ? ["/admin", "/api"] : "/",
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
