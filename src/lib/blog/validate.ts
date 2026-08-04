import { isValidImageUrl } from "@/lib/menu/validate";

export interface BlogInput {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  author: string;
  featured: boolean;
  published: boolean;
  /** ISO string, or null when the post has not been published yet. */
  publishedAt: string | null;
  displayOrder: number;
  seoTitle: string;
  seoDescription: string;
}

export type BlogErrors = Partial<Record<keyof BlogInput, string>>;

/** Turn a title into a URL-safe slug (lowercased, dashes). */
export function slugifyBlog(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/** Validate a blog post payload. Returns a map of field → error message. */
export function validateBlog(data: BlogInput): BlogErrors {
  const errors: BlogErrors = {};

  if (!data.title.trim()) {
    errors.title = "Title is required.";
  } else if (data.title.trim().length > 200) {
    errors.title = "Must be 200 characters or fewer.";
  }

  if (!data.excerpt.trim()) {
    errors.excerpt = "Excerpt is required.";
  } else if (data.excerpt.trim().length > 500) {
    errors.excerpt = "Must be 500 characters or fewer.";
  }

  if (!data.content.trim()) {
    errors.content = "Content is required.";
  } else if (data.content.trim().length > 100000) {
    errors.content = "Must be 100,000 characters or fewer.";
  }

  if (data.category.trim().length > 80) {
    errors.category = "Must be 80 characters or fewer.";
  }

  if (data.tags.trim().length > 400) {
    errors.tags = "Must be 400 characters or fewer.";
  }

  if (data.author.trim().length > 120) {
    errors.author = "Must be 120 characters or fewer.";
  }

  if (data.coverImage.trim() && !isValidImageUrl(data.coverImage)) {
    errors.coverImage = "Enter a valid image URL.";
  }

  if (data.seoTitle.trim().length > 200) {
    errors.seoTitle = "Must be 200 characters or fewer.";
  }

  if (data.seoDescription.trim().length > 400) {
    errors.seoDescription = "Must be 400 characters or fewer.";
  }

  if (
    data.publishedAt &&
    (Number.isNaN(Date.parse(data.publishedAt)) ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(data.publishedAt))
  ) {
    errors.publishedAt = "Enter a valid date and time.";
  }

  if (!Number.isInteger(data.displayOrder) || data.displayOrder < 0 || data.displayOrder > 9999) {
    errors.displayOrder = "Display order must be a whole number from 0–9999.";
  }

  return errors;
}
