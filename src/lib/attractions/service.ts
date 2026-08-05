import "server-only";

import { imageStorage } from "@/lib/uploads/storage";
import { findAll, findById, createDoc, updateDoc, deleteDoc, updateMany, nextId } from "@/lib/firebase/repo";
import type { AttractionData, AttractionFilters, AttractionListResult, AttractionRow } from "./types";
import { slugifyAttraction, type AttractionInput } from "./validate";

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

/** Map a stored row to the API shape (rating is already a number). */
export function rowToAttraction(row: AttractionRow): AttractionData {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    mapUrl: row.mapUrl,
    rating: Number(row.rating),
    travelTime: row.travelTime,
    displayOrder: row.displayOrder,
    featured: row.featured,
    visible: row.visible,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Coerce raw input into a validated shape (missing fields become defaults). */
export function toAttractionInput(raw: Record<string, unknown>): AttractionInput {
  return {
    name: typeof raw.name === "string" ? raw.name : "",
    description: typeof raw.description === "string" ? raw.description : "",
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
    mapUrl: typeof raw.mapUrl === "string" ? raw.mapUrl : "",
    rating: Math.round(toNumber(raw.rating) * 10) / 10,
    travelTime: typeof raw.travelTime === "string" ? raw.travelTime : "",
    displayOrder: Math.trunc(toNumber(raw.displayOrder)),
    featured: toBoolean(raw.featured),
    visible: typeof raw.visible === "boolean" ? raw.visible : true,
  };
}

function comparePublic(a: AttractionRow, b: AttractionRow): number {
  return Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder || a.id - b.id;
}

function matchesFilters(row: AttractionRow, filters: AttractionFilters): boolean {
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = `${row.name} ${row.description}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (filters.visibility === "visible" && !row.visible) return false;
  if (filters.visibility === "hidden" && row.visible) return false;
  if (filters.featured === "featured" && !row.featured) return false;
  if (filters.featured === "regular" && row.featured) return false;
  return true;
}

/** List attractions with search, visibility/featured filters and pagination. */
export async function listAttractions(filters: AttractionFilters = {}): Promise<AttractionListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 24));

  const rows = await findAll<AttractionRow>("attractions");
  const filtered = rows.filter((row) => matchesFilters(row, filters));
  filtered.sort(comparePublic);

  const total = filtered.length;
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map(rowToAttraction),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Fetch a single attraction by id. */
export async function getAttraction(id: number): Promise<AttractionData | null> {
  const row = await findById<AttractionRow>("attractions", id);
  return row ? rowToAttraction(row) : null;
}

/** Pick a slug that is not already taken, appending -2, -3, … on collision. */
async function uniqueSlug(base: string): Promise<string> {
  const clean = slugifyAttraction(base);
  if (!clean) return `attraction-${Date.now()}`;
  const rows = await findAll<AttractionRow>("attractions");
  const taken = new Set(rows.filter((r) => r.slug.startsWith(clean)).map((r) => r.slug));
  if (!taken.has(clean)) return clean;
  let i = 2;
  while (taken.has(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
}

/** Create an attraction. The slug is auto-generated from the name. */
export async function createAttraction(data: AttractionInput): Promise<AttractionData> {
  const slug = await uniqueSlug(data.name);
  const id = await nextId("attractions");
  const row = await createDoc<AttractionRow>("attractions", id, {
    name: data.name.trim(),
    slug,
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    mapUrl: data.mapUrl.trim(),
    rating: Math.round(data.rating * 10) / 10,
    travelTime: data.travelTime.trim(),
    displayOrder: data.displayOrder,
    featured: data.featured,
    visible: data.visible,
  });
  return rowToAttraction(row);
}

/** Thrown when an attraction does not exist so the API can map it to 404. */
export class AttractionNotFoundError extends Error {
  constructor(public id: number) {
    super(`No attraction found with id ${id}.`);
    this.name = "AttractionNotFoundError";
  }
}

/** Remove a managed image file if the URL points at our upload storage. */
async function removeManagedImage(url: string | null): Promise<void> {
  if (!url) return;
  const key = imageStorage.urlToKey(url);
  if (key) await imageStorage.delete(key);
}

/** Update an attraction. The slug stays stable once assigned. */
export async function updateAttraction(id: number, data: AttractionInput): Promise<AttractionData> {
  const previous = await findById<AttractionRow>("attractions", id);
  if (!previous) throw new AttractionNotFoundError(id);
  const row = await updateDoc<AttractionRow>("attractions", id, {
    name: data.name.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    mapUrl: data.mapUrl.trim(),
    rating: Math.round(data.rating * 10) / 10,
    travelTime: data.travelTime.trim(),
    displayOrder: data.displayOrder,
    featured: data.featured,
    visible: data.visible,
  });
  if (!row) throw new AttractionNotFoundError(id);
  if (previous.imageUrl !== row.imageUrl) {
    await removeManagedImage(previous.imageUrl);
  }
  return rowToAttraction(row);
}

/** Delete an attraction and its managed image. */
export async function deleteAttraction(id: number): Promise<void> {
  const previous = await findById<AttractionRow>("attractions", id);
  if (!previous) throw new AttractionNotFoundError(id);
  await deleteDoc("attractions", id);
  await removeManagedImage(previous.imageUrl);
}

/** Persist a drag-and-drop reorder (displayOrder is compacted to 0..n). */
export async function reorderAttractions(entries: { id: number; displayOrder: number }[]): Promise<void> {
  await updateMany(
    "attractions",
    entries.map((entry) => ({ id: entry.id, data: { displayOrder: entry.displayOrder } }))
  );
}
