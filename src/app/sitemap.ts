import type { MetadataRoute } from "next";
import { DEFAULT_SEO } from "@/lib/seo/defaults";
import { getSeo } from "@/lib/seo/service";
import { resolveSiteUrl } from "@/lib/seo/types";
import { listPublicBlogs } from "@/lib/blog/service";

export const dynamic = "force-dynamic";

/**
 * Dynamic sitemap built from the canonical URL set in the SEO panel.
 * The homepage is a single page; section anchors live on that one URL, so only
 * the homepage, the blog index and every published post are listed as entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let seo;
  try {
    seo = await getSeo();
  } catch {
    seo = DEFAULT_SEO;
  }

  const base = resolveSiteUrl(seo);
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  let posts: Awaited<ReturnType<typeof listPublicBlogs>> = [];
  try {
    posts = await listPublicBlogs();
  } catch {
    posts = [];
  }

  for (const post of posts) {
    entries.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
