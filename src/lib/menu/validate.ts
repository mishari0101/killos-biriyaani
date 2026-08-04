import { isValidUrl } from "@/lib/settings/validate";

const LOCAL_UPLOAD_RE = /^\/api\/uploads\/file\/[a-zA-Z0-9-_.]+(?:\/[a-zA-Z0-9-_.]+)*$/;

export function isValidImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (LOCAL_UPLOAD_RE.test(trimmed)) return true;
  return isValidUrl(trimmed);
}

export interface MenuItemInput {
  category: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  displayOrder: number;
}

export type MenuItemErrors = Partial<Record<keyof MenuItemInput, string>>;

export function isValidPrice(value: number): boolean {
  if (!Number.isFinite(value)) return false;
  if (value < 0) return false;
  return Math.round(value * 100) === Math.round(Number(value.toFixed(2)) * 100);
}

/** Turn a category name into a URL-safe slug (lowercased, dashes). */
export function slugifyCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export interface MenuCategoryInput {
  name: string;
  slug: string;
  displayOrder: number;
}

export type MenuCategoryErrors = Partial<Record<keyof MenuCategoryInput, string>>;

/** Validate a category payload. Returns a map of field → error message. */
export function validateMenuCategory(data: MenuCategoryInput): MenuCategoryErrors {
  const errors: MenuCategoryErrors = {};

  if (!data.name.trim()) {
    errors.name = "Category name is required.";
  } else if (data.name.trim().length > 80) {
    errors.name = "Must be 80 characters or fewer.";
  }

  if (!data.slug.trim()) {
    errors.slug = "Slug is required.";
  } else if (data.slug.trim().length > 80) {
    errors.slug = "Must be 80 characters or fewer.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug.trim())) {
    errors.slug = "Use lowercase letters, numbers and dashes only (e.g. hot-drinks).";
  }

  if (!Number.isInteger(data.displayOrder) || data.displayOrder < 0 || data.displayOrder > 9999) {
    errors.displayOrder = "Display order must be a whole number from 0–9999.";
  }

  return errors;
}

/** Validate a menu item payload. Returns a map of field → error message. */
export function validateMenuItem(data: MenuItemInput): MenuItemErrors {
  const errors: MenuItemErrors = {};

  if (!data.name.trim()) {
    errors.name = "Item name is required.";
  } else if (data.name.trim().length > 160) {
    errors.name = "Must be 160 characters or fewer.";
  }

  if (!data.category.trim()) {
    errors.category = "Category is required.";
  } else if (data.category.trim().length > 80) {
    errors.category = "Must be 80 characters or fewer.";
  }

  if (data.description.trim().length > 2000) {
    errors.description = "Must be 2000 characters or fewer.";
  }

  if (!isValidPrice(data.price)) {
    errors.price = "Enter a valid price (0–9999999.99).";
  }

  if (data.imageUrl.trim() && !isValidImageUrl(data.imageUrl)) {
    errors.imageUrl = "Enter a valid image URL.";
  }

  if (!Number.isInteger(data.displayOrder) || data.displayOrder < 0 || data.displayOrder > 9999) {
    errors.displayOrder = "Display order must be a whole number from 0–9999.";
  }

  return errors;
}
