import type { BlogPostModel } from "@/generated/prisma/models/BlogPost";

/** Wire shape returned by the API and used by the blog manager. */
export interface BlogData {
  id: number;
  title: string;
  slug: string;
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
  createdAt: string;
  updatedAt: string;
}

/** Raw row as stored by Prisma. */
export type BlogRow = BlogPostModel;

export interface BlogFilters {
  search?: string;
  status?: "published" | "draft";
  featured?: "featured" | "regular";
  category?: string;
}

export interface BlogListResult {
  items: BlogData[];
  total: number;
  /** Distinct categories across all posts, for the filter dropdown. */
  categories: string[];
}
