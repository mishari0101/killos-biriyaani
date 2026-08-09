import type { MetadataRoute } from "next";
import { DEFAULT_SEO } from "@/lib/seo/defaults";
import { resolveSiteUrl } from "@/lib/seo/types";
import { listPublishedPosts } from "@/lib/content/blog";

export const dynamic = "force-dynamic";

/**
 * Sitemap built from the static canonical URL configuration (DEFAULT_SEO).
 * The homepage is a single page; section anchors live on that one URL, so only
 * the homepage, the blog index and every static post are listed as entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = DEFAULT_SEO;
  const base = resolveSiteUrl(seo);
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  for (const post of listPublishedPosts()) {
    entries.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
