import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { imageStorage } from "@/lib/uploads/storage";
import type { BlogData, BlogFilters, BlogListResult, BlogRow } from "./types";
import { slugifyBlog, type BlogInput } from "./validate";

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

function toIsoDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value.trim());
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Map a Prisma row to the API shape. */
export function rowToBlog(row: BlogRow): BlogData {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage,
    category: row.category,
    tags: row.tags,
    author: row.author,
    featured: row.featured,
    published: row.published,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    displayOrder: row.displayOrder,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Coerce raw input into a validated shape (missing fields become defaults). */
export function toBlogInput(raw: Record<string, unknown>): BlogInput {
  const published = toBoolean(raw.published);
  const rawPublishedAt = toIsoDate(raw.publishedAt);
  return {
    title: typeof raw.title === "string" ? raw.title : "",
    excerpt: typeof raw.excerpt === "string" ? raw.excerpt : "",
    content: typeof raw.content === "string" ? raw.content : "",
    coverImage: typeof raw.coverImage === "string" ? raw.coverImage : "",
    category: typeof raw.category === "string" ? raw.category : "",
    tags: typeof raw.tags === "string" ? raw.tags : "",
    author: typeof raw.author === "string" ? raw.author : "",
    featured: toBoolean(raw.featured),
    published,
    publishedAt: published ? rawPublishedAt : null,
    displayOrder: Math.trunc(toNumber(raw.displayOrder)),
    seoTitle: typeof raw.seoTitle === "string" ? raw.seoTitle : "",
    seoDescription: typeof raw.seoDescription === "string" ? raw.seoDescription : "",
  };
}

const PUBLIC_ORDER: Prisma.BlogPostOrderByWithRelationInput[] = [
  { featured: "desc" },
  { displayOrder: "asc" },
  { id: "asc" },
];

/** List blog posts with search, status, featured and category filters (admin manager). */
export async function listBlogs(filters: BlogFilters = {}): Promise<BlogListResult> {
  const where: Prisma.BlogPostWhereInput = {};
  if (filters.search) {
    const search = filters.search.trim();
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { category: { contains: search } },
        { tags: { contains: search } },
        { author: { contains: search } },
      ];
    }
  }
  if (filters.status === "published") {
    where.published = true;
  } else if (filters.status === "draft") {
    where.published = false;
  }
  if (filters.featured === "featured") {
    where.featured = true;
  } else if (filters.featured === "regular") {
    where.featured = false;
  }
  if (filters.category) {
    where.category = filters.category;
  }

  const [rows, total, allRows] = await Promise.all([
    db.blogPost.findMany({ where, orderBy: PUBLIC_ORDER }),
    db.blogPost.count({ where }),
    db.blogPost.findMany({ select: { category: true } }),
  ]);

  const categories = Array.from(
    new Set(allRows.map((r) => r.category.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  return { items: rows.map(rowToBlog), total, categories };
}

/** Public posts for `/blog`: published only, featured first, then display order. */
export async function listPublicBlogs(): Promise<BlogData[]> {
  const rows = await db.blogPost.findMany({
    where: { published: true },
    orderBy: PUBLIC_ORDER,
  });
  return rows.map(rowToBlog);
}

/** Fetch a single published post by slug (null for drafts or missing slugs). */
export async function getPublishedBlogBySlug(slug: string): Promise<BlogData | null> {
  const row = await db.blogPost.findFirst({
    where: { slug, published: true },
  });
  return row ? rowToBlog(row) : null;
}

/** Fetch a single post by slug (admin preview — includes drafts). */
export async function getBlogBySlug(slug: string): Promise<BlogData | null> {
  const row = await db.blogPost.findUnique({ where: { slug } });
  return row ? rowToBlog(row) : null;
}

/** Fetch a single post by id (admin edit). */
export async function getBlog(id: number): Promise<BlogData | null> {
  const row = await db.blogPost.findUnique({ where: { id } });
  return row ? rowToBlog(row) : null;
}

/** Pick a slug that is not already taken, appending -2, -3, … on collision. */
async function uniqueSlug(base: string): Promise<string> {
  const clean = slugifyBlog(base);
  if (!clean) return `post-${Date.now()}`;
  const existing = await db.blogPost.findMany({
    where: { slug: { startsWith: clean } },
    select: { slug: true },
  });
  const taken = new Set(existing.map((e) => e.slug));
  if (!taken.has(clean)) return clean;
  let i = 2;
  while (taken.has(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
}

/** Create a blog post. The slug is auto-generated from the title. */
export async function createBlog(data: BlogInput): Promise<BlogData> {
  const slug = await uniqueSlug(data.title);
  const publishedAt = data.published ? data.publishedAt ?? new Date().toISOString() : null;
  const row = await db.blogPost.create({
    data: {
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt.trim(),
      content: data.content,
      coverImage: data.coverImage.trim(),
      category: data.category.trim(),
      tags: data.tags.trim(),
      author: data.author.trim(),
      featured: data.featured,
      published: data.published,
      publishedAt,
      displayOrder: data.displayOrder,
      seoTitle: data.seoTitle.trim(),
      seoDescription: data.seoDescription.trim(),
    },
  });
  return rowToBlog(row);
}

/** Thrown when a post does not exist so the API can map it to 404. */
export class BlogNotFoundError extends Error {
  constructor(public id: number) {
    super(`No blog post found with id ${id}.`);
    this.name = "BlogNotFoundError";
  }
}

/** Remove a managed image file if the URL points at our upload storage. */
async function removeManagedImage(url: string | null): Promise<void> {
  if (!url) return;
  const key = imageStorage.urlToKey(url);
  if (key) await imageStorage.delete(key);
}

/** Update a blog post. The slug stays stable once assigned. */
export async function updateBlog(id: number, data: BlogInput): Promise<BlogData> {
  const previous = await db.blogPost.findUnique({ where: { id } });
  if (!previous) throw new BlogNotFoundError(id);

  const publishedAt = data.published
    ? data.publishedAt ?? previous.publishedAt?.toISOString() ?? new Date().toISOString()
    : data.publishedAt;

  const row = await db.blogPost.update({
    where: { id },
    data: {
      title: data.title.trim(),
      excerpt: data.excerpt.trim(),
      content: data.content,
      coverImage: data.coverImage.trim(),
      category: data.category.trim(),
      tags: data.tags.trim(),
      author: data.author.trim(),
      featured: data.featured,
      published: data.published,
      publishedAt,
      displayOrder: data.displayOrder,
      seoTitle: data.seoTitle.trim(),
      seoDescription: data.seoDescription.trim(),
    },
  });

  if (previous.coverImage && previous.coverImage !== row.coverImage) {
    await removeManagedImage(previous.coverImage);
  }
  return rowToBlog(row);
}

/** Delete a blog post (and its managed cover image, if any). */
export async function deleteBlog(id: number): Promise<void> {
  const previous = await db.blogPost.findUnique({ where: { id } });
  if (!previous) throw new BlogNotFoundError(id);
  await db.blogPost.delete({ where: { id } });
  await removeManagedImage(previous.coverImage);
}

/** Persist a drag-and-drop reorder (displayOrder is compacted to 0..n). */
export async function reorderBlogs(entries: { id: number; displayOrder: number }[]): Promise<void> {
  await db.$transaction(
    entries.map((entry) =>
      db.blogPost.update({
        where: { id: entry.id },
        data: { displayOrder: entry.displayOrder },
      })
    )
  );
}
