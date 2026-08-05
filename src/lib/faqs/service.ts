import "server-only";

import { findAll, findById, createDoc, updateDoc, deleteDoc, updateMany, nextId } from "@/lib/firebase/repo";
import type { FaqData, FaqFilters, FaqListResult, FaqRow } from "./types";
import type { FaqInput } from "./validate";

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

/** Map a stored row to the API shape. */
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

function comparePublic(a: FaqRow, b: FaqRow): number {
  return Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder || a.id - b.id;
}

function matchesFilters(row: FaqRow, filters: FaqFilters): boolean {
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = `${row.question} ${row.answer} ${row.category}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (filters.visibility === "visible" && !row.visible) return false;
  if (filters.visibility === "hidden" && row.visible) return false;
  if (filters.featured === "featured" && !row.featured) return false;
  if (filters.featured === "regular" && row.featured) return false;
  return true;
}

/** List FAQs with search and visibility/featured filters (admin manager). */
export async function listFaqs(filters: FaqFilters = {}): Promise<FaqListResult> {
  const rows = await findAll<FaqRow>("faqs");
  const filtered = rows.filter((row) => matchesFilters(row, filters));
  filtered.sort(comparePublic);
  return { items: filtered.map(rowToFaq), total: filtered.length };
}

/** Public FAQs for the site: visible only, featured first, then display order. */
export async function listPublicFaqs(): Promise<FaqData[]> {
  const rows = await findAll<FaqRow>("faqs");
  return rows.filter((row) => row.visible).sort(comparePublic).map(rowToFaq);
}

/** Fetch a single FAQ by id. */
export async function getFaq(id: number): Promise<FaqData | null> {
  const row = await findById<FaqRow>("faqs", id);
  return row ? rowToFaq(row) : null;
}

/** Create a FAQ. */
export async function createFaq(data: FaqInput): Promise<FaqData> {
  const id = await nextId("faqs");
  const row = await createDoc<FaqRow>("faqs", id, {
    question: data.question.trim(),
    answer: data.answer.trim(),
    category: data.category.trim(),
    displayOrder: data.displayOrder,
    featured: data.featured,
    visible: data.visible,
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
  const previous = await findById<FaqRow>("faqs", id);
  if (!previous) throw new FaqNotFoundError(id);
  const row = await updateDoc<FaqRow>("faqs", id, {
    question: data.question.trim(),
    answer: data.answer.trim(),
    category: data.category.trim(),
    displayOrder: data.displayOrder,
    featured: data.featured,
    visible: data.visible,
  });
  if (!row) throw new FaqNotFoundError(id);
  return rowToFaq(row);
}

/** Delete a FAQ. */
export async function deleteFaq(id: number): Promise<void> {
  const previous = await findById<FaqRow>("faqs", id);
  if (!previous) throw new FaqNotFoundError(id);
  await deleteDoc("faqs", id);
}

/** Persist a drag-and-drop reorder (displayOrder is compacted to 0..n). */
export async function reorderFaqs(entries: { id: number; displayOrder: number }[]): Promise<void> {
  await updateMany(
    "faqs",
    entries.map((entry) => ({ id: entry.id, data: { displayOrder: entry.displayOrder } }))
  );
}
