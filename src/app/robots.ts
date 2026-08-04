import type { MetadataRoute } from "next";
import { DEFAULT_SEO } from "@/lib/seo/defaults";
import { getSeo } from "@/lib/seo/service";
import { resolveSiteUrl } from "@/lib/seo/types";

export const dynamic = "force-dynamic";

/**
 * Dynamic robots.txt driven by the SEO panel's Index toggle and canonical URL.
 * Admin and API areas are always excluded from crawling.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  let seo;
  try {
    seo = await getSeo();
  } catch {
    seo = DEFAULT_SEO;
  }

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
