import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { FaqData, FaqFilters, FaqListResult, FaqRow } from "./types";
import type { FaqInput } from "./validate";

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

/** Map a Prisma row to the API shape. */
export function rowToFaq(row: FaqRow): FaqData {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    featured: row.featured,
    visible: row.visible,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Coerce raw input into a validated shape (missing fields become defaults). */
export function toFaqInput(raw: Record<string, unknown>): FaqInput {
  return {
    question: typeof raw.question === "string" ? raw.question : "",
    answer: typeof raw.answer === "string" ? raw.answer : "",
    category: typeof raw.category === "string" ? raw.category : "",
    displayOrder: Math.trunc(toNumber(raw.displayOrder)),
    featured: toBoolean(raw.featured),
    visible: typeof raw.visible === "boolean" ? raw.visible : true,
  };
}

const PUBLIC_ORDER: Prisma.FaqOrderByWithRelationInput[] = [
  { featured: "desc" },
  { displayOrder: "asc" },
  { id: "asc" },
];

/** List FAQs with search and visibility/featured filters (admin manager). */
export async function listFaqs(filters: FaqFilters = {}): Promise<FaqListResult> {
  const where: Prisma.FaqWhereInput = {};
  if (filters.search) {
    const search = filters.search.trim();
    if (search) {
      where.OR = [
        { question: { contains: search } },
        { answer: { contains: search } },
        { category: { contains: search } },
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

  const [rows, total] = await Promise.all([
    db.faq.findMany({ where, orderBy: PUBLIC_ORDER }),
    db.faq.count({ where }),
  ]);

  return { items: rows.map(rowToFaq), total };
}

/** Public FAQs for the site: visible only, featured first, then display order. */
export async function listPublicFaqs(): Promise<FaqData[]> {
  const rows = await db.faq.findMany({
    where: { visible: true },
    orderBy: PUBLIC_ORDER,
  });
  return rows.map(rowToFaq);
}

/** Fetch a single FAQ by id. */
export async function getFaq(id: number): Promise<FaqData | null> {
  const row = await db.faq.findUnique({ where: { id } });
  return row ? rowToFaq(row) : null;
}

/** Create a FAQ. */
export async function createFaq(data: FaqInput): Promise<FaqData> {
  const row = await db.faq.create({
    data: {
      question: data.question.trim(),
      answer: data.answer.trim(),
      category: data.category.trim(),
      displayOrder: data.displayOrder,
      featured: data.featured,
      visible: data.visible,
    },
  });
  return rowToFaq(row);
}

/** Thrown when a FAQ does not exist so the API can map it to 404. */
export class FaqNotFoundError extends Error {
  constructor(public id: number) {
    super(`No FAQ found with id ${id}.`);
    this.name = "FaqNotFoundError";
  }
}

/** Update a FAQ. */
export async function updateFaq(id: number, data: FaqInput): Promise<FaqData> {
  const previous = await db.faq.findUnique({ where: { id } });
  if (!previous) throw new FaqNotFoundError(id);
  const row = await db.faq.update({
    where: { id },
    data: {
      question: data.question.trim(),
      answer: data.answer.trim(),
      category: data.category.trim(),
      displayOrder: data.displayOrder,
      featured: data.featured,
      visible: data.visible,
    },
  });
  return rowToFaq(row);
}

/** Delete a FAQ. */
export async function deleteFaq(id: number): Promise<void> {
  const previous = await db.faq.findUnique({ where: { id } });
  if (!previous) throw new FaqNotFoundError(id);
  await db.faq.delete({ where: { id } });
}

/** Persist a drag-and-drop reorder (displayOrder is compacted to 0..n). */
export async function reorderFaqs(entries: { id: number; displayOrder: number }[]): Promise<void> {
  await db.$transaction(
    entries.map((entry) =>
      db.faq.update({
        where: { id: entry.id },
        data: { displayOrder: entry.displayOrder },
      })
    )
  );
}
