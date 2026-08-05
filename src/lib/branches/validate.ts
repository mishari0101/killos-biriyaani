import { DAYS, type DayHours } from "@/lib/settings/types";
import { isValidEmail, isValidPhone, isValidTime, isValidUrl } from "@/lib/settings/validate";

const LOCAL_UPLOAD_RE = /^\/uploads\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9-_.]+$/;

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

export interface BranchInput {
  name: string;
  imageUrl: string;
  address: string;
  mapsUrl: string;
  latitude: number;
  longitude: number;
  primaryPhone: string;
  secondaryPhone: string;
  whatsapp: string;
  email: string;
  hours: DayHours[];
  description: string;
  displayOrder: number;
  featured: boolean;
  visible: boolean;
}

export type BranchErrors = Partial<Record<keyof BranchInput, string>>;

/** Turn a branch name into a URL-safe slug (lowercased, dashes). */
export function slugifyBranch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

/** Default Mon–Sun hours used when a branch is created. */
export function defaultBranchHours(): DayHours[] {
  return DAYS.map((day) => ({ day, open: "10:00", close: "00:00", closed: false }));
}

/** Validate a branch payload. Returns a map of field → error message. */
export function validateBranch(data: BranchInput): BranchErrors {
  const errors: BranchErrors = {};

  if (!data.name.trim()) {
    errors.name = "Branch name is required.";
  } else if (data.name.trim().length > 160) {
    errors.name = "Must be 160 characters or fewer.";
  }

  if (data.imageUrl.trim() && !isValidImageUrl(data.imageUrl)) {
    errors.imageUrl = "Enter a valid image URL.";
  }

  if (!data.address.trim()) {
    errors.address = "Address is required.";
  } else if (data.address.trim().length > 500) {
    errors.address = "Must be 500 characters or fewer.";
  }

  if (!data.mapsUrl.trim()) {
    errors.mapsUrl = "A Google Maps link is required.";
  } else if (!isGoogleMapsUrl(data.mapsUrl)) {
    errors.mapsUrl = "Enter a valid Google Maps URL.";
  }

  if (!Number.isFinite(data.latitude) || data.latitude < -90 || data.latitude > 90) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }

  if (!Number.isFinite(data.longitude) || data.longitude < -180 || data.longitude > 180) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  if (!data.primaryPhone.trim()) {
    errors.primaryPhone = "Primary phone is required.";
  } else if (!isValidPhone(data.primaryPhone)) {
    errors.primaryPhone = "Enter a valid phone number.";
  }

  if (data.secondaryPhone.trim() && !isValidPhone(data.secondaryPhone)) {
    errors.secondaryPhone = "Enter a valid phone number.";
  }

  if (data.whatsapp.trim() && !isValidPhone(data.whatsapp)) {
    errors.whatsapp = "Enter a valid WhatsApp number.";
  }

  if (data.email.trim() && !isValidEmail(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!Array.isArray(data.hours)) {
    errors.hours = "Opening hours are required.";
  } else {
    const days = new Set(data.hours.map((h) => h.day));
    for (const day of DAYS) {
      const entry = data.hours.find((h) => h.day === day);
      if (!entry) {
        errors[`hours_${day}` as keyof BranchInput] = "Missing hours.";
        continue;
      }
      if (!days.has(day)) {
        errors[`hours_${day}` as keyof BranchInput] = "Missing hours.";
      }
      if (!entry.closed) {
        if (!isValidTime(entry.open)) {
          errors[`hours_${day}_open` as keyof BranchInput] = "Invalid open time.";
        }
        if (!isValidTime(entry.close)) {
          errors[`hours_${day}_close` as keyof BranchInput] = "Invalid close time.";
        }
      }
    }
  }

  if (data.description.trim().length > 2000) {
    errors.description = "Must be 2000 characters or fewer.";
  }

  if (!Number.isInteger(data.displayOrder) || data.displayOrder < 0 || data.displayOrder > 9999) {
    errors.displayOrder = "Display order must be a whole number from 0–9999.";
  }

  return errors;
}
