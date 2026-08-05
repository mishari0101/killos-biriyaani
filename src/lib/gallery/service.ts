import "server-only";

import { imageStorage } from "@/lib/uploads/storage";
import { findAll, findById, createDoc, updateDoc, deleteDoc, updateMany, nextId } from "@/lib/firebase/repo";
import type {
  GalleryFilters,
  GalleryItemData,
  GalleryItemRow,
  GalleryListResult,
} from "./types";
import type { GalleryItemInput } from "./validate";

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

/** Map a stored row to the API shape. */
export function rowToGalleryItem(row: GalleryItemRow): GalleryItemData {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    aspect: row.aspect,
    displayOrder: row.displayOrder,
    featured: row.featured,
    visible: row.visible,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Coerce raw input into a validated shape (missing fields become defaults). */
export function toGalleryItemInput(raw: Record<string, unknown>): GalleryItemInput {
  return {
    title: typeof raw.title === "string" ? raw.title : "",
    description: typeof raw.description === "string" ? raw.description : "",
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
    aspect: typeof raw.aspect === "string" && raw.aspect.trim() ? raw.aspect : "4 / 3",
    displayOrder: Math.trunc(toNumber(raw.displayOrder)),
    featured: toBoolean(raw.featured),
    visible: typeof raw.visible === "boolean" ? raw.visible : true,
  };
}

function comparePublic(a: GalleryItemRow, b: GalleryItemRow): number {
  return Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder || a.id - b.id;
}

function matchesFilters(row: GalleryItemRow, filters: GalleryFilters): boolean {
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = `${row.title} ${row.description}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (filters.visibility === "visible" && !row.visible) return false;
  if (filters.visibility === "hidden" && row.visible) return false;
  if (filters.featured === "featured" && !row.featured) return false;
  if (filters.featured === "regular" && row.featured) return false;
  return true;
}

/** List gallery items with search, visibility/featured filters and pagination. */
export async function listGalleryItems(filters: GalleryFilters = {}): Promise<GalleryListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 24));

  const rows = await findAll<GalleryItemRow>("galleryItems");
  const filtered = rows.filter((row) => matchesFilters(row, filters));
  filtered.sort(comparePublic);

  const total = filtered.length;
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map(rowToGalleryItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Fetch a single item by id. */
export async function getGalleryItem(id: number): Promise<GalleryItemData | null> {
  const row = await findById<GalleryItemRow>("galleryItems", id);
  return row ? rowToGalleryItem(row) : null;
}

/** Create a gallery item. */
export async function createGalleryItem(data: GalleryItemInput): Promise<GalleryItemData> {
  const id = await nextId("galleryItems");
  const row = await createDoc<GalleryItemRow>("galleryItems", id, {
    title: data.title.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    aspect: data.aspect.trim(),
    displayOrder: data.displayOrder,
    featured: data.featured,
    visible: data.visible,
  });
  return rowToGalleryItem(row);
}

/** Thrown when a gallery item does not exist so the API can map it to 404. */
export class GalleryItemNotFoundError extends Error {
  constructor(public id: number) {
    super(`No gallery item found with id ${id}.`);
    this.name = "GalleryItemNotFoundError";
  }
}

/** Remove a managed image file if the URL points at our upload storage. */
async function removeManagedImage(url: string | null): Promise<void> {
  if (!url) return;
  const key = imageStorage.urlToKey(url);
  if (key) await imageStorage.delete(key);
}

/** Update a gallery item. */
export async function updateGalleryItem(id: number, data: GalleryItemInput): Promise<GalleryItemData> {
  const previous = await findById<GalleryItemRow>("galleryItems", id);
  if (!previous) throw new GalleryItemNotFoundError(id);
  const row = await updateDoc<GalleryItemRow>("galleryItems", id, {
    title: data.title.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    aspect: data.aspect.trim(),
    displayOrder: data.displayOrder,
    featured: data.featured,
    visible: data.visible,
  });
  if (!row) throw new GalleryItemNotFoundError(id);
  if (previous.imageUrl !== row.imageUrl) {
    await removeManagedImage(previous.imageUrl);
  }
  return rowToGalleryItem(row);
}

/** Delete a gallery item. */
export async function deleteGalleryItem(id: number): Promise<void> {
  const previous = await findById<GalleryItemRow>("galleryItems", id);
  if (!previous) throw new GalleryItemNotFoundError(id);
  await deleteDoc("galleryItems", id);
  await removeManagedImage(previous.imageUrl);
}

/** Persist a drag-and-drop reorder (displayOrder is compacted to 0..n). */
export async function reorderGalleryItems(entries: { id: number; displayOrder: number }[]): Promise<void> {
  await updateMany(
    "galleryItems",
    entries.map((entry) => ({ id: entry.id, data: { displayOrder: entry.displayOrder } }))
  );
}
