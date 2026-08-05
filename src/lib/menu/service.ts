import "server-only";

import { imageStorage } from "@/lib/uploads/storage";
import { findAll, findById, createDoc, updateDoc, deleteDoc, nextId } from "@/lib/firebase/repo";
import { isValidPrice, slugifyCategory, type MenuCategoryInput, type MenuItemInput } from "./validate";
import {
  type MenuCategoryData,
  type MenuCategoryRow,
  type MenuFilters,
  type MenuItemData,
  type MenuItemRow,
  type MenuListResult,
  type MenuSort,
} from "./types";

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

/** Map a stored row to the API shape (price is already a number). */
export function rowToMenuItem(row: MenuItemRow): MenuItemData {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.imageUrl,
    available: row.available,
    featured: row.featured,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Coerce raw input into a validated shape (missing fields become defaults). */
export function toMenuItemInput(raw: Record<string, unknown>): MenuItemInput {
  return {
    category: typeof raw.category === "string" ? raw.category : "",
    name: typeof raw.name === "string" ? raw.name : "",
    description: typeof raw.description === "string" ? raw.description : "",
    price: toNumber(raw.price),
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
    available: toBoolean(raw.available),
    featured: toBoolean(raw.featured),
    displayOrder: Math.trunc(toNumber(raw.displayOrder)),
  };
}

function compareForSort(sort: MenuSort): (a: MenuItemRow, b: MenuItemRow) => number {
  switch (sort) {
    case "name":
      return (a, b) => a.name.localeCompare(b.name);
    case "price-asc":
      return (a, b) => a.price - b.price;
    case "price-desc":
      return (a, b) => b.price - a.price;
    case "newest":
      return (a, b) => b.createdAt.getTime() - a.createdAt.getTime();
    case "order":
    default:
      return (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);
  }
}

function matchesFilters(row: MenuItemRow, filters: MenuFilters): boolean {
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = `${row.name} ${row.description}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (filters.category && row.category !== filters.category) return false;
  if (filters.availability === "available" && !row.available) return false;
  if (filters.availability === "unavailable" && row.available) return false;
  if (filters.featured === "featured" && !row.featured) return false;
  if (filters.featured === "regular" && row.featured) return false;
  return true;
}

/** List menu items with search, filters, sorting and pagination. */
export async function listMenuItems(filters: MenuFilters = {}): Promise<MenuListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 12));

  const rows = await findAll<MenuItemRow>("menuItems");
  const filtered = rows.filter((row) => matchesFilters(row, filters));
  filtered.sort(compareForSort(filters.sort ?? "order"));

  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize).map(rowToMenuItem);

  const existing = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
  const categoryRows = await findAll<MenuCategoryRow>("menuCategories");
  categoryRows.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  const categories = Array.from(new Set([...categoryRows.map((c) => c.name), ...existing]));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    categories,
  };
}

/** Fetch a single item by id. */
export async function getMenuItem(id: number): Promise<MenuItemData | null> {
  const row = await findById<MenuItemRow>("menuItems", id);
  return row ? rowToMenuItem(row) : null;
}

/** Create a menu item. */
export async function createMenuItem(data: MenuItemInput): Promise<MenuItemData> {
  const id = await nextId("menuItems");
  const row = await createDoc<MenuItemRow>("menuItems", id, {
    category: data.category.trim(),
    name: data.name.trim(),
    description: data.description.trim(),
    price: Math.round(data.price * 100) / 100,
    imageUrl: data.imageUrl.trim(),
    available: data.available,
    featured: data.featured,
    displayOrder: data.displayOrder,
  });
  return rowToMenuItem(row);
}

/** Remove a managed image file if the URL points at our upload storage. */
async function removeManagedImage(url: string | null): Promise<void> {
  if (!url) return;
  const key = imageStorage.urlToKey(url);
  if (key) await imageStorage.delete(key);
}

/** Thrown when a menu item does not exist so the API can map it to 404. */
export class MenuItemNotFoundError extends Error {
  constructor(public id: number) {
    super(`No menu item found with id ${id}.`);
    this.name = "MenuItemNotFoundError";
  }
}

/** Update a menu item. */
export async function updateMenuItem(id: number, data: MenuItemInput): Promise<MenuItemData> {
  const previous = await findById<MenuItemRow>("menuItems", id);
  if (!previous) throw new MenuItemNotFoundError(id);
  const row = await updateDoc<MenuItemRow>("menuItems", id, {
    category: data.category.trim(),
    name: data.name.trim(),
    description: data.description.trim(),
    price: Math.round(data.price * 100) / 100,
    imageUrl: data.imageUrl.trim(),
    available: data.available,
    featured: data.featured,
    displayOrder: data.displayOrder,
  });
  if (!row) throw new MenuItemNotFoundError(id);
  if (previous.imageUrl !== row.imageUrl) {
    await removeManagedImage(previous.imageUrl);
  }
  return rowToMenuItem(row);
}

/** Delete a menu item. */
export async function deleteMenuItem(id: number): Promise<void> {
  const previous = await findById<MenuItemRow>("menuItems", id);
  if (!previous) throw new MenuItemNotFoundError(id);
  await deleteDoc("menuItems", id);
  await removeManagedImage(previous.imageUrl);
}

/** Normalize a price from string/number to a safe 2-decimal value. */
export function normalizePrice(value: string | number): number {
  const n = toNumber(value);
  return isValidPrice(n) ? n : NaN;
}

/** Map a stored category row to the API shape. */
export function rowToMenuCategory(row: MenuCategoryRow): MenuCategoryData {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Coerce raw input into a validated category shape (slug auto-generated from name). */
export function toMenuCategoryInput(raw: Record<string, unknown>): MenuCategoryInput {
  const name = typeof raw.name === "string" ? raw.name : "";
  const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
  return {
    name,
    slug: slug ? slug.toLowerCase() : slugifyCategory(name),
    displayOrder: Math.trunc(toNumber(raw.displayOrder)),
  };
}

/** Thrown when a category already exists (name or slug) so the API can map it to 409. */
export class MenuCategoryConflictError extends Error {
  constructor(public field: "name" | "slug") {
    super(`A category with that ${field} already exists.`);
    this.name = "MenuCategoryConflictError";
  }
}

/** List all categories ordered by display order then name. */
export async function listMenuCategories(): Promise<MenuCategoryData[]> {
  const rows = await findAll<MenuCategoryRow>("menuCategories");
  rows.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  return rows.map(rowToMenuCategory);
}

/** Create a category, rejecting duplicates (case-insensitive). */
export async function createMenuCategory(data: MenuCategoryInput): Promise<MenuCategoryData> {
  const name = data.name.trim();
  const slug = data.slug.trim();
  const rows = await findAll<MenuCategoryRow>("menuCategories");
  const existing = rows.find(
    (r) => r.name.toLowerCase() === name.toLowerCase() || r.slug.toLowerCase() === slug.toLowerCase()
  );
  if (existing) {
    const field = existing.name.toLowerCase() === name.toLowerCase() ? "name" : "slug";
    throw new MenuCategoryConflictError(field);
  }
  const id = await nextId("menuCategories");
  const row = await createDoc<MenuCategoryRow>("menuCategories", id, {
    name,
    slug,
    displayOrder: data.displayOrder,
  });
  return rowToMenuCategory(row);
}
