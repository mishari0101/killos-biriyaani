/** Section copy and static posts for the public /blog. The blog is now a static,
    code-managed area — posts are added here in `blogPosts`, not through the dashboard. */
export const blogContent = {
  eyebrow: "Our Journal",
  titleA: "News, Stories",
  titleB: "& Offers",
  description:
    "The latest from Killo's Biriyani — new menu items, special offers, behind-the-scenes stories and everything happening in our kitchens.",
  emptyTitle: "Fresh stories are on their way",
  emptyDescription:
    "There are no posts here yet. Check back soon for news, offers and stories from the Killo's Biriyani kitchen.",
} as const;

/** Static post shape rendered by the public /blog index and article pages. */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  author: string;
  featured: boolean;
  publishedAt: string | null;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
}

/** Static posts shown on the public /blog. Add entries here to publish a story. */
export const blogPosts: BlogPost[] = [];

/** Public posts for `/blog`: featured first, then insertion order. */
export function listPublishedPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.id.localeCompare(b.id)
  );
}

/** Fetch a single post by slug (null when the slug does not exist). */
export function getPublishedPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

/** Split a comma-separated tags string into trimmed, de-duplicated tag labels. */
export function parseTags(tags: string): string[] {
  return Array.from(
    new Set(
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}
