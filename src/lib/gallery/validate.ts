import { isValidUrl } from "@/lib/settings/validate";

const LOCAL_UPLOAD_RE = /^\/uploads\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9-_.]+$/;

export function isValidImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (LOCAL_UPLOAD_RE.test(trimmed)) return true;
  return isValidUrl(trimmed);
}

const ASPECT_RE = /^\d+\s*\/\s*\d+$/;

export interface GalleryItemInput {
  title: string;
  description: string;
  imageUrl: string;
  aspect: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
}

export type GalleryItemErrors = Partial<Record<keyof GalleryItemInput, string>>;

/** Validate a gallery item payload. Returns a map of field → error message. */
export function validateGalleryItem(data: GalleryItemInput): GalleryItemErrors {
  const errors: GalleryItemErrors = {};

  if (!data.title.trim()) {
    errors.title = "Title is required.";
  } else if (data.title.trim().length > 160) {
    errors.title = "Must be 160 characters or fewer.";
  }

  if (data.description.trim().length > 2000) {
    errors.description = "Must be 2000 characters or fewer.";
  }

  if (!data.imageUrl.trim()) {
    errors.imageUrl = "An image is required.";
  } else if (!isValidImageUrl(data.imageUrl)) {
    errors.imageUrl = "Enter a valid image URL.";
  }

  if (data.aspect.trim() && !ASPECT_RE.test(data.aspect.trim())) {
    errors.aspect = "Aspect must look like 4 / 3.";
  }

  if (!Number.isInteger(data.displayOrder) || data.displayOrder < 0 || data.displayOrder > 9999) {
    errors.displayOrder = "Display order must be a whole number from 0–9999.";
  }

  return errors;
}
