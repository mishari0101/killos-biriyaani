import { isValidUrl } from "@/lib/settings/validate";

const LOCAL_UPLOAD_RE = /^\/api\/uploads\/file\/[a-zA-Z0-9-_.]+(?:\/[a-zA-Z0-9-_.]+)*$/;

export function isValidImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (LOCAL_UPLOAD_RE.test(trimmed)) return true;
  return isValidUrl(trimmed);
}

/** Accept Google Maps URLs on any Google domain plus the goo.gl shortener. */
export function isGoogleMapsUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname;
    return host === "maps.app.goo.gl" || host === "goo.gl" || /(^|\.)google\./.test(host);
  } catch {
    return false;
  }
}

export interface AttractionInput {
  name: string;
  description: string;
  imageUrl: string;
  mapUrl: string;
  rating: number;
  travelTime: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
}

export type AttractionErrors = Partial<Record<keyof AttractionInput, string>>;

/** Turn an attraction name into a URL-safe slug (lowercased, dashes). */
export function slugifyAttraction(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

/** A rating is a number from 0–5 with at most one decimal. */
export function isValidRating(value: number): boolean {
  if (!Number.isFinite(value)) return false;
  if (value < 0 || value > 5) return false;
  return Math.round(value * 10) === Math.round(Number(value.toFixed(1)) * 10);
}

/** Validate an attraction payload. Returns a map of field → error message. */
export function validateAttraction(data: AttractionInput): AttractionErrors {
  const errors: AttractionErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  } else if (data.name.trim().length > 160) {
    errors.name = "Must be 160 characters or fewer.";
  }

  if (data.description.trim().length > 2000) {
    errors.description = "Must be 2000 characters or fewer.";
  }

  if (!data.imageUrl.trim()) {
    errors.imageUrl = "An image is required.";
  } else if (!isValidImageUrl(data.imageUrl)) {
    errors.imageUrl = "Enter a valid image URL.";
  }

  if (!data.mapUrl.trim()) {
    errors.mapUrl = "A Google Maps link is required.";
  } else if (!isGoogleMapsUrl(data.mapUrl)) {
    errors.mapUrl = "Enter a valid Google Maps URL.";
  }

  if (!isValidRating(data.rating)) {
    errors.rating = "Rating must be a number from 0–5 with one decimal (e.g. 4.5).";
  }

  if (!data.travelTime.trim()) {
    errors.travelTime = "Travel time is required.";
  } else if (data.travelTime.trim().length > 80) {
    errors.travelTime = "Must be 80 characters or fewer.";
  }

  if (!Number.isInteger(data.displayOrder) || data.displayOrder < 0 || data.displayOrder > 9999) {
    errors.displayOrder = "Display order must be a whole number from 0–9999.";
  }

  return errors;
}
