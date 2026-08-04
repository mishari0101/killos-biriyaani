import type { MenuItemModel } from "@/generated/prisma/models/MenuItem";
import type { MenuCategoryModel } from "@/generated/prisma/models/MenuCategory";

/** Wire shape for a category shown in the menu manager. */
export interface MenuCategoryData {
  id: number;
  name: string;
  slug: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Raw row as stored by Prisma. */
export type MenuCategoryRow = MenuCategoryModel;

/** Wire shape returned by the API and used by the menu manager. */
export interface MenuItemData {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Raw row as stored by Prisma. */
export type MenuItemRow = MenuItemModel;

export type MenuSort = "order" | "name" | "price-asc" | "price-desc" | "newest";

export interface MenuFilters {
  search?: string;
  category?: string;
  availability?: "available" | "unavailable";
  featured?: "featured" | "regular";
  sort?: MenuSort;
  page?: number;
  pageSize?: number;
}

export interface MenuListResult {
  items: MenuItemData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: string[];
}
