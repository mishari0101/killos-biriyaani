import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { imageStorage } from "@/lib/uploads/storage";
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

/** Map a Prisma row to the API shape (converts Decimal price to a number). */
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

function toOrderBy(sort: MenuSort): Prisma.MenuItemOrderByWithRelationInput[] {
  switch (sort) {
    case "name":
      return [{ name: "asc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    case "order":
    default:
      return [{ displayOrder: "asc" }, { name: "asc" }];
  }
}

/** List menu items with search, filters, sorting and pagination. */
export async function listMenuItems(filters: MenuFilters = {}): Promise<MenuListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 12));

  const where: Prisma.MenuItemWhereInput = {};
  if (filters.search) {
    const search = filters.search.trim();
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
  }
  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.availability === "available") {
    where.available = true;
  } else if (filters.availability === "unavailable") {
    where.available = false;
  }
  if (filters.featured === "featured") {
    where.featured = true;
  } else if (filters.featured === "regular") {
    where.featured = false;
  }

  const [rows, total] = await Promise.all([
    db.menuItem.findMany({
      where,
      orderBy: toOrderBy(filters.sort ?? "order"),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.menuItem.count({ where }),
  ]);

  const distinct = await db.menuItem.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const existing = distinct.map((d) => d.category).filter(Boolean);
  const tableCategories = await db.menuCategory.findMany({
    select: { name: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
  const categories = Array.from(
    new Set([...tableCategories.map((c) => c.name), ...existing])
  );

  return {
    items: rows.map(rowToMenuItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    categories,
  };
}

/** Fetch a single item by id. */
export async function getMenuItem(id: number): Promise<MenuItemData | null> {
  const row = await db.menuItem.findUnique({ where: { id } });
  return row ? rowToMenuItem(row) : null;
}

/** Create a menu item. */
export async function createMenuItem(data: MenuItemInput): Promise<MenuItemData> {
  const row = await db.menuItem.create({
    data: {
      category: data.category.trim(),
      name: data.name.trim(),
      description: data.description.trim(),
      price: new Prisma.Decimal(data.price.toFixed(2)),
      imageUrl: data.imageUrl.trim(),
      available: data.available,
      featured: data.featured,
      displayOrder: data.displayOrder,
    },
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
  const previous = await db.menuItem.findUnique({ where: { id } });
  if (!previous) throw new MenuItemNotFoundError(id);
  const row = await db.menuItem.update({
    where: { id },
    data: {
      category: data.category.trim(),
      name: data.name.trim(),
      description: data.description.trim(),
      price: new Prisma.Decimal(data.price.toFixed(2)),
      imageUrl: data.imageUrl.trim(),
      available: data.available,
      featured: data.featured,
      displayOrder: data.displayOrder,
    },
  });
  if (previous && previous.imageUrl !== row.imageUrl) {
    await removeManagedImage(previous.imageUrl);
  }
  return rowToMenuItem(row);
}

/** Delete a menu item. */
export async function deleteMenuItem(id: number): Promise<void> {
  const previous = await db.menuItem.findUnique({ where: { id } });
  if (!previous) throw new MenuItemNotFoundError(id);
  await db.menuItem.delete({ where: { id } });
  await removeManagedImage(previous.imageUrl);
}

/** Normalize a price from string/number to a safe 2-decimal value. */
export function normalizePrice(value: string | number): number {
  const n = toNumber(value);
  return isValidPrice(n) ? n : NaN;
}

/** Map a Prisma category row to the API shape. */
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
  const rows = await db.menuCategory.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(rowToMenuCategory);
}

/** Create a category, rejecting duplicates (case-insensitive, via ci collation). */
export async function createMenuCategory(data: MenuCategoryInput): Promise<MenuCategoryData> {
  const name = data.name.trim();
  const slug = data.slug.trim();
  const existing = await db.menuCategory.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) {
    const field = existing.name.toLowerCase() === name.toLowerCase() ? "name" : "slug";
    throw new MenuCategoryConflictError(field);
  }
  const row = await db.menuCategory.create({
    data: { name, slug, displayOrder: data.displayOrder },
  });
  return rowToMenuCategory(row);
}
