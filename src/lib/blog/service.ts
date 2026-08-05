import "server-only";

import { findAll, findById, createDoc, updateDoc, deleteDoc, updateMany, nextId } from "@/lib/firebase/repo";
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

/** Map a stored row to the API shape. */
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

function comparePublic(a: BlogRow, b: BlogRow): number {
  return Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder || a.id - b.id;
}

function matchesFilters(row: BlogRow, filters: BlogFilters): boolean {
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = `${row.title} ${row.excerpt} ${row.category} ${row.tags} ${row.author}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (filters.status === "published" && !row.published) return false;
  if (filters.status === "draft" && row.published) return false;
  if (filters.featured === "featured" && !row.featured) return false;
  if (filters.featured === "regular" && row.featured) return false;
  if (filters.category && row.category !== filters.category) return false;
  return true;
}

/** List blog posts with search, status, featured and category filters (admin manager). */
export async function listBlogs(filters: BlogFilters = {}): Promise<BlogListResult> {
  const rows = await findAll<BlogRow>("blogPosts");
  const filtered = rows.filter((row) => matchesFilters(row, filters));
  filtered.sort(comparePublic);

  const categories = Array.from(
    new Set(rows.map((r) => r.category.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  return { items: filtered.map(rowToBlog), total: filtered.length, categories };
}

/** Public posts for `/blog`: published only, featured first, then display order. */
export async function listPublicBlogs(): Promise<BlogData[]> {
  const rows = await findAll<BlogRow>("blogPosts");
  return rows.filter((row) => row.published).sort(comparePublic).map(rowToBlog);
}

/** Fetch a single published post by slug (null for drafts or missing slugs). */
export async function getPublishedBlogBySlug(slug: string): Promise<BlogData | null> {
  const rows = await findAll<BlogRow>("blogPosts");
  const row = rows.find((r) => r.slug === slug && r.published);
  return row ? rowToBlog(row) : null;
}

/** Fetch a single post by slug (admin preview — includes drafts). */
export async function getBlogBySlug(slug: string): Promise<BlogData | null> {
  const rows = await findAll<BlogRow>("blogPosts");
  const row = rows.find((r) => r.slug === slug);
  return row ? rowToBlog(row) : null;
}

/** Fetch a single post by id (admin edit). */
export async function getBlog(id: number): Promise<BlogData | null> {
  const row = await findById<BlogRow>("blogPosts", id);
  return row ? rowToBlog(row) : null;
}

/** Pick a slug that is not already taken, appending -2, -3, … on collision. */
async function uniqueSlug(base: string): Promise<string> {
  const clean = slugifyBlog(base);
  if (!clean) return `post-${Date.now()}`;
  const rows = await findAll<BlogRow>("blogPosts");
  const taken = new Set(rows.filter((r) => r.slug.startsWith(clean)).map((r) => r.slug));
  if (!taken.has(clean)) return clean;
  let i = 2;
  while (taken.has(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
}

/** Create a blog post. The slug is auto-generated from the title. */
export async function createBlog(data: BlogInput): Promise<BlogData> {
  const slug = await uniqueSlug(data.title);
  const publishedAt = data.published ? data.publishedAt ?? new Date().toISOString() : null;
  const id = await nextId("blogPosts");
  const row = await createDoc<BlogRow>("blogPosts", id, {
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
    publishedAt: publishedAt ? new Date(publishedAt) : null,
    displayOrder: data.displayOrder,
    seoTitle: data.seoTitle.trim(),
    seoDescription: data.seoDescription.trim(),
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
  const previous = await findById<BlogRow>("blogPosts", id);
  if (!previous) throw new BlogNotFoundError(id);

  const publishedAt = data.published
    ? data.publishedAt ?? previous.publishedAt?.toISOString() ?? new Date().toISOString()
    : data.publishedAt;

  const row = await updateDoc<BlogRow>("blogPosts", id, {
    title: data.title.trim(),
    excerpt: data.excerpt.trim(),
    content: data.content,
    coverImage: data.coverImage.trim(),
    category: data.category.trim(),
    tags: data.tags.trim(),
    author: data.author.trim(),
    featured: data.featured,
    published: data.published,
    publishedAt: publishedAt ? new Date(publishedAt) : null,
    displayOrder: data.displayOrder,
    seoTitle: data.seoTitle.trim(),
    seoDescription: data.seoDescription.trim(),
  });
  if (!row) throw new BlogNotFoundError(id);

  if (previous.coverImage && previous.coverImage !== row.coverImage) {
    await removeManagedImage(previous.coverImage);
  }
  return rowToBlog(row);
}

/** Delete a blog post (and its managed cover image, if any). */
export async function deleteBlog(id: number): Promise<void> {
  const previous = await findById<BlogRow>("blogPosts", id);
  if (!previous) throw new BlogNotFoundError(id);
  await deleteDoc("blogPosts", id);
  await removeManagedImage(previous.coverImage);
}

/** Persist a drag-and-drop reorder (displayOrder is compacted to 0..n). */
export async function reorderBlogs(entries: { id: number; displayOrder: number }[]): Promise<void> {
  await updateMany(
    "blogPosts",
    entries.map((entry) => ({ id: entry.id, data: { displayOrder: entry.displayOrder } }))
  );
}
