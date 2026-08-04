import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { imageStorage } from "@/lib/uploads/storage";
import type { ReviewData, ReviewFilters, ReviewListResult, ReviewRow } from "./types";
import type { ReviewInput } from "./validate";

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

/** Map a Prisma row to the API shape. */
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
    rating: Math.round(toNumber(raw.rating)),
    text: typeof raw.text === "string" ? raw.text : "",
    reviewDate: typeof raw.reviewDate === "string" ? raw.reviewDate : "",
    displayOrder: Math.trunc(toNumber(raw.displayOrder)),
    featured: toBoolean(raw.featured),
    visible: typeof raw.visible === "boolean" ? raw.visible : true,
  };
}

const PUBLIC_ORDER: Prisma.ReviewOrderByWithRelationInput[] = [
  { featured: "desc" },
  { displayOrder: "asc" },
  { id: "asc" },
];

/** List reviews with search, visibility/featured/rating filters and pagination. */
export async function listReviews(filters: ReviewFilters = {}): Promise<ReviewListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 24));

  const where: Prisma.ReviewWhereInput = {};
  if (filters.search) {
    const search = filters.search.trim();
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { text: { contains: search } },
      ];
    }
  }
  if (filters.visibility === "visible") {
    where.visible = true;
  } else if (filters.visibility === "hidden") {
    where.visible = false;
  }
  if (filters.featured === "featured") {
    where.featured = true;
  } else if (filters.featured === "regular") {
    where.featured = false;
  }
  if (filters.rating) {
    where.rating = filters.rating;
  }

  const [rows, total] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: PUBLIC_ORDER,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.review.count({ where }),
  ]);

  return {
    items: rows.map(rowToReview),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Fetch a single review by id. */
export async function getReview(id: number): Promise<ReviewData | null> {
  const row = await db.review.findUnique({ where: { id } });
  return row ? rowToReview(row) : null;
}

/** Create a review. New reviews default to a high display order (appear last). */
export async function createReview(data: ReviewInput): Promise<ReviewData> {
  const row = await db.review.create({
    data: {
      name: data.name.trim(),
      imageUrl: data.imageUrl.trim(),
      rating: data.rating,
      text: data.text.trim(),
      reviewDate: data.reviewDate.trim(),
      displayOrder: data.displayOrder,
      featured: data.featured,
      visible: data.visible,
    },
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

/** Update a review, deleting any replaced managed image. */
export async function updateReview(id: number, data: ReviewInput): Promise<ReviewData> {
  const previous = await db.review.findUnique({ where: { id } });
  if (!previous) throw new ReviewNotFoundError(id);
  const row = await db.review.update({
    where: { id },
    data: {
      name: data.name.trim(),
      imageUrl: data.imageUrl.trim(),
      rating: data.rating,
      text: data.text.trim(),
      reviewDate: data.reviewDate.trim(),
      displayOrder: data.displayOrder,
      featured: data.featured,
      visible: data.visible,
    },
  });
  if (previous.imageUrl !== row.imageUrl) {
    await removeManagedImage(previous.imageUrl);
  }
  return rowToReview(row);
}

/** Delete a review and its managed image. */
export async function deleteReview(id: number): Promise<void> {
  const previous = await db.review.findUnique({ where: { id } });
  if (!previous) throw new ReviewNotFoundError(id);
  await db.review.delete({ where: { id } });
  await removeManagedImage(previous.imageUrl);
}

/** Persist a drag-and-drop reorder (displayOrder is compacted to 0..n). */
export async function reorderReviews(entries: { id: number; displayOrder: number }[]): Promise<void> {
  await db.$transaction(
    entries.map((entry) =>
      db.review.update({
        where: { id: entry.id },
        data: { displayOrder: entry.displayOrder },
      })
    )
  );
}
