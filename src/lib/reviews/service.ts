import "server-only";

import { imageStorage } from "@/lib/uploads/storage";
import { findAll, findById, createDoc, updateDoc, deleteDoc, updateMany, nextId } from "@/lib/firebase/repo";
import type { ReviewData, ReviewFilters, ReviewListResult, ReviewRow } from "./types";
import type { ReviewInput } from "./validate";

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

/** Map a stored row to the API shape. */
export function rowToReview(row: ReviewRow): ReviewData {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.imageUrl,
    rating: row.rating,
    text: row.text,
    reviewDate: row.reviewDate,
    displayOrder: row.displayOrder,
    featured: row.featured,
    visible: row.visible,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Coerce raw input into a validated shape (missing fields become defaults). */
export function toReviewInput(raw: Record<string, unknown>): ReviewInput {
  return {
    name: typeof raw.name === "string" ? raw.name : "",
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
    rating: Math.max(1, Math.min(5, Math.round(toNumber(raw.rating)))),
    text: typeof raw.text === "string" ? raw.text : "",
    reviewDate: typeof raw.reviewDate === "string" ? raw.reviewDate : "",
    displayOrder: Math.trunc(toNumber(raw.displayOrder)),
    featured: toBoolean(raw.featured),
    visible: typeof raw.visible === "boolean" ? raw.visible : true,
  };
}

function comparePublic(a: ReviewRow, b: ReviewRow): number {
  return Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder || a.id - b.id;
}

function matchesFilters(row: ReviewRow, filters: ReviewFilters): boolean {
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = `${row.name} ${row.text}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (filters.visibility === "visible" && !row.visible) return false;
  if (filters.visibility === "hidden" && row.visible) return false;
  if (filters.featured === "featured" && !row.featured) return false;
  if (filters.featured === "regular" && row.featured) return false;
  if (filters.rating && row.rating !== filters.rating) return false;
  return true;
}

/** List reviews with search, visibility/featured/rating filters and pagination. */
export async function listReviews(filters: ReviewFilters = {}): Promise<ReviewListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 24));

  const rows = await findAll<ReviewRow>("reviews");
  const filtered = rows.filter((row) => matchesFilters(row, filters));
  filtered.sort(comparePublic);

  const total = filtered.length;
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map(rowToReview),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Fetch a single review by id. */
export async function getReview(id: number): Promise<ReviewData | null> {
  const row = await findById<ReviewRow>("reviews", id);
  return row ? rowToReview(row) : null;
}

/** Create a review. */
export async function createReview(data: ReviewInput): Promise<ReviewData> {
  const id = await nextId("reviews");
  const row = await createDoc<ReviewRow>("reviews", id, {
    name: data.name.trim(),
    imageUrl: data.imageUrl.trim(),
    rating: data.rating,
    text: data.text.trim(),
    reviewDate: data.reviewDate.trim(),
    displayOrder: data.displayOrder,
    featured: data.featured,
    visible: data.visible,
  });
  return rowToReview(row);
}

/** Thrown when a review does not exist so the API can map it to 404. */
export class ReviewNotFoundError extends Error {
  constructor(public id: number) {
    super(`No review found with id ${id}.`);
    this.name = "ReviewNotFoundError";
  }
}

/** Remove a managed image file if the URL points at our upload storage. */
async function removeManagedImage(url: string | null): Promise<void> {
  if (!url) return;
  const key = imageStorage.urlToKey(url);
  if (key) await imageStorage.delete(key);
}

/** Update a review. */
export async function updateReview(id: number, data: ReviewInput): Promise<ReviewData> {
  const previous = await findById<ReviewRow>("reviews", id);
  if (!previous) throw new ReviewNotFoundError(id);
  const row = await updateDoc<ReviewRow>("reviews", id, {
    name: data.name.trim(),
    imageUrl: data.imageUrl.trim(),
    rating: data.rating,
    text: data.text.trim(),
    reviewDate: data.reviewDate.trim(),
    displayOrder: data.displayOrder,
    featured: data.featured,
    visible: data.visible,
  });
  if (!row) throw new ReviewNotFoundError(id);
  if (previous.imageUrl !== row.imageUrl) {
    await removeManagedImage(previous.imageUrl);
  }
  return rowToReview(row);
}

/** Delete a review. */
export async function deleteReview(id: number): Promise<void> {
  const previous = await findById<ReviewRow>("reviews", id);
  if (!previous) throw new ReviewNotFoundError(id);
  await deleteDoc("reviews", id);
  await removeManagedImage(previous.imageUrl);
}

/** Persist a drag-and-drop reorder (displayOrder is compacted to 0..n). */
export async function reorderReviews(entries: { id: number; displayOrder: number }[]): Promise<void> {
  await updateMany(
    "reviews",
    entries.map((entry) => ({ id: entry.id, data: { displayOrder: entry.displayOrder } }))
  );
}
