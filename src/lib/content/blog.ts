/** Section copy for the public /blog index. No seed posts — the blog shows an
    elegant empty state until the owner publishes their first article. */
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
