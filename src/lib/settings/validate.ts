import { DAYS, type SettingsData, type SocialKey } from "./types";

export type SocialMediaErrorKey = `socialMedia_${SocialKey}`;

export type SettingsErrors = Partial<
  Record<keyof SettingsData | SocialMediaErrorKey, string>
>;

/** Platforms the admin manages (and therefore validates) in Settings → Social Media. */
export const MANAGED_SOCIAL_KEYS: SocialKey[] = [
  "facebook",
  "instagram",
  "tiktok",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  if (!value.trim()) return true;
  return PHONE_RE.test(value.trim());
}

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

export function isValidTime(value: string): boolean {
  return TIME_RE.test(value);
}

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Validate the full settings payload. Returns a map of field → error message. */
export function validateSettings(data: SettingsData): SettingsErrors {
  const errors: SettingsErrors = {};

  if (!data.restaurantName.trim()) {
    errors.restaurantName = "Restaurant name is required.";
  } else if (data.restaurantName.trim().length > 120) {
    errors.restaurantName = "Must be 120 characters or fewer.";
  }

  if (data.tagline.trim().length > 200) {
    errors.tagline = "Must be 200 characters or fewer.";
  }

  if (data.shortDescription.trim().length > 500) {
    errors.shortDescription = "Must be 500 characters or fewer.";
  }

  if (data.primaryPhone.trim() && !isValidPhone(data.primaryPhone)) {
    errors.primaryPhone = "Enter a valid phone number.";
  }

  if (data.secondaryPhone.trim() && !isValidPhone(data.secondaryPhone)) {
    errors.secondaryPhone = "Enter a valid phone number.";
  }

  if (data.whatsappNumber.trim() && !isValidPhone(data.whatsappNumber)) {
    errors.whatsappNumber = "Enter a valid phone number.";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  for (const day of DAYS) {
    const entry = data.businessHours.find((h) => h.day === day);
    if (!entry) continue;
    if (!entry.closed) {
      if (!isValidTime(entry.open)) {
        errors[`businessHours_${day}_open` as keyof SettingsData] = "Invalid open time.";
      }
      if (!isValidTime(entry.close)) {
        errors[`businessHours_${day}_close` as keyof SettingsData] = "Invalid close time.";
      }
    }
  }

  if (data.metaTitle.trim().length > 200) {
    errors.metaTitle = "Must be 200 characters or fewer.";
  }

  if (data.metaDescription.trim().length > 400) {
    errors.metaDescription = "Must be 400 characters or fewer.";
  }

  if (data.keywords.trim().length > 400) {
    errors.keywords = "Must be 400 characters or fewer.";
  }

  if (data.accentColor.trim() && !isValidHex(data.accentColor)) {
    errors.accentColor = "Use a hex color like #c9a227.";
  }

  if (data.primaryColor.trim() && !isValidHex(data.primaryColor)) {
    errors.primaryColor = "Use a hex color like #1a1a1a.";
  }

  if (data.secondaryColor.trim() && !isValidHex(data.secondaryColor)) {
    errors.secondaryColor = "Use a hex color like #f4f4f2.";
  }

  if (data.mapsEmbedUrl.trim() && !isValidUrl(data.mapsEmbedUrl)) {
    errors.mapsEmbedUrl = "Enter a valid URL.";
  }

  if (data.logoUrl.trim() && !isValidUrl(data.logoUrl)) {
    errors.logoUrl = "Enter a valid URL.";
  }

  if (data.faviconUrl.trim() && !isValidUrl(data.faviconUrl)) {
    errors.faviconUrl = "Enter a valid URL.";
  }

  if (data.ogImageUrl.trim() && !isValidUrl(data.ogImageUrl)) {
    errors.ogImageUrl = "Enter a valid URL.";
  }

  for (const key of MANAGED_SOCIAL_KEYS) {
    const social = data.socialMedia[key];
    if (!social || !social.enabled) continue;
    const url = social.url.trim();
    if (!url) {
      errors[`socialMedia_${key}` as SocialMediaErrorKey] =
        "Enter a URL for the enabled platform.";
    } else if (!isValidUrl(url)) {
      errors[`socialMedia_${key}` as SocialMediaErrorKey] = "Enter a valid URL.";
    }
  }

  if (!Number.isFinite(data.latitude) || data.latitude < -90 || data.latitude > 90) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }

  if (!Number.isFinite(data.longitude) || data.longitude < -180 || data.longitude > 180) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  return errors;
}
